/**
 * Extract Audio Task
 *
 * First task in the transcription workflow:
 * 1. Downloads audio/video file from Supabase Storage
 * 2. Extracts audio using FFmpeg (or processes audio file directly)
 * 3. Uploads extracted audio back to storage
 * 4. Updates job metadata with duration
 * 5. Triggers the transcribe-audio task
 */

import { logger, task, tasks, metadata } from "@trigger.dev/sdk";
import { createClient } from "@supabase/supabase-js";
import {
  extractAudioFromVideo,
  cleanupTempFile,
} from "../utils/ffmpeg";
import type { transcribeAudioTask } from "./transcribe-audio";
import type { chunkAudioTask } from "./chunk-audio";
import * as fs from "node:fs/promises";
import { updateJobMetadata } from "@/lib/jobs";

// Initialize Supabase client with service role
// This allows full access to storage without RLS restrictions
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export interface ExtractAudioPayload {
  jobId: string;
  userId: string;
  fileUrl: string; // Supabase Storage path (e.g., "media-uploads/user-id/file.mp4")
  fileName: string;
  fileType: "audio" | "video";
}

export const extractAudioTask = task({
  id: "extract-audio",
  run: async (payload: ExtractAudioPayload) => {
    const { jobId, userId, fileUrl, fileName, fileType } = payload;

    logger.info("Starting audio extraction", { jobId, fileName, fileType });

    // Update job status to processing at the very start
    await supabase
      .from("transcription_jobs")
      .update({
        status: "processing",
        progress_percentage: 10,
      })
      .eq("id", jobId);

    // Update progress: Starting
    metadata.root.set("progress", 10);
    metadata.root.set("currentStep", "Downloading file from storage");

    try {
      // Download file from Supabase Storage
      const { data: fileData, error: downloadError } =
        await supabase.storage.from("media-uploads").download(fileUrl);

      if (downloadError || !fileData) {
        throw new Error(`Failed to download file: ${downloadError?.message}`);
      }

      logger.info("File downloaded successfully", {
        fileSize: fileData.size,
      });

      // Update progress: Extracting audio
      metadata.root.set("progress", 15);
      metadata.root.set("currentStep", "Extracting audio with FFmpeg");

      // Convert Blob to Buffer
      const arrayBuffer = await fileData.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      logger.info("File downloaded and converted to buffer", {
        bufferSize: buffer.length,
        fileName,
      });

      // Extract audio using FFmpeg (now accepts Buffer, not stream)
      const { audioPath, metadata: audioMetadata } = await extractAudioFromVideo(
        buffer,
        fileName,
      );

      logger.info("Audio extracted successfully", {
        duration: audioMetadata.duration,
        format: audioMetadata.format,
        sampleRate: audioMetadata.sampleRate,
      });

      // Update job metadata with duration
      await updateJobMetadata(jobId, audioMetadata.duration);

      logger.info("Job metadata updated with duration", {
        duration: audioMetadata.duration,
      });

      // Update progress: Uploading extracted audio
      metadata.root.set("progress", 25);
      metadata.root.set("currentStep", "Uploading extracted audio");

      // Read extracted audio file
      const extractedAudioBuffer = await fs.readFile(audioPath);

      // Generate storage path for extracted audio (without bucket name prefix)
      const extractedAudioPath = `${userId}/extracted/${jobId}.mp3`;

      // Upload extracted audio to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("media-uploads")
        .upload(extractedAudioPath, extractedAudioBuffer, {
          contentType: "audio/mpeg",
          upsert: true,
        });

      if (uploadError) {
        throw new Error(
          `Failed to upload extracted audio: ${uploadError.message}`,
        );
      }

      logger.info("Extracted audio uploaded successfully", {
        path: extractedAudioPath,
      });

      // Check file size to determine routing (BEFORE cleanup)
      const audioStats = await fs.stat(audioPath);
      const fileSizeMB = audioStats.size / (1024 * 1024);
      const MAX_FILE_SIZE_MB = 20; // Safe under Whisper's 25MB limit
      const MAX_EXTRACTABLE_SIZE_MB = 500; // Max we can reasonably handle

      // Validate extracted audio size
      if (fileSizeMB > MAX_EXTRACTABLE_SIZE_MB) {
        await cleanupTempFile(audioPath);

        throw new Error(
          `Extracted audio is ${fileSizeMB.toFixed(0)}MB, which exceeds our ` +
          `processing limit of ${MAX_EXTRACTABLE_SIZE_MB}MB. This typically happens ` +
          `with very long recordings (2+ hours). Try uploading a shorter file or ` +
          `splitting it into segments before uploading.`
        );
      }

      // Clean up temporary file (AFTER getting stats)
      await cleanupTempFile(audioPath);

      metadata.root.set("progress", 30);
      metadata.root.set("currentStep", "Audio extraction complete");

      logger.info("Routing decision", {
        fileSizeMB: fileSizeMB.toFixed(2),
        duration: audioMetadata.duration,
        willChunk: fileSizeMB > MAX_FILE_SIZE_MB,
      });

      if (fileSizeMB > MAX_FILE_SIZE_MB) {
        // Large file - trigger chunking task and WAIT for completion
        logger.info("File exceeds size limit, triggering chunking", {
          fileSizeMB: fileSizeMB.toFixed(2),
          maxSizeMB: MAX_FILE_SIZE_MB,
        });

        const chunkResult = await tasks.triggerAndWait<typeof chunkAudioTask>(
          "chunk-audio",
          {
            jobId,
            userId,
            audioUrl: extractedAudioPath,
            duration: audioMetadata.duration,
          },
          {
            tags: [`user:${userId}`], // User scoping for token-level security
          }
        );

        logger.info("Chunk task completed", {
          chunkRunId: chunkResult.id,
        });

        return {
          success: true,
          audioPath: extractedAudioPath,
          duration: audioMetadata.duration,
          isChunked: true,
          chunkRunId: chunkResult.id,
        };
      } else {
        // Small file - go straight to transcription with single chunk and WAIT for completion
        logger.info("File within size limit, direct to transcription", {
          fileSizeMB: fileSizeMB.toFixed(2),
        });

        const transcribeResult = await tasks.triggerAndWait<typeof transcribeAudioTask>(
          "transcribe-audio",
          {
            jobId,
            userId,
            chunks: [
              {
                url: extractedAudioPath,
                offset: 0,
                duration: audioMetadata.duration,
              },
            ],
          },
          {
            tags: [`user:${userId}`], // User scoping for token-level security
          }
        );

        logger.info("Transcription task completed", {
          transcribeRunId: transcribeResult.id,
        });

        return {
          success: true,
          audioPath: extractedAudioPath,
          duration: audioMetadata.duration,
          isChunked: false,
          transcribeRunId: transcribeResult.id,
        };
      }
    } catch (error) {
      logger.error("Audio extraction failed", { error });

      // Update progress: Failed
      metadata.root.set("progress", 0);
      metadata.root.set("currentStep", "Audio extraction failed");
      metadata.root.set("error", error instanceof Error ? error.message : String(error));

      throw error;
    }
  },
});
