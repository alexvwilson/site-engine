/**
 * FFmpeg Utilities for Audio/Video Processing
 *
 * Provides functions to extract audio from video files and get metadata.
 * Uses fluent-ffmpeg with the FFmpeg binary provided by Trigger.dev's build extension.
 */

import ffmpeg from "fluent-ffmpeg";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as os from "os";
import type { FfprobeData } from "fluent-ffmpeg";
import { logger } from "@/lib/logger";

// Set FFmpeg binary paths (provided by Trigger.dev FFmpeg extension in production)
// In local development, fall back to system-installed FFmpeg
if (process.env.FFMPEG_PATH) {
  ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH);
  logger.debug({ path: process.env.FFMPEG_PATH }, "Using FFMPEG_PATH");
} else {
  logger.debug("FFMPEG_PATH not set - using system FFmpeg (dev mode)");
}
if (process.env.FFPROBE_PATH) {
  ffmpeg.setFfprobePath(process.env.FFPROBE_PATH);
  logger.debug({ path: process.env.FFPROBE_PATH }, "Using FFPROBE_PATH");
} else {
  logger.debug("FFPROBE_PATH not set - using system ffprobe (dev mode)");
}

export interface AudioMetadata {
  duration: number; // Duration in seconds
  format: string; // Audio format (e.g., "mp3", "wav")
  bitrate: number; // Bitrate in kbps
  sampleRate: number; // Sample rate in Hz
  channels: number; // Number of audio channels
}

export interface ExtractedAudio {
  audioPath: string; // Path to extracted audio file
  metadata: AudioMetadata;
}

/**
 * Extract audio from a video file or process an audio file
 *
 * NEW APPROACH: Write to temp file first, then process with FFmpeg
 * This is more reliable in Trigger.dev environment than streaming
 *
 * @param inputBuffer - Buffer containing the video/audio file data
 * @param originalFilename - Original filename (for determining format)
 * @returns Path to extracted/processed audio file and metadata
 */
export async function extractAudioFromVideo(
  inputBuffer: Buffer,
  originalFilename: string,
): Promise<ExtractedAudio> {
  const tempDirectory = os.tmpdir();
  const fileExtension = path.extname(originalFilename).toLowerCase();

  logger.debug({
    originalFilename,
    fileExtension,
    inputSize: inputBuffer.length,
    tempDirectory,
    ffmpegPath: process.env.FFMPEG_PATH || "not set",
    ffprobePath: process.env.FFPROBE_PATH || "not set",
  }, "Starting extraction");

  // Determine if file is video or audio
  const videoExtensions = [".mp4", ".mov", ".avi", ".mkv", ".webm"];
  const audioExtensions = [".mp3", ".wav", ".m4a", ".aac", ".ogg"];
  const isVideo = videoExtensions.includes(fileExtension);
  const isAudio = audioExtensions.includes(fileExtension);

  if (!isVideo && !isAudio) {
    throw new Error(
      `Unsupported file format: ${fileExtension}. Supported formats: ${[...videoExtensions, ...audioExtensions].join(", ")}`,
    );
  }

  // Write input file to disk first (more reliable than streaming in Trigger.dev)
  const inputFilename = `input_${Date.now()}${fileExtension}`;
  const inputPath = path.join(tempDirectory, inputFilename);

  // Generate output path (always convert to MP3 for efficient processing)
  const outputFilename = `audio_${Date.now()}.mp3`;
  const outputPath = path.join(tempDirectory, outputFilename);

  logger.debug({ inputPath, outputPath }, "FFmpeg paths");

  let inputFileCreated = false;

  try {
    // Write input buffer to temp file
    await fs.writeFile(inputPath, inputBuffer);
    inputFileCreated = true;
    logger.debug("Input file written to disk");

    // Verify input file was written correctly
    const inputStats = await fs.stat(inputPath);
    logger.debug({ size: inputStats.size }, "Input file size on disk");

    if (inputStats.size === 0) {
      throw new Error("Input file is empty (0 bytes)");
    }

    // Process with FFmpeg using file path (not stream)
    await new Promise<void>((resolve, reject) => {
      ffmpeg(inputPath)
        .outputOptions([
          "-vn", // Disable video output
          "-acodec libmp3lame", // Use MP3 encoding for efficient compression
          "-b:a 128k", // 128kbps bitrate (excellent quality for speech)
          "-ar 16000", // Set audio sample rate to 16 kHz (optimal for Whisper)
          "-ac 1", // Set to mono (Whisper works best with mono)
        ])
        .output(outputPath)
        .on("start", (commandLine) => {
          logger.debug({ commandLine }, "FFmpeg started command");
        })
        .on("end", () => {
          logger.debug("FFmpeg processing complete");
          resolve();
        })
        .on("error", (err) => {
          logger.error({ error: err.message }, "FFmpeg error");
          reject(new Error(`FFmpeg processing failed: ${err.message}`));
        })
        .run();
    });

    // Verify the output file was created and has reasonable size
    const stats = await fs.stat(outputPath);
    logger.debug({ size: stats.size }, "FFmpeg output file size");

    if (stats.size < 1000) {
      throw new Error(
        `FFmpeg produced suspiciously small file (${stats.size} bytes). ` +
        `This usually means the input file had no audio or FFmpeg failed silently. ` +
        `Check that the video file "${originalFilename}" contains an audio track.`
      );
    }

    // Get metadata from the output file
    const metadata = await getAudioMetadata(outputPath);
    logger.debug({ metadata }, "Audio metadata");

    // Clean up input file (we don't need it anymore)
    if (inputFileCreated) {
      try {
        await fs.unlink(inputPath);
        logger.debug("Input file cleaned up");
      } catch (cleanupError) {
        logger.warn({ error: cleanupError }, "Failed to cleanup input file");
      }
    }

    return {
      audioPath: outputPath,
      metadata,
    };
  } catch (error) {
    // Clean up on error
    try {
      if (inputFileCreated) {
        await fs.unlink(inputPath);
      }
      await fs.unlink(outputPath);
    } catch {
      // Ignore cleanup errors
    }

    throw error;
  }
}

