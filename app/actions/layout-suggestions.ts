"use server";

import { revalidatePath } from "next/cache";
import { tasks } from "@trigger.dev/sdk/v3";
import { db } from "@/lib/drizzle/db";
import { sections, type BlockType } from "@/lib/drizzle/schema/sections";
import { pages } from "@/lib/drizzle/schema/pages";
import { requireUserId } from "@/lib/auth";
import { eq, and, sql } from "drizzle-orm";
import { getPageById } from "@/lib/queries/pages";
import {
  createLayoutSuggestionJob,
  setLayoutJobTriggerRunId,
  getLayoutJobByIdWithAuth,
} from "@/lib/layout-jobs";
import { getDefaultContent } from "@/lib/section-defaults";
import type { suggestLayout } from "@/trigger/tasks/suggest-layout";
import type { LayoutSuggestion } from "@/lib/drizzle/schema/layout-suggestion-jobs";
import type { SectionContent } from "@/lib/section-types";

// ============================================================================
// Types
// ============================================================================

export interface TriggerLayoutResult {
  success: boolean;
  jobId?: string;
  runId?: string;
  error?: string;
}

export interface LayoutJobStatusResult {
  success: boolean;
  status?: string;
  progress?: number;
  suggestions?: LayoutSuggestion[];
  error?: string;
}

export interface ApplySuggestionsResult {
  success: boolean;
  sectionsAdded?: number;
  error?: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Verify user owns the page and return siteId
 */
async function verifyPageOwnership(
  pageId: string,
  userId: string
): Promise<{ valid: boolean; siteId?: string }> {
  const [page] = await db
    .select({ id: pages.id, site_id: pages.site_id })
    .from(pages)
    .where(and(eq(pages.id, pageId), eq(pages.user_id, userId)))
    .limit(1);

  if (!page) {
    return { valid: false };
  }

  return { valid: true, siteId: page.site_id };
}

/**
 * Get the next position for a new section in a page
 */
async function getNextPosition(pageId: string): Promise<number> {
  const [result] = await db
    .select({ maxPos: sql<number>`COALESCE(MAX(${sections.position}), -1)` })
    .from(sections)
    .where(eq(sections.page_id, pageId));

  return (result?.maxPos ?? -1) + 1;
}

/**
 * Merge AI-suggested content with defaults to ensure all required fields exist
 */
function mergeWithDefaults(
  blockType: BlockType,
  suggestedContent: Record<string, unknown>
): SectionContent {
  const defaults = getDefaultContent(blockType);
  return { ...defaults, ...suggestedContent } as SectionContent;
}

// ============================================================================
// Actions
// ============================================================================

/**
 * Trigger layout suggestion generation.
 * Creates a job record and starts the Trigger.dev task.
 */
export async function triggerLayoutSuggestion(
  pageId: string,
  description: string
): Promise<TriggerLayoutResult> {
  const userId = await requireUserId();

  // Verify page ownership
  const page = await getPageById(pageId, userId);
  if (!page) {
    return { success: false, error: "Page not found" };
  }

  // Validate description
  const trimmedDescription = description.trim();
  if (!trimmedDescription) {
    return { success: false, error: "Description is required" };
  }

  if (trimmedDescription.length > 500) {
    return {
      success: false,
      error: "Description must be 500 characters or less",
    };
  }

  // Create job record
  const job = await createLayoutSuggestionJob(
    pageId,
    userId,
    trimmedDescription
  );

  // Trigger the task
  const handle = await tasks.trigger<typeof suggestLayout>("suggest-layout", {
    jobId: job.id,
  });

  // Store run ID for tracking
  await setLayoutJobTriggerRunId(job.id, handle.id);

  return {
    success: true,
    jobId: job.id,
    runId: handle.id,
  };
}

/**
 * Get layout job status and suggestions.
 */
export async function getLayoutJobStatus(
  jobId: string
): Promise<LayoutJobStatusResult> {
  const userId = await requireUserId();

  const job = await getLayoutJobByIdWithAuth(jobId, userId);
  if (!job) {
    return { success: false, error: "Job not found" };
  }

  return {
    success: true,
    status: job.status,
    progress: job.progress_percentage,
    suggestions: job.suggestions ?? undefined,
    error: job.error_message ?? undefined,
  };
}

/**
 * Apply selected suggestions to the page.
 * Adds sections with AI-generated content, merged with defaults.
 */
export async function applyLayoutSuggestions(
  pageId: string,
  siteId: string,
  suggestions: LayoutSuggestion[]
): Promise<ApplySuggestionsResult> {
  const userId = await requireUserId();

  // Verify page ownership
  const ownership = await verifyPageOwnership(pageId, userId);
  if (!ownership.valid) {
    return { success: false, error: "Page not found" };
  }

  if (suggestions.length === 0) {
    return { success: false, error: "No suggestions provided" };
  }

  // Get starting position
  let nextPosition = await getNextPosition(pageId);
  let sectionsAdded = 0;

  // Add each suggestion as a section
  for (const suggestion of suggestions) {
    const blockType = suggestion.blockType as BlockType;
    const content = mergeWithDefaults(blockType, suggestion.suggestedContent);

    await db.insert(sections).values({
      page_id: pageId,
      user_id: userId,
      block_type: blockType,
      content,
      position: nextPosition,
    });

    nextPosition++;
    sectionsAdded++;
  }

  revalidatePath("/app");
  revalidatePath(`/app/sites/${siteId}`);
  revalidatePath(`/app/sites/${siteId}/pages/${pageId}`);

  return {
    success: true,
    sectionsAdded,
  };
}
