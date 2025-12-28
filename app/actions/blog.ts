"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/drizzle/db";
import { blogPosts } from "@/lib/drizzle/schema/blog-posts";
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
export async function createPost(siteId: string): Promise<CreatePostResult> {
  const userId = await requireUserId();

  if (!(await verifySiteOwnership(siteId, userId))) {
    return { success: false, error: "Site not found" };
  }

  const slug = await generateUniqueSlug(siteId, "Untitled Post");

  const [post] = await db
    .insert(blogPosts)
    .values({
      site_id: siteId,
      author_id: userId,
      title: "Untitled Post",
      slug,
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

  await db.update(blogPosts).set(updateData).where(eq(blogPosts.id, postId));

  revalidatePath(`/app/sites/${siteId}`);
  revalidatePath(`/app/sites/${siteId}/blog/${postId}`);
  return { success: true };
}

/**
 * Publish a blog post
 */
export async function publishPost(postId: string): Promise<ActionResult> {
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

  await db
    .update(blogPosts)
    .set({
      status: "published",
      published_at: new Date(),
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
