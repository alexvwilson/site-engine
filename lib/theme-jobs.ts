/**
 * Theme Generation Job Helpers
 *
 * Functions for creating and managing theme generation jobs.
 * Used by server actions to interact with the theme generation system.
 */

import { db } from "@/lib/drizzle/db";
import {
  themeGenerationJobs,
  type ThemeGenerationJob,
  type ThemeJobMode,
  type ThemeJobStatus,
} from "@/lib/drizzle/schema";
import type { ThemeRequirements } from "@/lib/drizzle/schema/theme-types";
import { eq, and, desc } from "drizzle-orm";

// ============================================================================
// Types
// ============================================================================

export interface CreateThemeJobOptions {
  siteId: string;
  userId: string;
  mode: ThemeJobMode;
  requirements: ThemeRequirements;
  aiProvider?: string;
  aiModel?: string;
}

export interface UpdateJobProgressOptions {
  progress: number;
  status?: ThemeJobStatus;
  errorMessage?: string;
}

// ============================================================================
// Job Creation
// ============================================================================

/**
 * Create a new theme generation job.
 * Returns the created job record.
 */
export async function createThemeGenerationJob(
  options: CreateThemeJobOptions
): Promise<ThemeGenerationJob> {
  const {
    siteId,
    userId,
    mode,
    requirements,
    aiProvider = "openai",
    aiModel = "gpt-4o",
  } = options;

  const [job] = await db
    .insert(themeGenerationJobs)
    .values({
      site_id: siteId,
      user_id: userId,
      mode,
      status: "pending",
      requirements,
      ai_provider: aiProvider,
      ai_model: aiModel,
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
export async function updateJobProgress(
  jobId: string,
  options: UpdateJobProgressOptions
): Promise<void> {
  const updateData: Partial<ThemeGenerationJob> = {
    progress_percentage: options.progress,
    updated_at: new Date(),
  };

  if (options.status) {
    updateData.status = options.status;
  }

  if (options.errorMessage !== undefined) {
    updateData.error_message = options.errorMessage;
  }

  await db
    .update(themeGenerationJobs)
    .set(updateData)
    .where(eq(themeGenerationJobs.id, jobId));
}

/**
 * Mark a job as failed with an error message.
 */
export async function markJobFailed(
  jobId: string,
  errorMessage: string
): Promise<void> {
  await db
    .update(themeGenerationJobs)
    .set({
      status: "failed",
      error_message: errorMessage,
      updated_at: new Date(),
    })
    .where(eq(themeGenerationJobs.id, jobId));
}

/**
 * Update job with Trigger.dev run ID for tracking.
 */
export async function setJobTriggerRunId(
  jobId: string,
  triggerRunId: string
): Promise<void> {
  await db
    .update(themeGenerationJobs)
    .set({
      trigger_run_id: triggerRunId,
      updated_at: new Date(),
    })
    .where(eq(themeGenerationJobs.id, jobId));
}

// ============================================================================
// Job Queries
// ============================================================================

/**
 * Get a theme generation job by ID.
 */
export async function getThemeJobById(
  jobId: string
): Promise<ThemeGenerationJob | null> {
  const [job] = await db
    .select()
    .from(themeGenerationJobs)
    .where(eq(themeGenerationJobs.id, jobId))
    .limit(1);

  return job ?? null;
}

/**
 * Get a theme generation job by ID with user ownership check.
 */
export async function getThemeJobByIdWithAuth(
  jobId: string,
  userId: string
): Promise<ThemeGenerationJob | null> {
  const [job] = await db
    .select()
    .from(themeGenerationJobs)
    .where(
      and(
        eq(themeGenerationJobs.id, jobId),
        eq(themeGenerationJobs.user_id, userId)
      )
    )
    .limit(1);

  return job ?? null;
}

/**
 * Get all theme generation jobs for a site.
 */
export async function getThemeJobsBySite(
  siteId: string
): Promise<ThemeGenerationJob[]> {
  return db
    .select()
    .from(themeGenerationJobs)
    .where(eq(themeGenerationJobs.site_id, siteId))
    .orderBy(desc(themeGenerationJobs.created_at));
}

/**
 * Get the most recent theme generation job for a site.
 */
export async function getLatestThemeJob(
  siteId: string
): Promise<ThemeGenerationJob | null> {
  const [job] = await db
    .select()
    .from(themeGenerationJobs)
    .where(eq(themeGenerationJobs.site_id, siteId))
    .orderBy(desc(themeGenerationJobs.created_at))
    .limit(1);

  return job ?? null;
}

/**
 * Get active (in-progress) theme jobs for a site.
 */
export async function getActiveThemeJobs(
  siteId: string
): Promise<ThemeGenerationJob[]> {
  const activeStatuses: ThemeJobStatus[] = [
    "pending",
    "generating_colors",
    "generating_typography",
    "generating_components",
    "finalizing",
  ];

  // Use a query that checks for non-terminal statuses
  const jobs = await db
    .select()
    .from(themeGenerationJobs)
    .where(eq(themeGenerationJobs.site_id, siteId))
    .orderBy(desc(themeGenerationJobs.created_at));

  return jobs.filter((job) => activeStatuses.includes(job.status));
}

// ============================================================================
// Job Cleanup
// ============================================================================

/**
 * Delete old failed jobs for a site (cleanup utility).
 * Keeps the most recent N failed jobs.
 */
export async function cleanupOldFailedJobs(
  siteId: string,
  keepCount: number = 5
): Promise<number> {
  const failedJobs = await db
    .select({ id: themeGenerationJobs.id })
    .from(themeGenerationJobs)
    .where(
      and(
        eq(themeGenerationJobs.site_id, siteId),
        eq(themeGenerationJobs.status, "failed")
      )
    )
    .orderBy(desc(themeGenerationJobs.created_at));

  if (failedJobs.length <= keepCount) {
    return 0;
  }

  const jobsToDelete = failedJobs.slice(keepCount);
  const idsToDelete = jobsToDelete.map((j) => j.id);

  // Delete in batches to avoid query size limits
  for (const id of idsToDelete) {
    await db
      .delete(themeGenerationJobs)
      .where(eq(themeGenerationJobs.id, id));
  }

  return idsToDelete.length;
}
