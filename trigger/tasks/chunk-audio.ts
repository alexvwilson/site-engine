/**
 * Chunk Audio Task
 *
 * Optional task in the transcription workflow (only for files > 20MB):
 * 1. Downloads large audio file from Supabase Storage
 * 2. Splits into 10-minute chunks using FFmpeg
 * 3. Uploads each chunk to Supabase Storage
 * 4. Triggers transcribe-audio with array of chunks
 *
 * This task handles the Whisper API 25MB file size limit by splitting
 * large files into smaller chunks that can be transcribed individually.
 */

import { logger, task, tasks, metadata } from "@trigger.dev/sdk";
import { createClient } from "@supabase/supabase-js";
import { splitAudioIntoChunks, cleanupTempFile } from "../utils/ffmpeg";
import type { transcribeAudioTask } from "./transcribe-audio";
import * as fsp from "node:fs/promises";

// Initialize Supabase client with service role
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export interface ChunkAudioPayload {
  jobId: string;
  userId: string;
  audioUrl: string; // Supabase Storage path to large audio file
  duration: number; // Total duration in seconds
}

export interface AudioChunkRef {
  url: string; // Supabase Storage path
  offset: number; // Start time in seconds
  duration: number; // Duration in seconds
}

export const chunkAudioTask = task({
  id: "chunk-audio",
  run: async (payload: ChunkAudioPayload) => {
    const { jobId, userId, audioUrl, duration } = payload;

    logger.info("Starting audio chunking", {
      jobId,
      audioUrl,
      duration,
      estimatedChunks: Math.ceil(duration / 600),
    });

    metadata.root.set("progress", 32);
    metadata.root.set("currentStep", "Downloading large audio file");

    try {
      // Download the large audio file from Supabase Storage
      const { data: audioData, error: downloadError } =
        await supabase.storage.from("media-uploads").download(audioUrl);

      if (downloadError || !audioData) {
        throw new Error(`Failed to download audio: ${downloadError?.message}`);
      }

      logger.info("Audio file downloaded", {
        size: audioData.size,
      });

      metadata.root.set("progress", 33);
      metadata.root.set("currentStep", "Splitting into 10-minute chunks");

      // Write to temporary file for FFmpeg processing
      const tempInputPath = `/tmp/chunking_input_${jobId}.mp3`;
      const audioBuffer = Buffer.from(await audioData.arrayBuffer());
      await fsp.writeFile(tempInputPath, audioBuffer);

      // Split audio into 10-minute chunks
      const CHUNK_DURATION = 600; // 10 minutes
      const chunks = await splitAudioIntoChunks(
        tempInputPath,
        CHUNK_DURATION,
        duration,
      );

      logger.info("Audio split into chunks", {
        chunkCount: chunks.length,
      });

      metadata.root.set("progress", 34);
      metadata.root.set(
        "currentStep",
        `Uploading ${chunks.length} chunks to storage`,
      );

      // Upload each chunk to Supabase Storage
      const chunkRefs: AudioChunkRef[] = [];

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const chunkFileName = `chunk_${i}.mp3`;
        const storagePath = `${userId}/${jobId}/${chunkFileName}`;

        // Read chunk file
        const chunkBuffer = await fsp.readFile(chunk.path);

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from("media-uploads")
          .upload(storagePath, chunkBuffer, {
            contentType: "audio/mpeg",
            upsert: true,
          });

        if (uploadError) {
          throw new Error(
            `Failed to upload chunk ${i}: ${uploadError.message}`,
          );
        }

        chunkRefs.push({
          url: storagePath,
          offset: chunk.offset,
          duration: chunk.duration,
        });

        // Clean up chunk file
        await cleanupTempFile(chunk.path);

        logger.info(`Uploaded chunk ${i + 1}/${chunks.length}`);
      }

      // Clean up temp input file
      await cleanupTempFile(tempInputPath);

      metadata.root.set("progress", 35);
      metadata.root.set("currentStep", "Starting transcription of chunks");

      // Trigger transcribe-audio task with array of chunks and WAIT for completion
      const transcribeResult = await tasks.triggerAndWait<typeof transcribeAudioTask>(
        "transcribe-audio",
        {
          jobId,
          userId,
          chunks: chunkRefs,
        },
        {
          tags: [`user:${userId}`], // User scoping for token-level security
        }
      );

      logger.info("Transcribe-audio task completed", {
        transcribeRunId: transcribeResult.id,
        chunkCount: chunkRefs.length,
      });

      return {
        success: true,
        chunkCount: chunkRefs.length,
        transcribeRunId: transcribeResult.id,
      };
    } catch (error) {
      logger.error("Audio chunking failed", { error });

      metadata.root.set("progress", 0);
      metadata.root.set("currentStep", "Chunking failed");
      metadata.root.set(
        "error",
        error instanceof Error ? error.message : String(error),
      );

      throw error;
    }
  },
});
