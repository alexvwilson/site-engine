"use server";

import { revalidatePath } from "next/cache";
import { tasks } from "@trigger.dev/sdk";
import { db } from "@/lib/drizzle/db";
import { themes, themeGenerationJobs } from "@/lib/drizzle/schema";
import { requireUserId } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { createThemeGenerationJob, setJobTriggerRunId } from "@/lib/theme-jobs";
import { getSiteById } from "@/lib/queries/sites";
import type { ThemeRequirements, ThemeData } from "@/lib/drizzle/schema/theme-types";
import type { ThemeJobMode } from "@/lib/drizzle/schema/theme-generation-jobs";
import type { generateThemeQuick } from "@/trigger/tasks/generate-theme-quick";

// ============================================================================
// Types
// ============================================================================

export interface ActionResult {
  success: boolean;
  error?: string;
}

export interface TriggerThemeResult {
  success: boolean;
  jobId?: string;
  runId?: string;
  error?: string;
}

export interface SaveThemeResult {
  success: boolean;
  themeId?: string;
  error?: string;
}

// ============================================================================
// Theme Generation Actions
// ============================================================================

/**
 * Trigger theme generation (Quick or Guided mode).
 * Creates a job record and starts the Trigger.dev task.
 */
export async function triggerThemeGeneration(
  siteId: string,
  mode: ThemeJobMode,
  requirements: ThemeRequirements
): Promise<TriggerThemeResult> {
  const userId = await requireUserId();

  // Verify site ownership
  const site = await getSiteById(siteId, userId);
  if (!site) {
    return { success: false, error: "Site not found" };
  }

  // Create the job record
  const job = await createThemeGenerationJob({
    siteId,
    userId,
    mode,
    requirements,
    aiProvider: "openai",
    aiModel: "gpt-4o",
  });

  // Trigger the appropriate task
  if (mode === "quick") {
    const handle = await tasks.trigger<typeof generateThemeQuick>(
      "generate-theme-quick",
      { jobId: job.id }
    );

    // Store the Trigger.dev run ID for tracking
    await setJobTriggerRunId(job.id, handle.id);

    revalidatePath(`/app/sites/${siteId}`);
    return {
      success: true,
      jobId: job.id,
      runId: handle.id,
    };
  }

  // Guided mode will be implemented later
  return {
    success: false,
    error: "Guided mode not yet implemented",
  };
}

/**
 * Retry a failed theme generation job.
 * Creates a new job with the same requirements.
 */
export async function retryThemeGeneration(
  jobId: string
): Promise<TriggerThemeResult> {
  const userId = await requireUserId();

  // Get the failed job
  const [failedJob] = await db
    .select()
    .from(themeGenerationJobs)
    .where(
      and(
        eq(themeGenerationJobs.id, jobId),
        eq(themeGenerationJobs.user_id, userId)
      )
    )
    .limit(1);

  if (!failedJob) {
    return { success: false, error: "Job not found" };
  }

  if (failedJob.status !== "failed") {
    return { success: false, error: "Job is not in failed state" };
  }

  // Create a new job with the same requirements
  return triggerThemeGeneration(
    failedJob.site_id,
    failedJob.mode,
    failedJob.requirements
  );
}

// ============================================================================
// Theme Management Actions
// ============================================================================

/**
 * Save a generated theme and optionally activate it.
 */
export async function saveGeneratedTheme(
  siteId: string,
  themeData: ThemeData,
  name: string,
  activate: boolean = true,
  generationJobId?: string
): Promise<SaveThemeResult> {
  const userId = await requireUserId();

  // Verify site ownership
  const site = await getSiteById(siteId, userId);
  if (!site) {
    return { success: false, error: "Site not found" };
  }

  // If activating, deactivate other themes first
  if (activate) {
    await db
      .update(themes)
      .set({ is_active: false, updated_at: new Date() })
      .where(eq(themes.site_id, siteId));
  }

  // Create the theme
  const [savedTheme] = await db
    .insert(themes)
    .values({
      site_id: siteId,
      user_id: userId,
      generation_job_id: generationJobId ?? null,
      name: name.trim(),
      is_active: activate,
      data: themeData,
    })
    .returning({ id: themes.id });

  revalidatePath(`/app/sites/${siteId}`);
  return { success: true, themeId: savedTheme.id };
}

/**
 * Activate a theme for a site.
 * Deactivates all other themes for the same site.
 */
