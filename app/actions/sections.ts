"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/drizzle/db";
import {
  sections,
  type BlockType,
  type SectionStatus,
} from "@/lib/drizzle/schema/sections";
import { pages } from "@/lib/drizzle/schema/pages";
import { requireUserId } from "@/lib/auth";
import { eq, and, gt, gte, sql, ne } from "drizzle-orm";
import { getDefaultContent } from "@/lib/section-defaults";
import type { SectionContent, HeaderContent } from "@/lib/section-types";
import { getSiteById } from "@/lib/queries/sites";
import { getPagesBySite } from "@/lib/queries/pages";
import { isValidAnchorId } from "@/lib/anchor-utils";

export interface ActionResult {
  success: boolean;
  error?: string;
}

export interface CreateSectionResult {
  success: boolean;
  sectionId?: string;
  error?: string;
}

/**
 * Verify user owns the page
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
 * Build header content using actual site name and page navigation
 */
async function getHeaderContentWithSiteData(
  siteId: string,
  userId: string
): Promise<HeaderContent> {
  const site = await getSiteById(siteId, userId);
  if (!site) {
    return getDefaultContent("header") as HeaderContent;
  }

  const sitePages = await getPagesBySite(siteId, userId);

  const links = sitePages.map((page) => ({
    label: page.title,
    url: page.is_home
      ? `/sites/${site.slug}`
      : `/sites/${site.slug}/${page.slug}`,
  }));

  return {
    siteName: site.name,
    logoUrl: "",
    links,
    showCta: true,
    ctaText: "",
    ctaUrl: "",
    layout: "left",
    sticky: true,
    showLogoText: true,
  };
}

/**
 * Add a new section to a page
 * @param pageId - The page to add the section to
 * @param blockType - The type of block to create
 * @param position - Optional position (defaults to end of page)
 * @param templateContent - Optional pre-filled content from a template
 */
export async function addSection(
  pageId: string,
  blockType: BlockType,
  position?: number,
  templateContent?: SectionContent
): Promise<CreateSectionResult> {
  const userId = await requireUserId();

  const ownership = await verifyPageOwnership(pageId, userId);
  if (!ownership.valid) {
    return { success: false, error: "Page not found" };
  }

  // If position is not specified, add to the end
  const targetPosition = position ?? (await getNextPosition(pageId));

  // If inserting at a specific position, shift existing sections down
  if (position !== undefined) {
    await db
      .update(sections)
      .set({
        position: sql`${sections.position} + 1`,
        updated_at: new Date(),
      })
      .where(
        and(eq(sections.page_id, pageId), gte(sections.position, position))
      );
  }

  // Use template content if provided, otherwise use defaults
  // For header blocks without template, populate with actual site name and page navigation
  let content: SectionContent;
  if (templateContent) {
    content = templateContent;
  } else if (blockType === "header" && ownership.siteId) {
    content = await getHeaderContentWithSiteData(ownership.siteId, userId);
  } else {
    content = getDefaultContent(blockType);
  }

  const [section] = await db
    .insert(sections)
    .values({
      page_id: pageId,
      user_id: userId,
      block_type: blockType,
      content,
      position: targetPosition,
    })
    .returning({ id: sections.id });

  revalidatePath("/app");
  revalidatePath(`/app/sites/${ownership.siteId}`);
  revalidatePath(`/app/sites/${ownership.siteId}/pages/${pageId}`);

  return { success: true, sectionId: section.id };
}

/**
 * Update a section's content (primary auto-save target)
 */
export async function updateSection(
  sectionId: string,
  content: SectionContent
): Promise<ActionResult> {
  const userId = await requireUserId();

  const [existing] = await db
    .select({
      id: sections.id,
      page_id: sections.page_id,
      user_id: sections.user_id,
    })
    .from(sections)
    .innerJoin(pages, eq(sections.page_id, pages.id))
    .where(eq(sections.id, sectionId))
    .limit(1);

  if (!existing || existing.user_id !== userId) {
    return { success: false, error: "Section not found" };
  }

  // Get siteId for revalidation
  const [page] = await db
    .select({ site_id: pages.site_id })
    .from(pages)
    .where(eq(pages.id, existing.page_id))
    .limit(1);

  await db
    .update(sections)
    .set({
      content,
      updated_at: new Date(),
    })
    .where(eq(sections.id, sectionId));

  revalidatePath(`/app/sites/${page?.site_id}/pages/${existing.page_id}`);

  return { success: true };
}

