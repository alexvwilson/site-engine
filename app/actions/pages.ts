"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/drizzle/db";
import { pages } from "@/lib/drizzle/schema/pages";
import { sites } from "@/lib/drizzle/schema/sites";
import { requireUserId } from "@/lib/auth";
import { eq, and, count } from "drizzle-orm";

/**
 * Generate a URL-safe slug from a title
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 50);
}

/**
 * Generate a unique slug within a site by appending a number if needed
 */
async function generateUniqueSlug(
  siteId: string,
  baseTitle: string,
  excludePageId?: string
): Promise<string> {
  const baseSlug = generateSlug(baseTitle);
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const query = db
      .select({ id: pages.id })
      .from(pages)
      .where(and(eq(pages.site_id, siteId), eq(pages.slug, slug)))
      .limit(1);

    const existing = await query;

    if (existing.length === 0 || existing[0].id === excludePageId) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

/**
 * Verify user owns the site
 */
async function verifySiteOwnership(
  siteId: string,
  userId: string
): Promise<boolean> {
  const [site] = await db
    .select({ id: sites.id })
    .from(sites)
    .where(and(eq(sites.id, siteId), eq(sites.user_id, userId)))
    .limit(1);

  return !!site;
}

export interface CreatePageData {
  title: string;
  slug?: string;
}

export interface CreatePageResult {
  success: boolean;
  pageId?: string;
  error?: string;
}

/**
 * Create a new page in a site
 * First page automatically becomes homepage
 */
export async function createPage(
  siteId: string,
  data: CreatePageData
): Promise<CreatePageResult> {
  const userId = await requireUserId();

  const ownsPage = await verifySiteOwnership(siteId, userId);
  if (!ownsPage) {
    return { success: false, error: "Site not found" };
  }

  const title = data.title.trim();
  if (!title) {
    return { success: false, error: "Page title is required" };
  }

  const slug = data.slug?.trim()
    ? generateSlug(data.slug)
    : await generateUniqueSlug(siteId, title);

  // Check if slug is unique within site
  const [existingSlug] = await db
    .select({ id: pages.id })
    .from(pages)
    .where(and(eq(pages.site_id, siteId), eq(pages.slug, slug)))
    .limit(1);

  if (existingSlug) {
    return { success: false, error: "A page with this slug already exists" };
  }

  // Check if this is the first page (should become homepage)
  const [pageCountResult] = await db
    .select({ count: count() })
    .from(pages)
    .where(eq(pages.site_id, siteId));

  const isFirstPage = (pageCountResult?.count ?? 0) === 0;

  const [page] = await db
    .insert(pages)
    .values({
      site_id: siteId,
      user_id: userId,
      title,
      slug,
      is_home: isFirstPage,
    })
    .returning({ id: pages.id });

  revalidatePath("/app");
  revalidatePath(`/app/sites/${siteId}`);
  return { success: true, pageId: page.id };
}

export interface UpdatePageData {
  title?: string;
  slug?: string;
  meta_title?: string;
  meta_description?: string;
}

export interface ActionResult {
  success: boolean;
  error?: string;
}

/**
 * Update a page's details
 */
export async function updatePage(
  pageId: string,
  data: UpdatePageData
): Promise<ActionResult> {
  const userId = await requireUserId();

  const [existing] = await db
    .select()
    .from(pages)
    .where(eq(pages.id, pageId))
    .limit(1);

  if (!existing || existing.user_id !== userId) {
    return { success: false, error: "Page not found" };
  }

  const updateData: Partial<typeof pages.$inferInsert> = {
    updated_at: new Date(),
  };

  if (data.title !== undefined) {
    updateData.title = data.title.trim();
  }
  if (data.slug !== undefined) {
    const newSlug = generateSlug(data.slug.trim());
    // Check uniqueness within site
    const [existingSlug] = await db
      .select({ id: pages.id })
      .from(pages)
      .where(
        and(eq(pages.site_id, existing.site_id), eq(pages.slug, newSlug))
      )
      .limit(1);

    if (existingSlug && existingSlug.id !== pageId) {
      return { success: false, error: "A page with this slug already exists" };
    }
    updateData.slug = newSlug;
  }
  if (data.meta_title !== undefined) {
    updateData.meta_title = data.meta_title.trim() || null;
  }
  if (data.meta_description !== undefined) {
    updateData.meta_description = data.meta_description.trim() || null;
  }

  await db.update(pages).set(updateData).where(eq(pages.id, pageId));

  revalidatePath("/app");
  revalidatePath(`/app/sites/${existing.site_id}`);
  return { success: true };
}

/**
 * Delete a page
 */
export async function deletePage(pageId: string): Promise<ActionResult> {
  const userId = await requireUserId();

  const [existing] = await db
    .select({ id: pages.id, site_id: pages.site_id, user_id: pages.user_id })
    .from(pages)
    .where(eq(pages.id, pageId))
    .limit(1);

  if (!existing || existing.user_id !== userId) {
    return { success: false, error: "Page not found" };
  }

  await db.delete(pages).where(eq(pages.id, pageId));

  revalidatePath("/app");
  revalidatePath(`/app/sites/${existing.site_id}`);
  return { success: true };
}

/**
 * Publish a page
 */
export async function publishPage(pageId: string): Promise<ActionResult> {
  const userId = await requireUserId();

  const [existing] = await db
    .select({ id: pages.id, site_id: pages.site_id, user_id: pages.user_id })
    .from(pages)
    .where(eq(pages.id, pageId))
    .limit(1);

  if (!existing || existing.user_id !== userId) {
    return { success: false, error: "Page not found" };
  }

  await db
    .update(pages)
    .set({
      status: "published",
      published_at: new Date(),
      updated_at: new Date(),
    })
    .where(eq(pages.id, pageId));

  revalidatePath("/app");
  revalidatePath(`/app/sites/${existing.site_id}`);
  return { success: true };
}

/**
 * Unpublish a page
 */
export async function unpublishPage(pageId: string): Promise<ActionResult> {
  const userId = await requireUserId();

  const [existing] = await db
    .select({ id: pages.id, site_id: pages.site_id, user_id: pages.user_id })
    .from(pages)
    .where(eq(pages.id, pageId))
    .limit(1);

  if (!existing || existing.user_id !== userId) {
    return { success: false, error: "Page not found" };
  }

  await db
    .update(pages)
    .set({
      status: "draft",
      updated_at: new Date(),
    })
    .where(eq(pages.id, pageId));

  revalidatePath("/app");
  revalidatePath(`/app/sites/${existing.site_id}`);
  return { success: true };
}

/**
 * Duplicate a page
 */
export async function duplicatePage(pageId: string): Promise<CreatePageResult> {
  const userId = await requireUserId();

  const [original] = await db.select().from(pages).where(eq(pages.id, pageId)).limit(1);

  if (!original || original.user_id !== userId) {
    return { success: false, error: "Page not found" };
  }

  const newSlug = await generateUniqueSlug(
    original.site_id,
    `${original.title}-copy`
  );

  const [newPage] = await db
    .insert(pages)
    .values({
      site_id: original.site_id,
      user_id: userId,
      title: `${original.title} (Copy)`,
      slug: newSlug,
      status: "draft",
      is_home: false,
      meta_title: original.meta_title,
      meta_description: original.meta_description,
    })
    .returning({ id: pages.id });

  revalidatePath("/app");
  revalidatePath(`/app/sites/${original.site_id}`);
  return { success: true, pageId: newPage.id };
}

/**
 * Set a page as homepage (unsets other pages)
 */
export async function setAsHomePage(pageId: string): Promise<ActionResult> {
  const userId = await requireUserId();

  const [page] = await db
    .select({ id: pages.id, site_id: pages.site_id, user_id: pages.user_id })
    .from(pages)
    .where(eq(pages.id, pageId))
    .limit(1);

  if (!page || page.user_id !== userId) {
    return { success: false, error: "Page not found" };
  }

  // Use a transaction to atomically unset other homepages and set this one
  await db.transaction(async (tx) => {
    // Unset all other homepages in this site
    await tx
      .update(pages)
      .set({ is_home: false, updated_at: new Date() })
      .where(and(eq(pages.site_id, page.site_id), eq(pages.is_home, true)));

    // Set this page as homepage
    await tx
      .update(pages)
      .set({ is_home: true, updated_at: new Date() })
      .where(eq(pages.id, pageId));
  });

  revalidatePath("/app");
  revalidatePath(`/app/sites/${page.site_id}`);
  return { success: true };
}
