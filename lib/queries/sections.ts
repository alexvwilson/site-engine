import { db } from "@/lib/drizzle/db";
import { sections, type Section } from "@/lib/drizzle/schema/sections";
import { pages } from "@/lib/drizzle/schema/pages";
import { eq, and, asc } from "drizzle-orm";

/**
 * Get all sections for a page, ordered by position
 */
export async function getSectionsByPage(
  pageId: string,
  userId: string
): Promise<Section[]> {
  return db
    .select()
    .from(sections)
    .where(and(eq(sections.page_id, pageId), eq(sections.user_id, userId)))
    .orderBy(asc(sections.position));
}

/**
 * Get a single section by ID with ownership verification
 */
export async function getSectionById(
  sectionId: string,
  userId: string
): Promise<Section | null> {
  const [section] = await db
    .select()
    .from(sections)
    .where(eq(sections.id, sectionId))
    .limit(1);

  if (!section || section.user_id !== userId) {
    return null;
  }

  return section;
}

/**
 * Get section with page info for navigation context
 */
export async function getSectionWithPage(
  sectionId: string,
  userId: string
): Promise<{ section: Section; pageId: string; siteId: string } | null> {
  const [result] = await db
    .select({
      section: sections,
      pageId: pages.id,
      siteId: pages.site_id,
    })
    .from(sections)
    .innerJoin(pages, eq(sections.page_id, pages.id))
    .where(and(eq(sections.id, sectionId), eq(sections.user_id, userId)))
    .limit(1);

  if (!result) {
    return null;
  }

  return {
    section: result.section,
    pageId: result.pageId,
    siteId: result.siteId,
  };
}

/**
 * Get the maximum position for sections in a page (for adding new sections)
 */
export async function getMaxSectionPosition(pageId: string): Promise<number> {
  const [result] = await db
    .select({ position: sections.position })
    .from(sections)
    .where(eq(sections.page_id, pageId))
    .orderBy(asc(sections.position))
    .limit(1);

  // If no sections exist, return -1 so the first section is at position 0
  if (!result) {
    return -1;
  }

  // Get the actual max position
  const allSections = await db
    .select({ position: sections.position })
    .from(sections)
    .where(eq(sections.page_id, pageId));

  return Math.max(...allSections.map((s) => s.position), -1);
}

/**
 * Get section count for a page
 */
export async function getSectionCount(pageId: string): Promise<number> {
  const result = await db
    .select({ position: sections.position })
    .from(sections)
    .where(eq(sections.page_id, pageId));

  return result.length;
}

/**
 * Get published sections for a page (public access - no auth check)
 */
export async function getPublishedSectionsByPage(pageId: string): Promise<Section[]> {
  return db
    .select()
    .from(sections)
    .where(and(eq(sections.page_id, pageId), eq(sections.status, "published")))
    .orderBy(asc(sections.position));
}
