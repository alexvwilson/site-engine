"use server";

import { revalidatePath } from "next/cache";
import { tasks } from "@trigger.dev/sdk";
import { requireUserId } from "@/lib/auth";
import { getSiteById } from "@/lib/queries/sites";
import {
  createLogoGenerationJob,
  setLogoJobTriggerRunId,
  getLogoJobByIdWithAuth,
  getCompletedLogoJobsForSite,
} from "@/lib/logo-jobs";
import type { generateLogoPrompts } from "@/trigger/tasks/generate-logo-prompts";
import type { LogoGenerationOutput } from "@/lib/drizzle/schema/logo-generation-jobs";

// ============================================================================
// Types
// ============================================================================

export interface TriggerLogoResult {
  success: boolean;
  jobId?: string;
  runId?: string;
  error?: string;
}

export interface LogoJobStatusResult {
  success: boolean;
  status?: string;
  progress?: number;
  error?: string;
  concepts?: LogoGenerationOutput;
}

export interface LogoGenerationContext {
  siteName: string;
  siteDescription?: string | null;
  brandPersonality?: string | null;
  primaryColor?: string | null;
}

export interface PastLogoJob {
  id: string;
  createdAt: Date;
  siteName: string;
  conceptCount: number;
}

export interface PastLogoJobsResult {
  success: boolean;
  jobs?: PastLogoJob[];
  error?: string;
}

// ============================================================================
// Logo Generation Actions
// ============================================================================

/**
 * Trigger logo prompt generation.
 * Creates a job record and starts the Trigger.dev task.
 */
export async function triggerLogoGeneration(
  siteId: string,
  context: LogoGenerationContext
): Promise<TriggerLogoResult> {
  const userId = await requireUserId();

  // Verify site ownership
  const site = await getSiteById(siteId, userId);
  if (!site) {
    return { success: false, error: "Site not found" };
  }

  // Create the job record
  const job = await createLogoGenerationJob({
    siteId,
    userId,
    siteName: context.siteName,
    siteDescription: context.siteDescription,
    brandPersonality: context.brandPersonality,
    primaryColor: context.primaryColor,
  });

  // Trigger the task
  const handle = await tasks.trigger<typeof generateLogoPrompts>(
    "generate-logo-prompts",
    { jobId: job.id }
  );

  // Store the Trigger.dev run ID for tracking
  await setLogoJobTriggerRunId(job.id, handle.id);

  revalidatePath(`/app/sites/${siteId}`);

  return {
    success: true,
    jobId: job.id,
    runId: handle.id,
  };
}

/**
 * Get the current status of a logo generation job.
 */
export async function getLogoJobStatus(
  jobId: string
): Promise<LogoJobStatusResult> {
  const userId = await requireUserId();

  const job = await getLogoJobByIdWithAuth(jobId, userId);

  if (!job) {
    return { success: false, error: "Job not found" };
  }

  return {
    success: true,
    status: job.status,
    progress: job.progress_percentage,
    error: job.error_message ?? undefined,
    concepts: job.generated_concepts ?? undefined,
  };
}

/**
 * Retry a failed logo generation job.
 * Creates a new job with the same context.
 */
export async function retryLogoGeneration(
  jobId: string
): Promise<TriggerLogoResult> {
  const userId = await requireUserId();

  // Get the failed job
  const failedJob = await getLogoJobByIdWithAuth(jobId, userId);

  if (!failedJob) {
    return { success: false, error: "Job not found" };
  }

  if (failedJob.status !== "failed") {
    return { success: false, error: "Job is not in failed state" };
  }

  // Create a new job with the same context
  return triggerLogoGeneration(failedJob.site_id, {
    siteName: failedJob.site_name,
    siteDescription: failedJob.site_description,
    brandPersonality: failedJob.brand_personality,
    primaryColor: failedJob.primary_color,
  });
}

/**
 * Get past completed logo generation jobs for a site.
 */
export async function getPastLogoJobs(
  siteId: string
): Promise<PastLogoJobsResult> {
  const userId = await requireUserId();

  const jobs = await getCompletedLogoJobsForSite(siteId, userId, 5);

  return {
    success: true,
    jobs: jobs.map((job) => ({
      id: job.id,
      createdAt: job.created_at,
      siteName: job.site_name,
      conceptCount: job.generated_concepts?.concepts?.length ?? 0,
    })),
  };
}