/**
 * Get metadata from an audio file using ffprobe
 *
 * @param audioPath - Path to the audio file
 * @returns Audio metadata (duration, format, bitrate, etc.)
 */
export async function getAudioMetadata(
  audioPath: string,
): Promise<AudioMetadata> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(audioPath, (err, data: FfprobeData) => {
      if (err) {
        return reject(
          new Error(`Failed to get audio metadata: ${err.message}`),
        );
      }

      const audioStream = data.streams.find(
        (stream) => stream.codec_type === "audio",
      );

      if (!audioStream) {
        return reject(new Error("No audio stream found in file"));
      }

      const duration = data.format.duration || 0;
      const format = data.format.format_name || "unknown";
      const bitrate = data.format.bit_rate
        ? Math.round(parseInt(String(data.format.bit_rate)) / 1000)
        : 0;
      const sampleRate = audioStream.sample_rate
        ? parseInt(String(audioStream.sample_rate))
        : 0;
      const channels = audioStream.channels || 0;

      resolve({
        duration: Math.floor(duration),
        format,
        bitrate,
        sampleRate,
        channels,
      });
    });
  });
}

/**
 * Clean up a temporary audio file
 *
 * @param audioPath - Path to the temporary audio file
 */
export async function cleanupTempFile(audioPath: string): Promise<void> {
  try {
    await fs.unlink(audioPath);
  } catch (error) {
    logger.error({ audioPath, error }, "Failed to cleanup temp file");
  }
}

/**
 * Chunk metadata for audio splitting
 */
export interface AudioChunk {
  path: string; // Local file path of chunk
  offset: number; // Start time in seconds
  duration: number; // Duration in seconds
}

/**
 * Split audio file into chunks using FFmpeg
 * Each chunk is a 10-minute segment (or remaining duration for last chunk)
 *
 * @param inputPath - Path to the input audio file
 * @param chunkDurationSeconds - Duration of each chunk (default: 600 = 10 minutes)
 * @param totalDuration - Total duration of audio in seconds
 * @returns Array of chunk metadata
 */
export async function splitAudioIntoChunks(
  inputPath: string,
  chunkDurationSeconds: number = 600,
  totalDuration: number,
): Promise<AudioChunk[]> {
  return new Promise((resolve, reject) => {
    const chunks: AudioChunk[] = [];
    const numChunks = Math.ceil(totalDuration / chunkDurationSeconds);

    let completedChunks = 0;

    // Process each chunk
    for (let i = 0; i < numChunks; i++) {
      const startTime = i * chunkDurationSeconds;
      const chunkPath = path.join(
        os.tmpdir(),
        `chunk_${i}_${Date.now()}.mp3`,
      );

      ffmpeg(inputPath)
        .setStartTime(startTime)
        .setDuration(chunkDurationSeconds)
        .audioFrequency(16000)
        .audioChannels(1)
        .audioCodec("libmp3lame")
        .audioBitrate(128)
        .format("mp3")
        .on("end", () => {
          const actualDuration =
            i === numChunks - 1
              ? totalDuration - startTime
              : chunkDurationSeconds;

          chunks.push({
            path: chunkPath,
            offset: startTime,
            duration: actualDuration,
          });

          completedChunks++;
          if (completedChunks === numChunks) {
            // Sort by offset to ensure correct order
            chunks.sort((a, b) => a.offset - b.offset);
            resolve(chunks);
          }
        })
        .on("error", (err) => {
          reject(
            new Error(`Failed to create chunk ${i}: ${err.message}`),
          );
        })
        .save(chunkPath);
    }
  });
}

/**
 * Validate that a file type is supported for processing
 *
 * @param filename - Original filename
 * @returns true if supported, false otherwise
 */
export function isSupportedMediaFile(filename: string): boolean {
  const extension = path.extname(filename).toLowerCase();
  const supportedExtensions = [
    ".mp3",
    ".mp4",
    ".wav",
    ".mov",
    ".m4a",
    ".aac",
    ".ogg",
    ".avi",
    ".mkv",
    ".webm",
  ];

  return supportedExtensions.includes(extension);
}
