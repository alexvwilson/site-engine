/**
 * Transcribe Audio Task
 *
 * Second task in the transcription workflow:
 * 1. Downloads extracted audio from Supabase Storage
 * 2. Transcribes audio using OpenAI Whisper API
 * 3. Converts transcript to multiple formats (TXT, SRT, VTT, JSON)
 * 4. Saves transcript to database
 * 5. Marks job as completed
 */

import { logger, task, metadata } from "@trigger.dev/sdk";
import { createClient } from "@supabase/supabase-js";
import { openai } from "../utils/openai";
import {
  whisperToPlainText,
  whisperToSRT,
  whisperToVTT,
  whisperToJSON,
  whisperToVerboseJSON,
  extractWordTimestamps,
  adjustTimestamps,
  mergeTranscripts,
  type WhisperResponse,
} from "../utils/formats";
import type { AudioChunkRef } from "./chunk-audio";
import * as fs from "node:fs";
import * as fsp from "node:fs/promises";
import * as path from "node:path";
import * as os from "os";

// Initialize Supabase client with service role
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface TranscribeAudioPayload {
  jobId: string;
  userId: string;
  chunks: AudioChunkRef[]; // Array of audio chunks (single item for small files, multiple for large)
}

export const transcribeAudioTask = task({
  id: "transcribe-audio",
  run: async (payload: TranscribeAudioPayload) => {
    const { jobId, userId, chunks } = payload;

    logger.info("Starting Whisper transcription", {
      jobId,
      chunkCount: chunks.length,
      totalDuration: chunks.reduce((sum, c) => sum + c.duration, 0),
    });

    // Update job status to processing
    await supabase
      .from("transcription_jobs")
      .update({
        status: "processing",
        progress_percentage: 35,
      })
      .eq("id", jobId);

    // Update progress: Starting
    metadata.root.set("progress", 35);
    metadata.root.set(
      "currentStep",
      `Transcribing ${chunks.length} chunk${chunks.length > 1 ? "s" : ""}`
    );

    try {
      // Fetch job details to get language and timestamp preferences
      const { data: jobData } = await supabase
        .from("transcription_jobs")
        .select("language, timestamp_granularity")
        .eq("id", jobId)
        .single();

      const language = jobData?.language || "auto";
      const timestampGranularity = jobData?.timestamp_granularity || "segment";

      // Process all chunks in PARALLEL through Whisper API
      const baseProgress = 35;
      const progressRange = 55; // 35% to 90%

      logger.info("Starting parallel chunk processing", {
        chunkCount: chunks.length,
        parallelProcessing: true,
      });

      metadata.root.set("progress", baseProgress);
      metadata.root.set(
        "currentStep",
        `Transcribing ${chunks.length} chunk(s) in parallel`
      );

      // Track completed chunks for progress updates
      let completedChunks = 0;
      const progressPerChunk = progressRange / chunks.length;

      // Define chunk processing function
      const processChunk = async (
        chunk: AudioChunkRef,
        index: number
      ): Promise<WhisperResponse> => {
        const chunkNumber = index + 1;

        logger.info(
          `[Chunk ${chunkNumber}/${chunks.length}] Starting processing`,
          {
            url: chunk.url,
            offset: chunk.offset,
            duration: chunk.duration,
          }
        );

        try {
          // Download chunk from Supabase Storage
          const { data: chunkData, error: downloadError } =
            await supabase.storage.from("media-uploads").download(chunk.url);

          if (downloadError || !chunkData) {
            throw new Error(
              `Failed to download chunk ${chunkNumber}: ${downloadError?.message}`
            );
          }

          // Save chunk to temp file for Whisper API
          const tempChunkPath = path.join(
            os.tmpdir(),
            `whisper_${jobId}_chunk_${index}.wav`
          );

          const chunkBuffer = Buffer.from(await chunkData.arrayBuffer());
          await fsp.writeFile(tempChunkPath, chunkBuffer);

          // Call Whisper API
          const transcription = await openai.audio.transcriptions.create({
            file: fs.createReadStream(tempChunkPath),
            model: "whisper-1",
            language: language === "auto" ? undefined : language,
            response_format: "verbose_json",
            timestamp_granularities:
              timestampGranularity === "word"
                ? ["segment", "word"]
                : ["segment"],
          });

          // Clean up temp chunk file
          await fsp.unlink(tempChunkPath);

          // Adjust timestamps by chunk offset
          const adjustedTranscript = adjustTimestamps(
            transcription as unknown as WhisperResponse,
            chunk.offset
          );

          // Update progress after chunk completion
          completedChunks++;
          const currentProgress = Math.round(
            baseProgress + completedChunks * progressPerChunk
          );
          metadata.root.set("progress", currentProgress);
          metadata.root.set(
            "currentStep",
            `Transcribed ${completedChunks}/${chunks.length} chunks`
          );

          logger.info(
            `[Chunk ${chunkNumber}/${chunks.length}] Transcription complete`,
            {
              segments: adjustedTranscript.segments.length,
              detectedLanguage: transcription.language,
              progress: currentProgress,
            }
          );

          return adjustedTranscript;
        } catch (error) {
          logger.error(`[Chunk ${chunkNumber}/${chunks.length}] Failed`, {
            error,
            chunk,
          });
          throw error;
        }
      };

      // Process all chunks in parallel
      const transcripts: WhisperResponse[] = await Promise.all(
        chunks.map((chunk, index) => processChunk(chunk, index))
      );

      logger.info("All chunks transcribed successfully", {
        totalChunks: transcripts.length,
        parallelProcessing: true,
      });

      // Merge all transcripts into one
      metadata.root.set("progress", 90);
      metadata.root.set("currentStep", "Merging transcripts");

      const mergedTranscript = mergeTranscripts(transcripts);

      logger.info("Whisper transcription complete", {
        detectedLanguage: mergedTranscript.language,
        duration: mergedTranscript.duration,
        chunkCount: chunks.length,
      });

      // Update progress: Converting formats
      metadata.root.set("progress", 92);
      metadata.root.set("currentStep", "Converting transcript formats");

      // Generate all transcript formats from merged transcript
      const transcriptText = whisperToPlainText(mergedTranscript);
      const transcriptSRT = whisperToSRT(mergedTranscript);
      const transcriptVTT = whisperToVTT(mergedTranscript);
      const transcriptJSON = whisperToJSON(mergedTranscript);
      const transcriptVerboseJSON = whisperToVerboseJSON(mergedTranscript);
      const wordTimestamps = extractWordTimestamps(mergedTranscript);

      // Update progress: Saving to database
      metadata.root.set("progress", 94);
      metadata.root.set("currentStep", "Saving transcript to database");

      // Save transcript to database using raw SQL
      const { data: transcriptRecord, error: insertError } = await supabase
        .from("transcripts")
        .insert({
          job_id: jobId,
          user_id: userId,
          transcript_text_plain: transcriptText,
          transcript_srt: transcriptSRT,
          transcript_vtt: transcriptVTT,
          transcript_json: JSON.parse(transcriptJSON),
          transcript_verbose_json: JSON.parse(transcriptVerboseJSON),
          word_timestamps: wordTimestamps,
          detected_language: mergedTranscript.language,
          duration_seconds: Math.round(mergedTranscript.duration), // Round to nearest integer
        })
        .select("id")
        .single();

      if (insertError) {
        throw new Error(`Failed to save transcript: ${insertError.message}`);
      }

      logger.info("Transcript saved to database", {
        transcriptId: transcriptRecord.id,
      });

      // Update progress: Finalizing transcription
      metadata.root.set("progress", 98);
      metadata.root.set("currentStep", "Finalizing transcription");

      // Update progress to 100% BEFORE marking database as completed
      // This ensures UI sees 100% before Trigger.dev run status becomes COMPLETED
      metadata.root.set("progress", 100);
      metadata.root.set("currentStep", "Transcription complete");

      // Mark job as completed - no tier-based logic, no auto-summary
      const { error: completeError } = await supabase
        .from("transcription_jobs")
        .update({
          status: "completed",
          progress_percentage: 100,
          completed_at: new Date().toISOString(),
        })
        .eq("id", jobId);

      if (completeError) {
        logger.error("Failed to mark job as completed", {
          completeError,
          jobId,
        });
        throw new Error(
          `Failed to update job status: ${completeError.message}`
        );
      }

      logger.info("Transcription job completed successfully", { jobId });

      return {
        success: true,
        transcriptId: transcriptRecord.id,
        detectedLanguage: mergedTranscript.language,
        duration: mergedTranscript.duration,
      };
    } catch (error) {
      logger.error("Transcription failed", { error });

      // Update progress: Failed
      metadata.root.set("progress", 0);
      metadata.root.set("currentStep", "Transcription failed");
      metadata.root.set(
        "error",
        error instanceof Error ? error.message : String(error)
      );

      // Update job status to failed
      await supabase
        .from("transcription_jobs")
        .update({
          status: "failed",
          error_message: error instanceof Error ? error.message : String(error),
        })
        .eq("id", jobId);

      throw error;
    }
  },
});
