"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/drizzle/db";
import { sites, type ColorMode, COLOR_MODES } from "@/lib/drizzle/schema/sites";
import { requireUserId } from "@/lib/auth";
import { eq, and, ne } from "drizzle-orm";
import type { HeaderContent, FooterContent } from "@/lib/section-types";

/**
 * Generate a URL-safe slug from a name
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 50);
}

/**
 * Generate a unique slug by appending a number if needed
 */
async function generateUniqueSlug(baseName: string): Promise<string> {
  const baseSlug = generateSlug(baseName);
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await db
      .select({ id: sites.id })
      .from(sites)
      .where(eq(sites.slug, slug))
      .limit(1);

    if (existing.length === 0) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

export interface CreateSiteData {
  name: string;
  description?: string;
}

export interface CreateSiteResult {
  success: boolean;
  siteId?: string;
  error?: string;
}

/**
 * Create a new site
 */
export async function createSite(data: CreateSiteData): Promise<CreateSiteResult> {
  const userId = await requireUserId();

  const name = data.name.trim();
  if (!name) {
    return { success: false, error: "Site name is required" };
  }

  const slug = await generateUniqueSlug(name);

  const [site] = await db
    .insert(sites)
    .values({
      user_id: userId,
      name,
      description: data.description?.trim() || null,
      slug,
    })
    .returning({ id: sites.id });

  revalidatePath("/app");
  return { success: true, siteId: site.id };
}

export interface UpdateSiteData {
  name?: string;
  description?: string;
  slug?: string;
}

export interface ActionResult {
  success: boolean;
  error?: string;
}

/**
 * Update a site's details
 */
export async function updateSite(
  siteId: string,
  data: UpdateSiteData
): Promise<ActionResult> {
  const userId = await requireUserId();

  const [existing] = await db
    .select()
    .from(sites)
    .where(and(eq(sites.id, siteId), eq(sites.user_id, userId)))
    .limit(1);

  if (!existing) {
    return { success: false, error: "Site not found" };
  }

  const updateData: Partial<typeof sites.$inferInsert> = {
    updated_at: new Date(),
  };

  if (data.name !== undefined) {
    updateData.name = data.name.trim();
  }
  if (data.description !== undefined) {
    updateData.description = data.description.trim() || null;
  }
  if (data.slug !== undefined) {
    updateData.slug = data.slug.trim();
  }

  await db
    .update(sites)
    .set(updateData)
    .where(eq(sites.id, siteId));

  revalidatePath("/app");
  revalidatePath(`/app/sites/${siteId}`);
  return { success: true };
}

/**
 * Delete a site
 */
export async function deleteSite(siteId: string): Promise<ActionResult> {
  const userId = await requireUserId();

  const result = await db
    .delete(sites)
    .where(and(eq(sites.id, siteId), eq(sites.user_id, userId)))
    .returning({ id: sites.id });

  if (result.length === 0) {
    return { success: false, error: "Site not found" };
  }

  revalidatePath("/app");
  return { success: true };
}

/**
 * Publish a site
 */
export async function publishSite(siteId: string): Promise<ActionResult> {
  const userId = await requireUserId();

  const result = await db
    .update(sites)
    .set({
      status: "published",
      published_at: new Date(),
      updated_at: new Date(),
    })
    .where(and(eq(sites.id, siteId), eq(sites.user_id, userId)))
    .returning({ id: sites.id });

  if (result.length === 0) {
    return { success: false, error: "Site not found" };
  }

  revalidatePath("/app");
  revalidatePath(`/app/sites/${siteId}`);
  return { success: true };
}

/**
 * Unpublish a site
 */
export async function unpublishSite(siteId: string): Promise<ActionResult> {
  const userId = await requireUserId();

  const result = await db
    .update(sites)
    .set({
      status: "draft",
      updated_at: new Date(),
    })
    .where(and(eq(sites.id, siteId), eq(sites.user_id, userId)))
    .returning({ id: sites.id });

  if (result.length === 0) {
    return { success: false, error: "Site not found" };
  }

  revalidatePath("/app");
  revalidatePath(`/app/sites/${siteId}`);
  return { success: true };
}

/**
 * Get basic site info for sidebar display
 */
export async function getSiteBasicInfo(
  siteId: string
): Promise<{ name: string } | null> {
  const userId = await requireUserId();

  const [site] = await db
    .select({ name: sites.name })
    .from(sites)
    .where(and(eq(sites.id, siteId), eq(sites.user_id, userId)))
    .limit(1);

  return site ?? null;
}

export interface UpdateSiteSettingsData {
  slug?: string;
  customDomain?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  colorMode?: ColorMode;
  headerContent?: HeaderContent | null;
  footerContent?: FooterContent | null;
  underConstruction?: boolean;
  constructionTitle?: string | null;
  constructionDescription?: string | null;
}

/**
 * Check if a slug is already taken by another site
 */
async function isSlugTaken(slug: string, excludeSiteId: string): Promise<boolean> {
  const [existing] = await db
    .select({ id: sites.id })
    .from(sites)
    .where(and(eq(sites.slug, slug), ne(sites.id, excludeSiteId)))
    .limit(1);

  return !!existing;
}

/**
 * Update site settings (slug, custom domain, SEO)
 */
export async function updateSiteSettings(
  siteId: string,
  data: UpdateSiteSettingsData
): Promise<ActionResult> {
  const userId = await requireUserId();

  const [existing] = await db
    .select()
    .from(sites)
    .where(and(eq(sites.id, siteId), eq(sites.user_id, userId)))
    .limit(1);

  if (!existing) {
    return { success: false, error: "Site not found" };
  }

  // Validate slug if changing
  if (data.slug !== undefined && data.slug !== existing.slug) {
    const slug = data.slug.trim().toLowerCase();

    if (!slug) {
      return { success: false, error: "Slug cannot be empty" };
    }

    if (!/^[a-z0-9-]+$/.test(slug)) {
      return { success: false, error: "Slug can only contain lowercase letters, numbers, and hyphens" };
    }

    if (await isSlugTaken(slug, siteId)) {
      return { success: false, error: "This slug is already taken" };
    }
  }

  const updateData: Partial<typeof sites.$inferInsert> = {
    updated_at: new Date(),
  };

  if (data.slug !== undefined) {
    updateData.slug = data.slug.trim().toLowerCase();
  }
  if (data.customDomain !== undefined) {
    updateData.custom_domain = data.customDomain?.trim() || null;
  }
  if (data.metaTitle !== undefined) {
    updateData.meta_title = data.metaTitle?.trim() || null;
  }
  if (data.metaDescription !== undefined) {
    updateData.meta_description = data.metaDescription?.trim() || null;
  }
  if (data.colorMode !== undefined && COLOR_MODES.includes(data.colorMode)) {
    updateData.color_mode = data.colorMode;
  }
  if (data.headerContent !== undefined) {
    updateData.header_content = data.headerContent;
  }
  if (data.footerContent !== undefined) {
    updateData.footer_content = data.footerContent;
  }
  if (data.underConstruction !== undefined) {
    updateData.under_construction = data.underConstruction;
  }
  if (data.constructionTitle !== undefined) {
    updateData.construction_title = data.constructionTitle?.trim() || null;
  }
  if (data.constructionDescription !== undefined) {
    updateData.construction_description = data.constructionDescription?.trim() || null;
  }

  await db.update(sites).set(updateData).where(eq(sites.id, siteId));

  revalidatePath("/app", "page");
  revalidatePath(`/app/sites/${siteId}`, "page");

  // Revalidate public site routes - use "layout" type to invalidate all pages under the site
  revalidatePath(`/sites/${existing.slug}`, "layout");
  if (data.slug && data.slug !== existing.slug) {
    revalidatePath(`/sites/${data.slug}`, "layout");
  }

  return { success: true };
}
