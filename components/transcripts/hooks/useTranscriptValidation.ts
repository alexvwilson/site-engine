import { useMemo } from "react";
import { logger } from "@/lib/logger";

interface TranscriptSegment {
  id?: number;
  start: number;
  end: number;
  text: string;
}

interface WordTimestamp {
  word: string;
  start: number;
  end: number;
}

interface TranscriptJSON {
  segments?: TranscriptSegment[];
  language?: string;
  duration?: number;
  text?: string;
}

interface UseTranscriptValidationReturn {
  validatedSegments: TranscriptSegment[] | null;
  validatedWords: WordTimestamp[] | null;
  hasWordLevelData: boolean;
}

/**
 * Hook for validating and processing transcript data
 * Handles segment and word-level validation with error handling
 */
export function useTranscriptValidation(
  transcriptJson: unknown,
  wordTimestamps: unknown
): UseTranscriptValidationReturn {
  // Parse and validate segments with comprehensive error handling
  const validatedSegments = useMemo((): TranscriptSegment[] | null => {
    try {
      // Check if transcript_json exists and is not null
      if (!transcriptJson) {
        logger.warn("transcript_json is null or undefined");
        return null;
      }

      // Parse the JSON data
      const jsonData = transcriptJson as TranscriptJSON;

      // Validate segments array exists
      if (!jsonData.segments || !Array.isArray(jsonData.segments)) {
        logger.warn("segments array is missing or not an array");
        return null;
      }

      // Validate and filter segments
      const validSegments = jsonData.segments.filter((segment) => {
        // Check if segment has required fields
        if (!segment || typeof segment !== "object") {
          return false;
        }

        // Validate text field
        if (
          typeof segment.text !== "string" ||
          segment.text.trim().length === 0
        ) {
          return false;
        }

        // Validate start timestamp
        if (
          typeof segment.start !== "number" ||
          isNaN(segment.start) ||
          segment.start < 0
        ) {
          return false;
        }

        return true;
      });

      // Return null if no valid segments found
      if (validSegments.length === 0) {
        logger.warn("No valid segments found after filtering");
        return null;
      }

      return validSegments;
    } catch (error) {
      console.error("Error validating transcript segments:", error);
      return null;
    }
  }, [transcriptJson]);

  // Validate and filter word timestamps for word-level view
  const validatedWords = useMemo((): WordTimestamp[] | null => {
    if (
      !wordTimestamps ||
      !Array.isArray(wordTimestamps) ||
      wordTimestamps.length === 0
    ) {
      return null;
    }

    const wordTimestampsArray = wordTimestamps as WordTimestamp[];

    // Validate each word timestamp
    return wordTimestampsArray.filter(
      (word) =>
        word &&
        typeof word.word === "string" &&
        word.word.trim().length > 0 &&
        typeof word.start === "number" &&
        !isNaN(word.start)
    );
  }, [wordTimestamps]);

  // Check if word-level data is available
  const hasWordLevelData = useMemo((): boolean => {
    return !!(
      wordTimestamps &&
      Array.isArray(wordTimestamps) &&
      wordTimestamps.length > 0
    );
  }, [wordTimestamps]);

  return {
    validatedSegments,
    validatedWords,
    hasWordLevelData,
  };
}
