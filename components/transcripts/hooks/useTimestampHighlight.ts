import { useState, useEffect, useRef } from "react";

interface TranscriptSegment {
  id?: number;
  start: number;
  end: number;
  text: string;
}

interface UseTimestampHighlightReturn {
  highlightedSegmentId: number | null;
  segmentRefs: React.MutableRefObject<Map<number, HTMLDivElement>>;
}

/**
 * Hook for managing timestamp-based segment highlighting and scrolling
 * Finds closest segment to timestamp, scrolls to it, and highlights temporarily
 */
export function useTimestampHighlight(
  highlightTimestamp: number | null | undefined,
  validatedSegments: TranscriptSegment[] | null
): UseTimestampHighlightReturn {
  const [highlightedSegmentId, setHighlightedSegmentId] = useState<
    number | null
  >(null);
  const segmentRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // Scroll to and highlight segment when timestamp provided
  useEffect(() => {
    if (
      highlightTimestamp === null ||
      highlightTimestamp === undefined ||
      !validatedSegments
    ) {
      return;
    }

    // Find the closest segment whose start time is at or before the timestamp
    // This ensures clicking [7:27] finds the segment starting at 7:27, not the one ending at 7:27
    let segment = null;
    let closestDiff = Infinity;

    for (let i = 0; i < validatedSegments.length; i++) {
      const currentSeg = validatedSegments[i];
      const diff = Math.abs(currentSeg.start - highlightTimestamp);

      // If this segment starts closer to the target timestamp, use it
      if (diff < closestDiff) {
        closestDiff = diff;
        segment = currentSeg;
      }
    }

    if (segment) {
      const segmentId = segment.id ?? validatedSegments.indexOf(segment);
      setHighlightedSegmentId(segmentId);

      const element = segmentRefs.current.get(segmentId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }

      const timeout = setTimeout(() => setHighlightedSegmentId(null), 3000);
      return () => clearTimeout(timeout);
    }
  }, [highlightTimestamp, validatedSegments]);

  return {
    highlightedSegmentId,
    segmentRefs,
  };
}
