"use server";

import { revalidatePath } from "next/cache";
import { tasks } from "@trigger.dev/sdk";
import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/drizzle/db";
import { seoAnalysisJobs, sites } from "@/lib/drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { getSeoAuditData } from "@/lib/queries/seo";
import { runSeoAudit, type SeoAuditSummary } from "@/lib/seo-checks";
import type { analyzeSeo } from "@/trigger/tasks/analyze-seo";
import type { SeoAnalysisJob } from "@/lib/drizzle/schema/seo-analysis-jobs";

// ============================================================================
// Manual Audit (Phase 1)
// ============================================================================

/**
 * Fetch and run SEO audit for a site (manual checklist)
 */
export async function runSeoAuditAction(
  siteId: string
): Promise<{ success: true; data: SeoAuditSummary } | { success: false; error: string }> {
  const userId = await requireUserId();

  const auditData = await getSeoAuditData(siteId, userId);

  if (!auditData) {
    return { success: false, error: "Site not found or access denied" };
  }

  const summary = runSeoAudit(auditData);

  return { success: true, data: summary };
}

// ============================================================================
// AI Analysis (Phase 2)
// ============================================================================

export interface StartSeoAnalysisResult {
  success: boolean;
  jobId?: string;
  runId?: string;
  error?: string;
}

export interface SeoAnalysisJobResult {
  success: boolean;
  job?: SeoAnalysisJob;
  error?: string;
}

/**
 * Start AI-powered SEO analysis.
 * Creates a job record and triggers the Trigger.dev task.
 */
export async function startSeoAnalysis(
  siteId: string
): Promise<StartSeoAnalysisResult> {
  const userId = await requireUserId();

  // Verify site ownership
  const [site] = await db
    .select({ id: sites.id })
    .from(sites)
    .where(and(eq(sites.id, siteId), eq(sites.user_id, userId)))
    .limit(1);

  if (!site) {
    return { success: false, error: "Site not found" };
  }

  // Create the job record
  const [job] = await db
    .insert(seoAnalysisJobs)
    .values({
      site_id: siteId,
      user_id: userId,
    })
    .returning({ id: seoAnalysisJobs.id });

  // Trigger the background task
  const handle = await tasks.trigger<typeof analyzeSeo>("analyze-seo", {
    jobId: job.id,
  });

  revalidatePath(`/app/sites/${siteId}`);

  return {
    success: true,
    jobId: job.id,
    runId: handle.id,
  };
}

/**
 * Get an SEO analysis job by ID.
 * Used for polling job status during analysis.
 */
export async function getSeoAnalysisJob(
  jobId: string
): Promise<SeoAnalysisJobResult> {
  const userId = await requireUserId();

  const [job] = await db
    .select()
    .from(seoAnalysisJobs)
    .where(
      and(
        eq(seoAnalysisJobs.id, jobId),
        eq(seoAnalysisJobs.user_id, userId)
      )
    )
    .limit(1);

  if (!job) {
    return { success: false, error: "Job not found" };
  }

  return { success: true, job };
}

/**
 * Get the latest SEO analysis job for a site.
 * Used to show previous analysis results.
 */
export async function getLatestSeoAnalysisForSite(
  siteId: string
): Promise<SeoAnalysisJobResult> {
  const userId = await requireUserId();

  // Verify site ownership
  const [site] = await db
    .select({ id: sites.id })
    .from(sites)
    .where(and(eq(sites.id, siteId), eq(sites.user_id, userId)))
    .limit(1);

  if (!site) {
    return { success: false, error: "Site not found" };
  }

  const [job] = await db
    .select()
    .from(seoAnalysisJobs)
    .where(eq(seoAnalysisJobs.site_id, siteId))
    .orderBy(desc(seoAnalysisJobs.created_at))
    .limit(1);

  return { success: true, job };
}
