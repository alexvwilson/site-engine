/**
 * Layout Suggestion Job Helpers
 *
 * Functions for creating and managing layout suggestion jobs.
 * Follows the same pattern as lib/theme-jobs.ts
 */

import { db } from "@/lib/drizzle/db";
import {
  layoutSuggestionJobs,
  type LayoutSuggestionJob,
  type LayoutJobStatus,
  type LayoutSuggestion,
} from "@/lib/drizzle/schema";
import { eq, and } from "drizzle-orm";

// ============================================================================
// Job Creation
// ============================================================================

/**
 * Create a new layout suggestion job.
 * Returns the created job record.
 */
export async function createLayoutSuggestionJob(
  pageId: string,
  userId: string,
  description: string
): Promise<LayoutSuggestionJob> {
  const [job] = await db
    .insert(layoutSuggestionJobs)
    .values({
      page_id: pageId,
      user_id: userId,
      description: description.slice(0, 500),
      status: "pending",
      progress_percentage: 0,
    })
    .returning();

  return job;
}

// ============================================================================
// Job Updates
// ============================================================================

/**
 * Update job progress and optionally status.
 */
export async function updateLayoutJobProgress(
  jobId: string,
  progress: number,
  status?: LayoutJobStatus
): Promise<void> {
  const updateData: Partial<LayoutSuggestionJob> = {
    progress_percentage: progress,
    updated_at: new Date(),
  };

  if (status) {
    updateData.status = status;
  }

  await db
    .update(layoutSuggestionJobs)
    .set(updateData)
    .where(eq(layoutSuggestionJobs.id, jobId));
}

/**
 * Mark a job as failed with an error message.
 */
export async function markLayoutJobFailed(
  jobId: string,
  errorMessage: string
): Promise<void> {
  await db
    .update(layoutSuggestionJobs)
    .set({
      status: "failed",
      error_message: errorMessage,
      updated_at: new Date(),
    })
    .where(eq(layoutSuggestionJobs.id, jobId));
}

/**
 * Update job with Trigger.dev run ID for tracking.
 */
export async function setLayoutJobTriggerRunId(
  jobId: string,
  runId: string
): Promise<void> {
  await db
    .update(layoutSuggestionJobs)
    .set({
      trigger_run_id: runId,
      updated_at: new Date(),
    })
    .where(eq(layoutSuggestionJobs.id, jobId));
}

/**
 * Save the generated suggestions to the job.
 */
export async function saveLayoutSuggestions(
  jobId: string,
  suggestions: LayoutSuggestion[]
): Promise<void> {
  await db
    .update(layoutSuggestionJobs)
    .set({
      status: "completed",
      progress_percentage: 100,
      suggestions,
      updated_at: new Date(),
    })
    .where(eq(layoutSuggestionJobs.id, jobId));
}

// ============================================================================
// Job Queries
// ============================================================================

/**
 * Get a layout suggestion job by ID.
 */
export async function getLayoutJobById(
  jobId: string
): Promise<LayoutSuggestionJob | null> {
  const [job] = await db
    .select()
    .from(layoutSuggestionJobs)
    .where(eq(layoutSuggestionJobs.id, jobId))
    .limit(1);

  return job ?? null;
}

/**
 * Get a layout suggestion job by ID with user ownership check.
 */
export async function getLayoutJobByIdWithAuth(
  jobId: string,
  userId: string
): Promise<LayoutSuggestionJob | null> {
  const [job] = await db
    .select()
    .from(layoutSuggestionJobs)
    .where(
      and(
        eq(layoutSuggestionJobs.id, jobId),
        eq(layoutSuggestionJobs.user_id, userId)
      )
    )
    .limit(1);

  return job ?? null;
}
