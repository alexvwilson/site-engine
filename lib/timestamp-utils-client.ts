/**
 * Client-safe timestamp parsing and validation utilities
 *
 * Supports timestamp formats:
 * - [MM:SS] - e.g., [7:30] (7 minutes, 30 seconds)
 * - [M:SS] - e.g., [7:30] (single digit minutes)
 * - [HH:MM:SS] - e.g., [1:23:45] (1 hour, 23 minutes, 45 seconds)
 * - [H:MM:SS] - e.g., [1:23:45] (single digit hours)
 */

/**
 * Regular expression to match timestamp patterns in text
 * Matches single timestamps: [0:06], [7:30], [1:23:45], [12:04:56]
 * Matches timestamp ranges: [2:02-2:41], [1:23:45-1:25:30]
 *
 * For ranges, we use the start timestamp for navigation
 */
export const TIMESTAMP_REGEX = /\[\d{1,2}:\d{2}(?::\d{2})?(?:-\d{1,2}:\d{2}(?::\d{2})?)?\]/g;

/**
 * Parse a timestamp string to total seconds
 *
 * @param text - Timestamp string like "[1:23]", "[1:23:45]", or "[2:02-2:41]"
 * @returns Total seconds, or null if invalid format
 *
 * @example
 * parseTimestamp("[7:30]")      // Returns 450 (7 minutes, 30 seconds)
 * parseTimestamp("[1:23:45]")   // Returns 5025 (1 hour, 23 minutes, 45 seconds)
 * parseTimestamp("[2:02-2:41]") // Returns 122 (2 minutes, 2 seconds - uses start time)
 * parseTimestamp("invalid")     // Returns null
 */
export function parseTimestamp(text: string): number | null {
  // Extract just the start timestamp from range format [M:SS-M:SS]
  // If it's a range, split on the dash and use the first part
  const bracketContent = text.match(/\[(.*?)\]/)?.[1];
  if (!bracketContent) return null;

  const startTimestamp = bracketContent.split("-")[0];

  // Parse the start timestamp (supports both MM:SS and HH:MM:SS)
  const match = startTimestamp.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!match) return null;

  // If group 3 exists, format is [HH:MM:SS]
  // If group 3 doesn't exist, format is [MM:SS]
  const hasHours = !!match[3];

  if (hasHours) {
    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const seconds = parseInt(match[3], 10);

    // Validate ranges
    if (minutes >= 60 || seconds >= 60) return null;

    return hours * 3600 + minutes * 60 + seconds;
  } else {
    const minutes = parseInt(match[1], 10);
    const seconds = parseInt(match[2], 10);

    // Validate seconds range
    if (seconds >= 60) return null;

    return minutes * 60 + seconds;
  }
}

/**
 * Format seconds as timestamp string
 *
 * @param seconds - Total seconds to format
 * @returns Formatted timestamp string "[MM:SS]" or "[HH:MM:SS]"
 *
 * @example
 * formatTimestamp(450)      // Returns "[07:30]"
 * formatTimestamp(5025)     // Returns "[01:23:45]"
 */
export function formatTimestamp(seconds: number): string {
  if (typeof seconds !== "number" || isNaN(seconds) || seconds < 0) {
    return "[00:00]";
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `[${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}]`;
  }

  return `[${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}]`;
}

/**
 * Validate if a timestamp string is valid and optionally within duration bounds
 *
 * @param text - Timestamp string to validate
 * @param maxDuration - Optional maximum duration in seconds
 * @returns True if timestamp is valid and within bounds
 *
 * @example
 * isValidTimestamp("[7:30]")              // Returns true
 * isValidTimestamp("[7:30]", 300)         // Returns false (450 > 300)
 * isValidTimestamp("[99:99]")             // Returns false (invalid seconds)
 * isValidTimestamp("not a timestamp")     // Returns false
 */
export function isValidTimestamp(
  text: string,
  maxDuration?: number
): boolean {
  const seconds = parseTimestamp(text);
  if (seconds === null) return false;
  if (maxDuration !== undefined && seconds > maxDuration) return false;
  return true;
}
