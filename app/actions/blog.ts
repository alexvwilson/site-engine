"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/drizzle/db";
import { blogPosts } from "@/lib/drizzle/schema/blog-posts";
import {
  blogCategories,
  type BlogCategory,
} from "@/lib/drizzle/schema/blog-categories";
import { sites } from "@/lib/drizzle/schema/sites";
import { requireUserId } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

export interface ActionResult {
  success: boolean;
  error?: string;
}

export interface CreatePostResult {
  success: boolean;
  postId?: string;
  error?: string;
}

export interface CreateCategoryResult {
  success: boolean;
  category?: BlogCategory;
  error?: string;
}

/**
 * Generate URL-safe slug from title
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
 * Generate unique slug within site
 */
async function generateUniqueSlug(
  siteId: string,
  baseTitle: string
): Promise<string> {
  const baseSlug = generateSlug(baseTitle) || "untitled";
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await db
      .select({ id: blogPosts.id })
      .from(blogPosts)
      .where(and(eq(blogPosts.site_id, siteId), eq(blogPosts.slug, slug)))
      .limit(1);

    if (existing.length === 0) return slug;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

/**
 * Verify user owns site
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

/**
 * Get site ID for a post and verify ownership
 */
async function getPostSiteId(
  postId: string,
  userId: string
): Promise<string | null> {
  const [post] = await db
    .select({ site_id: blogPosts.site_id })
    .from(blogPosts)
    .where(eq(blogPosts.id, postId))
    .limit(1);

  if (!post) return null;

  const ownsPost = await verifySiteOwnership(post.site_id, userId);
  if (!ownsPost) return null;

  return post.site_id;
}

/**
 * Create a new draft blog post
 */
export async function createPost(
  siteId: string,
  options?: { category_id?: string | null }
): Promise<CreatePostResult> {
  const userId = await requireUserId();

  // Get site and verify ownership
  const [site] = await db
    .select({
      id: sites.id,
      user_id: sites.user_id,
      default_blog_category_id: sites.default_blog_category_id,
    })
    .from(sites)
    .where(eq(sites.id, siteId))
    .limit(1);

  if (!site || site.user_id !== userId) {
    return { success: false, error: "Site not found" };
  }

  const slug = await generateUniqueSlug(siteId, "Untitled Post");

  // Use provided category or fall back to site's default
  const categoryId = options?.category_id ?? site.default_blog_category_id;

  const [post] = await db
    .insert(blogPosts)
    .values({
      site_id: siteId,
      author_id: userId,
      title: "Untitled Post",
      slug,
      category_id: categoryId,
    })
    .returning({ id: blogPosts.id });

  revalidatePath(`/app/sites/${siteId}`);
  return { success: true, postId: post.id };
}

export interface UpdatePostData {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: { html: string };
  featured_image?: string | null;
  featured_image_alt?: string | null;
  category_id?: string | null;
  page_id?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
}

/**
 * Update a blog post
 */
export async function updatePost(
  postId: string,
  data: UpdatePostData
): Promise<ActionResult> {
  const userId = await requireUserId();

  const siteId = await getPostSiteId(postId, userId);
  if (!siteId) {
    return { success: false, error: "Post not found" };
  }

  const updateData: Partial<typeof blogPosts.$inferInsert> = {
    updated_at: new Date(),
  };

  if (data.title !== undefined) {
    updateData.title = data.title.trim();
  }
  if (data.slug !== undefined) {
    const newSlug = data.slug.trim().toLowerCase();
    // Check if slug is taken by another post in the same site
    const [existing] = await db
      .select({ id: blogPosts.id })
      .from(blogPosts)
      .where(
        and(
          eq(blogPosts.site_id, siteId),
          eq(blogPosts.slug, newSlug)
        )
      )
      .limit(1);

    if (existing && existing.id !== postId) {
      return { success: false, error: "This slug is already taken" };
    }
    updateData.slug = newSlug;
  }
  if (data.excerpt !== undefined) {
    updateData.excerpt = data.excerpt.trim() || null;
  }
  if (data.content !== undefined) {
    updateData.content = data.content;
  }
  if (data.featured_image !== undefined) {
    updateData.featured_image = data.featured_image;
  }
  if (data.featured_image_alt !== undefined) {
    updateData.featured_image_alt = data.featured_image_alt;
  }
  if (data.category_id !== undefined) {
    updateData.category_id = data.category_id;
  }
  if (data.page_id !== undefined) {
    updateData.page_id = data.page_id;
  }
  if (data.meta_title !== undefined) {
    updateData.meta_title = data.meta_title?.trim() || null;
  }
  if (data.meta_description !== undefined) {
    updateData.meta_description = data.meta_description?.trim() || null;
  }

  await db.update(blogPosts).set(updateData).where(eq(blogPosts.id, postId));

  revalidatePath(`/app/sites/${siteId}`);
  revalidatePath(`/app/sites/${siteId}/blog/${postId}`);
  return { success: true };
}

/**
 * Publish a blog post (optionally schedule for future)
 * @param postId - The post ID
 * @param scheduledAt - Optional future date to schedule the post (ISO string or Date)
 */
export async function publishPost(
  postId: string,
  scheduledAt?: string | Date | null
): Promise<ActionResult> {
  const userId = await requireUserId();

  const siteId = await getPostSiteId(postId, userId);
  if (!siteId) {
    return { success: false, error: "Post not found" };
  }

  // Get the post to check if it has content
  const [post] = await db
    .select({ title: blogPosts.title, content: blogPosts.content })
    .from(blogPosts)
    .where(eq(blogPosts.id, postId))
    .limit(1);

  if (!post.title || post.title === "Untitled Post") {
    return { success: false, error: "Please add a title before publishing" };
  }

  // Parse scheduled date if provided, otherwise use now
  const publishDate = scheduledAt
    ? typeof scheduledAt === "string"
      ? new Date(scheduledAt)
      : scheduledAt
    : new Date();

  await db
    .update(blogPosts)
    .set({
      status: "published",
      published_at: publishDate,
      updated_at: new Date(),
    })
    .where(eq(blogPosts.id, postId));

  // Revalidate public blog pages
  const [site] = await db
    .select({ slug: sites.slug })
    .from(sites)
    .where(eq(sites.id, siteId))
    .limit(1);

  if (site) {
    revalidatePath(`/sites/${site.slug}/blog`);
  }

  revalidatePath(`/app/sites/${siteId}`);
  return { success: true };
}

/**
 * Unpublish a blog post (revert to draft)
 */
export async function unpublishPost(postId: string): Promise<ActionResult> {
  const userId = await requireUserId();

  const siteId = await getPostSiteId(postId, userId);
  if (!siteId) {
    return { success: false, error: "Post not found" };
  }

  await db
    .update(blogPosts)
    .set({
      status: "draft",
      updated_at: new Date(),
    })
    .where(eq(blogPosts.id, postId));

  // Revalidate public blog pages
  const [site] = await db
    .select({ slug: sites.slug })
    .from(sites)
    .where(eq(sites.id, siteId))
    .limit(1);

  if (site) {
    revalidatePath(`/sites/${site.slug}/blog`);
  }

  revalidatePath(`/app/sites/${siteId}`);
  return { success: true };
}

/**
 * Delete a blog post
 */
export async function deletePost(postId: string): Promise<ActionResult> {
  const userId = await requireUserId();

  const siteId = await getPostSiteId(postId, userId);
  if (!siteId) {
    return { success: false, error: "Post not found" };
  }

  // Get site slug for revalidation before deleting
  const [site] = await db
    .select({ slug: sites.slug })
    .from(sites)
    .where(eq(sites.id, siteId))
    .limit(1);

  await db.delete(blogPosts).where(eq(blogPosts.id, postId));

  if (site) {
    revalidatePath(`/sites/${site.slug}/blog`);
  }

  revalidatePath(`/app/sites/${siteId}`);
  return { success: true };
}

// ============================================================================
// Category Actions
// ============================================================================

/**
 * Generate unique category slug within site
 */
async function generateUniqueCategorySlug(
  siteId: string,
  baseName: string
): Promise<string> {
  const baseSlug = generateSlug(baseName) || "category";
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await db
      .select({ id: blogCategories.id })
      .from(blogCategories)
      .where(and(eq(blogCategories.site_id, siteId), eq(blogCategories.slug, slug)))
      .limit(1);

    if (existing.length === 0) return slug;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

/**
 * Create a new blog category
 */
export async function createCategory(
  siteId: string,
  data: { name: string; description?: string }
): Promise<CreateCategoryResult> {
  const userId = await requireUserId();

  if (!(await verifySiteOwnership(siteId, userId))) {
    return { success: false, error: "Site not found" };
  }

  const name = data.name.trim();
  if (!name) {
    return { success: false, error: "Category name is required" };
  }

  const slug = await generateUniqueCategorySlug(siteId, name);

  const [category] = await db
    .insert(blogCategories)
    .values({
      site_id: siteId,
      name,
      slug,
      description: data.description?.trim() || null,
    })
    .returning();

  revalidatePath(`/app/sites/${siteId}`);
  return { success: true, category };
}

/**
 * Update an existing category
 */
export async function updateCategory(
  categoryId: string,
  data: { name?: string; description?: string }
): Promise<ActionResult> {
  const userId = await requireUserId();

  // Get category and verify site ownership
  const [category] = await db
    .select({ site_id: blogCategories.site_id })
    .from(blogCategories)
    .where(eq(blogCategories.id, categoryId))
    .limit(1);

  if (!category) {
    return { success: false, error: "Category not found" };
  }

  if (!(await verifySiteOwnership(category.site_id, userId))) {
    return { success: false, error: "Category not found" };
  }

  const updateData: Partial<typeof blogCategories.$inferInsert> = {};

  if (data.name !== undefined) {
    const name = data.name.trim();
    if (!name) {
      return { success: false, error: "Category name is required" };
    }
    updateData.name = name;
    updateData.slug = await generateUniqueCategorySlug(category.site_id, name);
  }

  if (data.description !== undefined) {
    updateData.description = data.description.trim() || null;
  }

  if (Object.keys(updateData).length > 0) {
    await db
      .update(blogCategories)
      .set(updateData)
      .where(eq(blogCategories.id, categoryId));
  }

  revalidatePath(`/app/sites/${category.site_id}`);
  return { success: true };
}

/**
 * Delete a category (posts will have category_id set to null)
 */
export async function deleteCategory(categoryId: string): Promise<ActionResult> {
  const userId = await requireUserId();

  // Get category and verify site ownership
  const [category] = await db
    .select({ site_id: blogCategories.site_id })
    .from(blogCategories)
    .where(eq(blogCategories.id, categoryId))
    .limit(1);

  if (!category) {
    return { success: false, error: "Category not found" };
  }

  if (!(await verifySiteOwnership(category.site_id, userId))) {
    return { success: false, error: "Category not found" };
  }

  // Check if this is the site's default category
  const [site] = await db
    .select({ default_blog_category_id: sites.default_blog_category_id })
    .from(sites)
    .where(eq(sites.id, category.site_id))
    .limit(1);

  // Clear default if this category is the default
  if (site?.default_blog_category_id === categoryId) {
    await db
      .update(sites)
      .set({ default_blog_category_id: null })
      .where(eq(sites.id, category.site_id));
  }

  await db.delete(blogCategories).where(eq(blogCategories.id, categoryId));

  revalidatePath(`/app/sites/${category.site_id}`);
  return { success: true };
}
