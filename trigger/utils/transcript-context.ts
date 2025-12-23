interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
}

export function buildTranscriptContext(
  plainText: string,
  segments: TranscriptSegment[],
): string {
  if (!segments || segments.length === 0) {
    return `Transcript:\n${plainText}`;
  }

  const segmentsText = segments
    .map((seg) => {
      const timestamp = formatTimestamp(seg.start);
      return `[${timestamp}] ${seg.text}`;
    })
    .join("\n");

  return `Transcript with timestamps:\n${segmentsText}`;
}

export function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