/**
 * Delete a section and reorder remaining sections
 */
export async function deleteSection(sectionId: string): Promise<ActionResult> {
  const userId = await requireUserId();

  const [existing] = await db
    .select({
      id: sections.id,
      page_id: sections.page_id,
      user_id: sections.user_id,
      position: sections.position,
    })
    .from(sections)
    .where(eq(sections.id, sectionId))
    .limit(1);

  if (!existing || existing.user_id !== userId) {
    return { success: false, error: "Section not found" };
  }

  // Get siteId for revalidation
  const [page] = await db
    .select({ site_id: pages.site_id })
    .from(pages)
    .where(eq(pages.id, existing.page_id))
    .limit(1);

  // Delete the section
  await db.delete(sections).where(eq(sections.id, sectionId));

  // Shift remaining sections up
  await db
    .update(sections)
    .set({
      position: sql`${sections.position} - 1`,
      updated_at: new Date(),
    })
    .where(
      and(
        eq(sections.page_id, existing.page_id),
        gt(sections.position, existing.position)
      )
    );

  revalidatePath("/app");
  revalidatePath(`/app/sites/${page?.site_id}`);
  revalidatePath(`/app/sites/${page?.site_id}/pages/${existing.page_id}`);

  return { success: true };
}

/**
 * Reorder sections by updating their positions
 */
export async function reorderSections(
  pageId: string,
  sectionIds: string[]
): Promise<ActionResult> {
  const userId = await requireUserId();

  const ownership = await verifyPageOwnership(pageId, userId);
  if (!ownership.valid) {
    return { success: false, error: "Page not found" };
  }

  // Verify all sections belong to this page and user
  const existingSections = await db
    .select({ id: sections.id })
    .from(sections)
    .where(and(eq(sections.page_id, pageId), eq(sections.user_id, userId)));

  const existingIds = new Set(existingSections.map((s) => s.id));

  for (const id of sectionIds) {
    if (!existingIds.has(id)) {
      return { success: false, error: "Invalid section in reorder list" };
    }
  }

  // Update positions in a transaction
  await db.transaction(async (tx) => {
    for (let i = 0; i < sectionIds.length; i++) {
      await tx
        .update(sections)
        .set({
          position: i,
          updated_at: new Date(),
        })
        .where(eq(sections.id, sectionIds[i]));
    }
  });

  revalidatePath(`/app/sites/${ownership.siteId}/pages/${pageId}`);

  return { success: true };
}

/**
 * Duplicate a section, placing the copy immediately after the original
 */
export async function duplicateSection(
  sectionId: string
): Promise<CreateSectionResult> {
  const userId = await requireUserId();

  const [original] = await db
    .select()
    .from(sections)
    .where(eq(sections.id, sectionId))
    .limit(1);

  if (!original || original.user_id !== userId) {
    return { success: false, error: "Section not found" };
  }

  // Get siteId for revalidation
  const [page] = await db
    .select({ site_id: pages.site_id })
    .from(pages)
    .where(eq(pages.id, original.page_id))
    .limit(1);

  const newPosition = original.position + 1;

  // Shift sections after the original down
  await db
    .update(sections)
    .set({
      position: sql`${sections.position} + 1`,
      updated_at: new Date(),
    })
    .where(
      and(
        eq(sections.page_id, original.page_id),
        gt(sections.position, original.position)
      )
    );

  // Create the duplicate
  const [newSection] = await db
    .insert(sections)
    .values({
      page_id: original.page_id,
      user_id: userId,
      block_type: original.block_type,
      content: original.content,
      position: newPosition,
    })
    .returning({ id: sections.id });

  revalidatePath(`/app/sites/${page?.site_id}/pages/${original.page_id}`);

  return { success: true, sectionId: newSection.id };
}

/**
 * Move a section to a new position within the same page
 */
