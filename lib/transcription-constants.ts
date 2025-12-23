/**
 * Transcription Constants
 *
 * Client-safe constants and utilities for the transcription feature.
 * This file can be imported by both client and server components.
 */

// Job status constants (matches database enum)
export const JOB_STATUSES = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
  CANCELLED: "cancelled",
} as const;

export type JobStatus = (typeof JOB_STATUSES)[keyof typeof JOB_STATUSES];

// Status categories for UI organization
export const JOB_STATUS_CATEGORIES = {
  // Jobs actively being processed or waiting
  ACTIVE: [JOB_STATUSES.PENDING, JOB_STATUSES.PROCESSING] as const,

  // Jobs that require user attention
  FAILED: [JOB_STATUSES.FAILED, JOB_STATUSES.CANCELLED] as const,

  // Successfully completed jobs
  COMPLETED: [JOB_STATUSES.COMPLETED] as const,

  // All in-progress (includes failed/cancelled for backward compatibility)
  IN_PROGRESS: [
    JOB_STATUSES.PENDING,
    JOB_STATUSES.PROCESSING,
    JOB_STATUSES.FAILED,
    JOB_STATUSES.CANCELLED,
  ] as const,
} as const;

// Pagination constants
export const JOBS_PER_PAGE = 20;
export const INITIAL_COMPLETED_JOBS_LIMIT = 20;

// Supported languages for transcription
export const LANGUAGES = [
  { value: "auto", label: "Auto-detect" },
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "it", label: "Italian" },
  { value: "pt", label: "Portuguese" },
  { value: "nl", label: "Dutch" },
  { value: "pl", label: "Polish" },
  { value: "ru", label: "Russian" },
  { value: "zh", label: "Chinese" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
] as const;

export type LanguageValue = (typeof LANGUAGES)[number]["value"];

// Timestamp granularity options
export const TIMESTAMP_GRANULARITY = {
  SEGMENT: "segment",
  WORD: "word",
} as const;

export type TimestampGranularity =
  (typeof TIMESTAMP_GRANULARITY)[keyof typeof TIMESTAMP_GRANULARITY];

// Discriminated union types for job actions

/**
 * Job action types (discriminated unions for type-safe action handling)
 */
export type JobAction =
  | { type: "complete"; jobId: string }
  | { type: "delete"; jobId: string; fileName: string }
  | { type: "retry"; jobId: string }
  | { type: "cancel"; jobId: string }
  | { type: "create"; fileName: string; fileSize: number };

/**
 * Job event types for tracking
 */
export type JobEvent =
  | { type: "upload_started"; jobId: string; fileName: string }
  | { type: "upload_completed"; jobId: string }
  | { type: "processing_started"; jobId: string }
  | { type: "processing_completed"; jobId: string }
  | { type: "processing_failed"; jobId: string; error: string }
  | { type: "deleted"; jobId: string };

// Status helper functions

/**
 * Check if a job status is considered "active" (pending or processing)
 */
export function isActiveStatus(status: JobStatus): boolean {
  return JOB_STATUS_CATEGORIES.ACTIVE.includes(
    status as (typeof JOB_STATUS_CATEGORIES.ACTIVE)[number],
  );
}

/**
 * Check if a job status is "completed"
 */
export function isCompletedStatus(status: JobStatus): boolean {
  return status === JOB_STATUSES.COMPLETED;
}

/**
 * Check if a job status is "failed" (failed or cancelled)
 */
export function isFailedStatus(status: JobStatus): boolean {
  return JOB_STATUS_CATEGORIES.FAILED.includes(
    status as (typeof JOB_STATUS_CATEGORIES.FAILED)[number],
  );
}

/**
 * Check if a job status is "in progress" (pending, processing, failed, or cancelled)
 * Note: This includes failed/cancelled for UI display purposes
 */
export function isInProgressStatus(status: JobStatus): boolean {
  return JOB_STATUS_CATEGORIES.IN_PROGRESS.includes(
    status as (typeof JOB_STATUS_CATEGORIES.IN_PROGRESS)[number],
  );
}

/**
 * Check if a job can be cancelled (pending or processing)
 */
export function isCancellableStatus(status: JobStatus): boolean {
  return (
    status === JOB_STATUSES.PENDING || status === JOB_STATUSES.PROCESSING
  );
}

/**
 * Check if a job can be retried (failed)
 */
export function isRetryableStatus(status: JobStatus): boolean {
  return status === JOB_STATUSES.FAILED;
}

/**
 * Get human-readable status label
 */
export function getStatusLabel(status: JobStatus): string {
  const labels: Record<JobStatus, string> = {
    pending: "Pending",
    processing: "Processing",
    completed: "Completed",
    failed: "Failed",
    cancelled: "Cancelled",
  };

  return labels[status] || status;
}

/**
 * Get status badge color variant
 */
export function getStatusVariant(
  status: JobStatus,
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case JOB_STATUSES.COMPLETED:
      return "default";
    case JOB_STATUSES.PROCESSING:
      return "secondary";
    case JOB_STATUSES.PENDING:
      return "outline";
    case JOB_STATUSES.FAILED:
    case JOB_STATUSES.CANCELLED:
      return "destructive";
    default:
      return "outline";
  }
}
