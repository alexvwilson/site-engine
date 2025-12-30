/**
 * Logo Generation Job Helpers
 *
 * Functions for creating and managing logo generation jobs.
 * Used by server actions to interact with the logo generation system.
 */

import { db } from "@/lib/drizzle/db";
import {
  logoGenerationJobs,
  type LogoGenerationJob,
} from "@/lib/drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

// ============================================================================
// Types
// ============================================================================

export interface CreateLogoJobOptions {
  siteId: string;
  userId: string;
  siteName: string;
  siteDescription?: string | null;
  brandPersonality?: string | null;
  primaryColor?: string | null;
}

// ============================================================================
// Job Creation
// ============================================================================

/**
 * Create a new logo generation job.
 * Returns the created job record.
 */
export async function createLogoGenerationJob(
  options: CreateLogoJobOptions
): Promise<LogoGenerationJob> {
  const {
    siteId,
    userId,
    siteName,
    siteDescription,
    brandPersonality,
    primaryColor,
  } = options;

  const [job] = await db
    .insert(logoGenerationJobs)
    .values({
      site_id: siteId,
      user_id: userId,
      status: "pending",
      site_name: siteName,
      site_description: siteDescription ?? null,
      brand_personality: brandPersonality ?? null,
      primary_color: primaryColor ?? null,
      progress_percentage: 0,
    })
    .returning();

  return job;
}

// ============================================================================
// Job Updates
// ============================================================================

/**
 * Update job with Trigger.dev run ID for tracking.
 */
export async function setLogoJobTriggerRunId(
  jobId: string,
  triggerRunId: string
): Promise<void> {
  await db
    .update(logoGenerationJobs)
    .set({
      trigger_run_id: triggerRunId,
      updated_at: new Date(),
    })
    .where(eq(logoGenerationJobs.id, jobId));
}

// ============================================================================
// Job Queries
// ============================================================================

/**
 * Get a logo generation job by ID with user ownership check.
 */
export async function getLogoJobByIdWithAuth(
  jobId: string,
  userId: string
): Promise<LogoGenerationJob | null> {
  const [job] = await db
    .select()
    .from(logoGenerationJobs)
    .where(
      and(
        eq(logoGenerationJobs.id, jobId),
        eq(logoGenerationJobs.user_id, userId)
      )
    )
    .limit(1);

  return job ?? null;
}

/**
 * Get completed logo generation jobs for a site.
 * Returns most recent first, limited to specified count.
 */
export async function getCompletedLogoJobsForSite(
  siteId: string,
  userId: string,
  limit: number = 5
): Promise<LogoGenerationJob[]> {
  const jobs = await db
    .select()
    .from(logoGenerationJobs)
    .where(
      and(
        eq(logoGenerationJobs.site_id, siteId),
        eq(logoGenerationJobs.user_id, userId),
        eq(logoGenerationJobs.status, "completed")
      )
    )
    .orderBy(desc(logoGenerationJobs.created_at))
    .limit(limit);

  return jobs;
}
