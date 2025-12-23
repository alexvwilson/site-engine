/**
 * Format Utilities - Client Safe
 *
 * Centralized date, duration, and timestamp formatting utilities.
 * These functions are pure and can be safely imported by client components.
 *
 * Used across transcript components for consistent formatting.
 */

/**
 * Format a date as human-readable string
 * @param date - Date object to format
 * @returns Formatted date string (e.g., "Jan 15, 2025, 2:30 PM")
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

/**
 * Format duration in seconds as human-readable string
 * @param seconds - Duration in seconds
 * @returns Formatted duration (e.g., "1h 23m 45s" or "7m 30s")
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts: string[] = [];

  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  if (minutes > 0 || hours > 0) {
    parts.push(`${minutes}m`);
  }
  parts.push(`${secs}s`);

  return parts.join(" ");
}

/**
 * Format seconds as timestamp string for video/audio playback
 * @param seconds - Time in seconds
 * @returns Formatted timestamp (e.g., "01:23:45" or "07:30")
 * @throws Returns "00:00" for invalid input
 */
export function formatTimestamp(seconds: number): string {
  // Handle invalid input
  if (typeof seconds !== "number" || isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Format duration in minutes as human-readable estimate string
 * Used for upload estimates and progress indicators
 * @param minutes - Duration in minutes
 * @returns Formatted duration (e.g., "< 1 min", "~5 min", "~1 hr 30 min")
 */
export function formatDurationEstimate(minutes: number): string {
  if (minutes < 1) {
    return "< 1 min";
  }

  if (minutes < 60) {
    return `~${Math.round(minutes)} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);

  if (remainingMinutes === 0) {
    return `~${hours} hr`;
  }

  return `~${hours} hr ${remainingMinutes} min`;
}

/**
 * Format elapsed time from a start date/timestamp to now
 * Returns short format with real-time precision for job timers
 * @param startTime - Start date as Date object or ISO string
 * @returns Formatted elapsed time (e.g., "5m 32s" or "1h 5m 32s")
 */
export function formatElapsedTime(startTime: Date | string): string {
  // Handle invalid input
  const start = typeof startTime === "string" ? new Date(startTime) : startTime;
  if (!(start instanceof Date) || isNaN(start.getTime())) {
    return "0s";
  }

  const elapsedMs = Date.now() - start.getTime();
  const elapsedSeconds = Math.floor(elapsedMs / 1000);

  // Handle negative or zero elapsed time
  if (elapsedSeconds <= 0) {
    return "0s";
  }

  const hours = Math.floor(elapsedSeconds / 3600);
  const minutes = Math.floor((elapsedSeconds % 3600) / 60);
  const seconds = elapsedSeconds % 60;

  // Format based on duration
  if (hours > 0) {
    // Show hours, minutes, seconds
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    // Show minutes and seconds
    return `${minutes}m ${seconds}s`;
  } else {
    // Show only seconds
    return `${seconds}s`;
  }
}

/**
 * Calculate processing duration between two timestamps
 * @param startTime - Job creation time
 * @param endTime - Job completion time
 * @returns Formatted processing time (e.g., "5m 32s") or null if invalid
 */
export function formatProcessingDuration(
  startTime: Date | string,
  endTime: Date | string | null | undefined,
): string | null {
  // Validate inputs
  const start = typeof startTime === "string" ? new Date(startTime) : startTime;
  if (!endTime) {
    return null;
  }
  const end = typeof endTime === "string" ? new Date(endTime) : endTime;

  if (
    !(start instanceof Date) ||
    isNaN(start.getTime()) ||
    !(end instanceof Date) ||
    isNaN(end.getTime())
  ) {
    return null;
  }

  const durationMs = end.getTime() - start.getTime();
  const durationSeconds = Math.floor(durationMs / 1000);

  // Handle invalid duration
  if (durationSeconds <= 0) {
    return null;
  }

  const hours = Math.floor(durationSeconds / 3600);
  const minutes = Math.floor((durationSeconds % 3600) / 60);
  const seconds = durationSeconds % 60;

  // Format based on duration
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
}