export async function moveSection(
  sectionId: string,
  newPosition: number
): Promise<ActionResult> {
  const userId = await requireUserId();

  const [existing] = await db
    .select({
      id: sections.id,
      page_id: sections.page_id,
      user_id: sections.user_id,
      position: sections.position,
    })
    .from(sections)
    .where(eq(sections.id, sectionId))
    .limit(1);

  if (!existing || existing.user_id !== userId) {
    return { success: false, error: "Section not found" };
  }

  const oldPosition = existing.position;

  if (oldPosition === newPosition) {
    return { success: true };
  }

  // Get siteId for revalidation
  const [page] = await db
    .select({ site_id: pages.site_id })
    .from(pages)
    .where(eq(pages.id, existing.page_id))
    .limit(1);

  await db.transaction(async (tx) => {
    if (newPosition > oldPosition) {
      // Moving down: shift sections between old and new positions up
      await tx
        .update(sections)
        .set({
          position: sql`${sections.position} - 1`,
          updated_at: new Date(),
        })
        .where(
          and(
            eq(sections.page_id, existing.page_id),
            gt(sections.position, oldPosition),
            gte(sql`${newPosition}`, sections.position)
          )
        );
    } else {
      // Moving up: shift sections between new and old positions down
      await tx
        .update(sections)
        .set({
          position: sql`${sections.position} + 1`,
          updated_at: new Date(),
        })
        .where(
          and(
            eq(sections.page_id, existing.page_id),
            gte(sections.position, newPosition),
            gt(sql`${oldPosition}`, sections.position)
          )
        );
    }

    // Update the moved section
    await tx
      .update(sections)
      .set({
        position: newPosition,
        updated_at: new Date(),
      })
      .where(eq(sections.id, sectionId));
  });

  revalidatePath(`/app/sites/${page?.site_id}/pages/${existing.page_id}`);

  return { success: true };
}

/**
 * Update a section's published status (draft/published)
 */
export async function updateSectionStatus(
  sectionId: string,
  status: SectionStatus
): Promise<ActionResult> {
  const userId = await requireUserId();

  const [existing] = await db
    .select({
      id: sections.id,
      page_id: sections.page_id,
      user_id: sections.user_id,
    })
    .from(sections)
    .where(eq(sections.id, sectionId))
    .limit(1);

  if (!existing || existing.user_id !== userId) {
    return { success: false, error: "Section not found" };
  }

  // Get siteId for revalidation
  const [page] = await db
    .select({ site_id: pages.site_id })
    .from(pages)
    .where(eq(pages.id, existing.page_id))
    .limit(1);

  await db
    .update(sections)
    .set({
      status,
      updated_at: new Date(),
    })
    .where(eq(sections.id, sectionId));

  revalidatePath(`/app/sites/${page?.site_id}/pages/${existing.page_id}`);

  // Also revalidate public site route
  if (page?.site_id) {
    revalidatePath(`/sites`);
  }

  return { success: true };
}

/**
 * Update a section's anchor ID for same-page navigation
 */
export async function updateSectionAnchorId(
  sectionId: string,
  anchorId: string | null
): Promise<ActionResult> {
  const userId = await requireUserId();

  const cleanId = anchorId?.trim() || null;
  if (cleanId && !isValidAnchorId(cleanId)) {
    return { success: false, error: "Invalid anchor ID format" };
  }

  const [existing] = await db
    .select({
      id: sections.id,
      page_id: sections.page_id,
      user_id: sections.user_id,
    })
    .from(sections)
    .where(eq(sections.id, sectionId))
    .limit(1);

  if (!existing || existing.user_id !== userId) {
    return { success: false, error: "Section not found" };
  }

  const [page] = await db
    .select({ site_id: pages.site_id })
    .from(pages)
    .where(eq(pages.id, existing.page_id))
    .limit(1);

  // Check for duplicate anchor IDs on same page
  if (cleanId) {
    const [duplicate] = await db
      .select({ id: sections.id })
      .from(sections)
      .where(
        and(
          eq(sections.page_id, existing.page_id),
          eq(sections.anchor_id, cleanId),
          ne(sections.id, sectionId)
        )
      )
      .limit(1);

    if (duplicate) {
      return { success: false, error: "This anchor ID is already used on this page" };
    }
  }

  await db
    .update(sections)
    .set({
      anchor_id: cleanId,
      updated_at: new Date(),
    })
    .where(eq(sections.id, sectionId));

  revalidatePath(`/app/sites/${page?.site_id}/pages/${existing.page_id}`);

  return { success: true };
}
