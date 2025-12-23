/**
 * Transcript Format Conversion Utilities
 *
 * Converts Whisper API responses to various transcript formats:
 * - Plain text (TXT)
 * - SubRip Subtitle (SRT)
 * - WebVTT (VTT)
 * - JSON with timestamps
 */

export interface WhisperSegment {
  id: number;
  seek: number;
  start: number;
  end: number;
  text: string;
  tokens: number[];
  temperature: number;
  avg_logprob: number;
  compression_ratio: number;
  no_speech_prob: number;
}

export interface WhisperWord {
  word: string;
  start: number;
  end: number;
}

export interface WhisperResponse {
  task: string;
  language: string;
  duration: number;
  text: string;
  segments: WhisperSegment[];
  words?: WhisperWord[]; // Only present with word-level timestamps
}

/**
 * Convert Whisper response to plain text
 *
 * @param whisperData - Whisper API response
 * @returns Plain text transcript
 */
export function whisperToPlainText(whisperData: WhisperResponse): string {
  return whisperData.text.trim();
}

/**
 * Convert Whisper response to SRT (SubRip Subtitle) format
 *
 * @param whisperData - Whisper API response
 * @returns SRT formatted string
 */
export function whisperToSRT(whisperData: WhisperResponse): string {
  const srtBlocks: string[] = [];

  whisperData.segments.forEach((segment, index) => {
    const sequenceNumber = index + 1;
    const startTime = formatSRTTime(segment.start);
    const endTime = formatSRTTime(segment.end);
    const text = segment.text.trim();

    srtBlocks.push(
      `${sequenceNumber}\n${startTime} --> ${endTime}\n${text}\n`,
    );
  });

  return srtBlocks.join("\n");
}

/**
 * Convert Whisper response to WebVTT format
 *
 * @param whisperData - Whisper API response
 * @returns VTT formatted string
 */
export function whisperToVTT(whisperData: WhisperResponse): string {
  const vttBlocks: string[] = ["WEBVTT\n"];

  whisperData.segments.forEach((segment) => {
    const startTime = formatVTTTime(segment.start);
    const endTime = formatVTTTime(segment.end);
    const text = segment.text.trim();

    vttBlocks.push(`${startTime} --> ${endTime}\n${text}\n`);
  });

  return vttBlocks.join("\n");
}

/**
 * Convert Whisper response to JSON format with segments
 *
 * @param whisperData - Whisper API response
 * @returns JSON string with structured transcript data
 */
export function whisperToJSON(whisperData: WhisperResponse): string {
  const jsonData = {
    language: whisperData.language,
    duration: whisperData.duration,
    text: whisperData.text,
    segments: whisperData.segments.map((segment) => ({
      id: segment.id,
      start: segment.start,
      end: segment.end,
      text: segment.text.trim(),
    })),
  };

  return JSON.stringify(jsonData, null, 2);
}

/**
 * Convert Whisper response to verbose JSON (includes all metadata)
 * Only available for Pro tier
 *
 * @param whisperData - Whisper API response
 * @returns Verbose JSON string
 */
export function whisperToVerboseJSON(whisperData: WhisperResponse): string {
  return JSON.stringify(whisperData, null, 2);
}

/**
 * Extract word-level timestamps if available (Creator/Pro tiers)
 *
 * @param whisperData - Whisper API response
 * @returns Word timestamps or null if not available
 */
export function extractWordTimestamps(
  whisperData: WhisperResponse,
): WhisperWord[] | null {
  return whisperData.words || null;
}

/**
 * Format time in seconds to SRT time format (HH:MM:SS,mmm)
 *
 * @param seconds - Time in seconds
 * @returns SRT formatted time string
 */
function formatSRTTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const milliseconds = Math.floor((seconds % 1) * 1000);

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")},${String(milliseconds).padStart(3, "0")}`;
}

/**
 * Format time in seconds to WebVTT time format (HH:MM:SS.mmm)
 *
 * @param seconds - Time in seconds
 * @returns VTT formatted time string
 */
function formatVTTTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const milliseconds = Math.floor((seconds % 1) * 1000);

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}.${String(milliseconds).padStart(3, "0")}`;
}

/**
 * Adjust timestamps in a Whisper response by adding an offset
 * Used when merging multiple chunks back together
 *
 * @param whisperData - Whisper API response
 * @param offsetSeconds - Time offset to add to all timestamps
 * @returns Whisper response with adjusted timestamps
 */
export function adjustTimestamps(
  whisperData: WhisperResponse,
  offsetSeconds: number,
): WhisperResponse {
  return {
    ...whisperData,
    segments: whisperData.segments.map((segment) => ({
      ...segment,
      start: segment.start + offsetSeconds,
      end: segment.end + offsetSeconds,
    })),
    words: whisperData.words?.map((word) => ({
      ...word,
      start: word.start + offsetSeconds,
      end: word.end + offsetSeconds,
    })),
  };
}

/**
 * Merge multiple Whisper responses into a single response
 * Combines segments and words from all chunks in order
 *
 * @param transcripts - Array of Whisper responses (with adjusted timestamps)
 * @returns Merged Whisper response
 */
export function mergeTranscripts(
  transcripts: WhisperResponse[],
): WhisperResponse {
  if (transcripts.length === 0) {
    throw new Error("Cannot merge empty transcript array");
  }

  if (transcripts.length === 1) {
    return transcripts[0];
  }

  // Combine all text
  const mergedText = transcripts.map((t) => t.text.trim()).join(" ");

  // Combine all segments and re-index
  const mergedSegments: WhisperSegment[] = [];
  let segmentIndex = 0;

  for (const transcript of transcripts) {
    for (const segment of transcript.segments) {
      mergedSegments.push({
        ...segment,
        id: segmentIndex++,
      });
    }
  }

  // Combine all words (if present)
  let mergedWords: WhisperWord[] | undefined;
  if (transcripts.every((t) => t.words)) {
    mergedWords = transcripts.flatMap((t) => t.words || []);
  }

  // Calculate total duration from last segment
  const lastSegment = mergedSegments[mergedSegments.length - 1];
  const totalDuration = lastSegment ? lastSegment.end : 0;

  return {
    task: transcripts[0].task,
    language: transcripts[0].language,
    duration: totalDuration,
    text: mergedText,
    segments: mergedSegments,
    words: mergedWords,
  };
}
