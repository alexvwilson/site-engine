import { useMemo } from "react";

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

interface UseTranscriptSearchReturn {
  filteredSegments: TranscriptSegment[] | null;
  filteredWords: WordTimestamp[] | null;
}

/**
 * Hook for filtering transcript segments and words based on search query
 * Provides optimized search filtering for both segment and word-level views
 */
export function useTranscriptSearch(
  validatedSegments: TranscriptSegment[] | null,
  validatedWords: WordTimestamp[] | null,
  searchQuery: string
): UseTranscriptSearchReturn {
  // Filter segments based on search query with performance optimization
  const filteredSegments = useMemo((): TranscriptSegment[] | null => {
    if (!validatedSegments) {
      return null;
    }

    if (!searchQuery.trim()) {
      return validatedSegments;
    }

    const lowerQuery = searchQuery.toLowerCase();
    return validatedSegments.filter((segment) =>
      segment.text.toLowerCase().includes(lowerQuery)
    );
  }, [validatedSegments, searchQuery]);

  // Filter individual words based on search query for word-level view
  const filteredWords = useMemo((): WordTimestamp[] | null => {
    if (!validatedWords) {
      return null;
    }

    if (!searchQuery.trim()) {
      return validatedWords;
    }

    const lowerQuery = searchQuery.toLowerCase();
    return validatedWords.filter((word) =>
      word.word.toLowerCase().includes(lowerQuery)
    );
  }, [validatedWords, searchQuery]);

  return {
    filteredSegments,
    filteredWords,
  };
}
