import { db } from "@/lib/drizzle/db";
import { pages, type Page } from "@/lib/drizzle/schema/pages";
import { eq, and, desc, count } from "drizzle-orm";

/**
 * Get all pages for a site with ownership verification
 */
export async function getPagesBySite(
  siteId: string,
  userId: string
): Promise<Page[]> {
  return db
    .select()
    .from(pages)
    .where(and(eq(pages.site_id, siteId), eq(pages.user_id, userId)))
    .orderBy(desc(pages.updated_at));
}

/**
 * Get a single page by ID with ownership verification
 */
export async function getPageById(
  pageId: string,
  userId: string
): Promise<Page | null> {
  const [page] = await db
    .select()
    .from(pages)
    .where(eq(pages.id, pageId))
    .limit(1);

  if (!page || page.user_id !== userId) {
    return null;
  }

  return page;
}

/**
 * Get a page by slug within a site (for URL routing)
 */
export async function getPageBySlug(
  siteId: string,
  slug: string
): Promise<Page | null> {
  const [page] = await db
    .select()
    .from(pages)
    .where(and(eq(pages.site_id, siteId), eq(pages.slug, slug)))
    .limit(1);

  return page ?? null;
}

/**
 * Get page count for a site
 */
export async function getPageCount(siteId: string): Promise<number> {
  const [result] = await db
    .select({ count: count() })
    .from(pages)
    .where(eq(pages.site_id, siteId));

  return result?.count ?? 0;
}

/**
 * Get homepage for a site
 */
export async function getHomePage(
  siteId: string,
  userId: string
): Promise<Page | null> {
  const [page] = await db
    .select()
    .from(pages)
    .where(
      and(
        eq(pages.site_id, siteId),
        eq(pages.user_id, userId),
        eq(pages.is_home, true)
      )
    )
    .limit(1);

  return page ?? null;
}

/**
 * Get published homepage for a site (public access - no auth check)
 */
export async function getPublishedHomePage(siteId: string): Promise<Page | null> {
  const [page] = await db
    .select()
    .from(pages)
    .where(
      and(
        eq(pages.site_id, siteId),
        eq(pages.status, "published"),
        eq(pages.is_home, true)
      )
    )
    .limit(1);

  return page ?? null;
}

/**
 * Get a published page by slug (public access - no auth check)
 */
export async function getPublishedPageBySlug(
  siteId: string,
  slug: string
): Promise<Page | null> {
  const [page] = await db
    .select()
    .from(pages)
    .where(
      and(
        eq(pages.site_id, siteId),
        eq(pages.slug, slug),
        eq(pages.status, "published")
      )
    )
    .limit(1);

  return page ?? null;
}
