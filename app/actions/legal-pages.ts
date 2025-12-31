"use server";

import { revalidatePath } from "next/cache";
import { tasks } from "@trigger.dev/sdk";
import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/drizzle/db";
import { legalGenerationJobs, sites } from "@/lib/drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import type { generateLegalPages } from "@/trigger/tasks/generate-legal-pages";
import type {
  BusinessType,
  DataCollectionType,
  Jurisdiction,
  LegalPageType,
  LegalGenerationJob,
} from "@/lib/drizzle/schema/legal-generation-jobs";

// ============================================================================
// Types
// ============================================================================

export interface LegalGenerationConfig {
  businessType: BusinessType;
  dataCollection: DataCollectionType[];
  jurisdiction: Jurisdiction;
  pagesToGenerate: LegalPageType[];
}

export interface StartLegalGenerationResult {
  success: boolean;
  jobId?: string;
  runId?: string;
  error?: string;
}

export interface LegalJobStatusResult {
  success: boolean;
  job?: LegalGenerationJob;
  error?: string;
}

// ============================================================================
// Server Actions
// ============================================================================

/**
 * Start legal page generation.
 * Creates a job record and triggers the Trigger.dev task.
 */
export async function startLegalPageGeneration(
  siteId: string,
  config: LegalGenerationConfig
): Promise<StartLegalGenerationResult> {
  const userId = await requireUserId();

  // Validate input
  if (config.pagesToGenerate.length === 0) {
    return { success: false, error: "Select at least one page to generate" };
  }

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
    .insert(legalGenerationJobs)
    .values({
      site_id: siteId,
      user_id: userId,
      business_type: config.businessType,
      data_collection: config.dataCollection,
      jurisdiction: config.jurisdiction,
      pages_to_generate: config.pagesToGenerate,
    })
    .returning({ id: legalGenerationJobs.id });

  // Trigger the background task
  const handle = await tasks.trigger<typeof generateLegalPages>(
    "generate-legal-pages",
    { jobId: job.id }
  );

  // Store the run ID for potential tracking
  await db
    .update(legalGenerationJobs)
    .set({ updated_at: new Date() })
    .where(eq(legalGenerationJobs.id, job.id));

  revalidatePath(`/app/sites/${siteId}`);

  return {
    success: true,
    jobId: job.id,
    runId: handle.id,
  };
}

/**
 * Get a legal generation job by ID.
 * Used for polling job status during generation.
 */
export async function getLegalGenerationJob(
  jobId: string
): Promise<LegalJobStatusResult> {
  const userId = await requireUserId();

  const [job] = await db
    .select()
    .from(legalGenerationJobs)
    .where(
      and(
        eq(legalGenerationJobs.id, jobId),
        eq(legalGenerationJobs.user_id, userId)
      )
    )
    .limit(1);

  if (!job) {
    return { success: false, error: "Job not found" };
  }

  return { success: true, job };
}

/**
 * Get the latest legal generation job for a site.
 * Used to show previous generation status/results.
 */
export async function getLatestLegalJobForSite(
  siteId: string
): Promise<LegalJobStatusResult> {
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
    .from(legalGenerationJobs)
    .where(eq(legalGenerationJobs.site_id, siteId))
    .orderBy(desc(legalGenerationJobs.created_at))
    .limit(1);

  if (!job) {
    return { success: true, job: undefined };
  }

  return { success: true, job };
}

/**
 * Check if legal pages already exist for a site.
 * Returns which page types already exist.
 */
export async function checkExistingLegalPages(
  siteId: string
): Promise<{
  success: boolean;
  existingPages?: LegalPageType[];
  error?: string;
}> {
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

  // Import pages table for query
  const { pages } = await import("@/lib/drizzle/schema");

  const legalSlugs = ["privacy-policy", "terms-of-service", "cookie-policy"];
  const slugToType: Record<string, LegalPageType> = {
    "privacy-policy": "privacy",
    "terms-of-service": "terms",
    "cookie-policy": "cookies",
  };

  const existingPages = await db
    .select({ slug: pages.slug })
    .from(pages)
    .where(eq(pages.site_id, siteId));

  const existingLegalPages: LegalPageType[] = existingPages
    .filter((p) => legalSlugs.includes(p.slug))
    .map((p) => slugToType[p.slug]);

  return { success: true, existingPages: existingLegalPages };
}