export async function activateTheme(themeId: string): Promise<ActionResult> {
  const userId = await requireUserId();

  // Get the theme and verify ownership
  const [theme] = await db
    .select()
    .from(themes)
    .where(and(eq(themes.id, themeId), eq(themes.user_id, userId)))
    .limit(1);

  if (!theme) {
    return { success: false, error: "Theme not found" };
  }

  // Deactivate all themes for this site
  await db
    .update(themes)
    .set({ is_active: false, updated_at: new Date() })
    .where(eq(themes.site_id, theme.site_id));

  // Activate the selected theme
  await db
    .update(themes)
    .set({ is_active: true, updated_at: new Date() })
    .where(eq(themes.id, themeId));

  revalidatePath(`/app/sites/${theme.site_id}`);
  return { success: true };
}

/**
 * Delete a theme.
 * Cannot delete the active theme.
 */
export async function deleteTheme(themeId: string): Promise<ActionResult> {
  const userId = await requireUserId();

  // Get the theme and verify ownership
  const [theme] = await db
    .select()
    .from(themes)
    .where(and(eq(themes.id, themeId), eq(themes.user_id, userId)))
    .limit(1);

  if (!theme) {
    return { success: false, error: "Theme not found" };
  }

  if (theme.is_active) {
    return { success: false, error: "Cannot delete the active theme" };
  }

  await db.delete(themes).where(eq(themes.id, themeId));

  revalidatePath(`/app/sites/${theme.site_id}`);
  return { success: true };
}

/**
 * Update a theme's name.
 */
export async function updateThemeName(
  themeId: string,
  name: string
): Promise<ActionResult> {
  const userId = await requireUserId();

  const trimmedName = name.trim();
  if (!trimmedName) {
    return { success: false, error: "Theme name is required" };
  }

  const result = await db
    .update(themes)
    .set({ name: trimmedName, updated_at: new Date() })
    .where(and(eq(themes.id, themeId), eq(themes.user_id, userId)))
    .returning({ id: themes.id });

  if (result.length === 0) {
    return { success: false, error: "Theme not found" };
  }

  return { success: true };
}

/**
 * Update a theme's data (for manual adjustments).
 */
export async function updateThemeData(
  themeId: string,
  themeData: ThemeData
): Promise<ActionResult> {
  const userId = await requireUserId();

  // Get the theme to find the site ID for revalidation
  const [theme] = await db
    .select({ site_id: themes.site_id })
    .from(themes)
    .where(and(eq(themes.id, themeId), eq(themes.user_id, userId)))
    .limit(1);

  if (!theme) {
    return { success: false, error: "Theme not found" };
  }

  await db
    .update(themes)
    .set({
      data: themeData,
      updated_at: new Date(),
    })
    .where(eq(themes.id, themeId));

  revalidatePath(`/app/sites/${theme.site_id}`);
  return { success: true };
}

/**
 * Duplicate a theme with a new name.
 */
export async function duplicateTheme(
  themeId: string,
  newName?: string
): Promise<SaveThemeResult> {
  const userId = await requireUserId();

  // Get the original theme
  const [original] = await db
    .select()
    .from(themes)
    .where(and(eq(themes.id, themeId), eq(themes.user_id, userId)))
    .limit(1);

  if (!original) {
    return { success: false, error: "Theme not found" };
  }

  const duplicateName = newName?.trim() || `${original.name} (Copy)`;

  const [duplicated] = await db
    .insert(themes)
    .values({
      site_id: original.site_id,
      user_id: userId,
      generation_job_id: original.generation_job_id,
      name: duplicateName,
      is_active: false,
      data: original.data,
    })
    .returning({ id: themes.id });

  revalidatePath(`/app/sites/${original.site_id}`);
  return { success: true, themeId: duplicated.id };
}

// ============================================================================
// Job Status Actions
// ============================================================================

/**
 * Get the current status of a theme generation job.
 */
export async function getThemeJobStatus(jobId: string): Promise<{
  success: boolean;
  status?: string;
  progress?: number;
  error?: string;
  themeId?: string;
}> {
  const userId = await requireUserId();

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

  if (!job) {
    return { success: false, error: "Job not found" };
  }

  // If completed, find the associated theme
  let themeId: string | undefined;
  if (job.status === "completed") {
    const [theme] = await db
      .select({ id: themes.id })
      .from(themes)
      .where(eq(themes.generation_job_id, jobId))
      .limit(1);
    themeId = theme?.id;
  }

  return {
    success: true,
    status: job.status,
    progress: job.progress_percentage,
    error: job.error_message ?? undefined,
    themeId,
  };
}

/**
 * Get theme data by ID.
 * Used by client components to fetch generated theme data.
 */
export async function getThemeDataById(themeId: string): Promise<{
  success: boolean;
  data?: ThemeData;
  error?: string;
}> {
  const userId = await requireUserId();

  const [theme] = await db
    .select()
    .from(themes)
    .where(and(eq(themes.id, themeId), eq(themes.user_id, userId)))
    .limit(1);

  if (!theme) {
    return { success: false, error: "Theme not found" };
  }

  return { success: true, data: theme.data };
}
