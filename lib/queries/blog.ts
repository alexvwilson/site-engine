import { db } from "@/lib/drizzle/db";
import { blogPosts, type BlogPost } from "@/lib/drizzle/schema/blog-posts";
import {
  blogCategories,
  type BlogCategory,
} from "@/lib/drizzle/schema/blog-categories";
import { sites } from "@/lib/drizzle/schema/sites";
import { users } from "@/lib/drizzle/schema/users";
import { pages } from "@/lib/drizzle/schema/pages";
import { eq, and, desc, lt, gt, lte } from "drizzle-orm";

/**
 * Sort options for blog posts in dashboard
 */
export type BlogSortOption =
  | "newest"
  | "oldest"
  | "updated"
  | "alphabetical"
  | "status";

/**
 * Get all posts for a site (admin view - includes drafts)
 * Includes category and page names for display
 */
export async function getPostsBySite(
  siteId: string
): Promise<(BlogPost & { categoryName: string | null; pageName: string | null })[]> {
  const results = await db
    .select({
      post: blogPosts,
      categoryName: blogCategories.name,
      pageName: pages.title,
    })
    .from(blogPosts)
    .leftJoin(blogCategories, eq(blogPosts.category_id, blogCategories.id))
    .leftJoin(pages, eq(blogPosts.page_id, pages.id))
    .where(eq(blogPosts.site_id, siteId))
    .orderBy(desc(blogPosts.updated_at));

  return results.map((row) => ({
    ...row.post,
    categoryName: row.categoryName,
    pageName: row.pageName,
  }));
}

/**
 * Get published posts for a site (public view) with author names and category
 */
export async function getPublishedPostsBySite(
  siteId: string,
  limit: number = 10,
  offset: number = 0
): Promise<(BlogPost & { authorName: string | null; categoryName: string | null; categorySlug: string | null })[]> {
  const results = await db
    .select({
      post: blogPosts,
      authorName: users.full_name,
      categoryName: blogCategories.name,
      categorySlug: blogCategories.slug,
    })
    .from(blogPosts)
    .leftJoin(users, eq(blogPosts.author_id, users.id))
    .leftJoin(blogCategories, eq(blogPosts.category_id, blogCategories.id))
    .where(
      and(
        eq(blogPosts.site_id, siteId),
        eq(blogPosts.status, "published"),
        lte(blogPosts.published_at, new Date())
      )
    )
    .orderBy(desc(blogPosts.published_at))
    .limit(limit)
    .offset(offset);

  return results.map((row) => ({
    ...row.post,
    authorName: row.authorName,
    categoryName: row.categoryName,
    categorySlug: row.categorySlug,
  }));
}

/**
 * Get total count of published posts for a site
 */
export async function getPublishedPostCount(siteId: string): Promise<number> {
  const result = await db
    .select({ id: blogPosts.id })
    .from(blogPosts)
    .where(
      and(
        eq(blogPosts.site_id, siteId),
        eq(blogPosts.status, "published"),
        lte(blogPosts.published_at, new Date())
      )
    );
  return result.length;
}

/**
 * Get total count of all posts for a site (admin badge)
 */
export async function getPostCount(siteId: string): Promise<number> {
  const result = await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.site_id, siteId));
  return result.length;
}

/**
 * Get a single post by ID (admin view)
 */
export async function getPostById(
  postId: string
): Promise<(BlogPost & { categoryName: string | null }) | null> {
  const [result] = await db
    .select({
      post: blogPosts,
      categoryName: blogCategories.name,
    })
    .from(blogPosts)
    .leftJoin(blogCategories, eq(blogPosts.category_id, blogCategories.id))
    .where(eq(blogPosts.id, postId))
    .limit(1);

  if (!result) return null;
  return { ...result.post, categoryName: result.categoryName };
}

/**
 * Get a single published post by ID with author (public view)
 */
export async function getPublishedPostById(
  postId: string
): Promise<(BlogPost & { authorName: string | null; categoryName: string | null; categorySlug: string | null }) | null> {
  const [result] = await db
    .select({
      post: blogPosts,
      authorName: users.full_name,
      categoryName: blogCategories.name,
      categorySlug: blogCategories.slug,
    })
    .from(blogPosts)
    .leftJoin(users, eq(blogPosts.author_id, users.id))
    .leftJoin(blogCategories, eq(blogPosts.category_id, blogCategories.id))
    .where(
      and(
        eq(blogPosts.id, postId),
        eq(blogPosts.status, "published"),
        lte(blogPosts.published_at, new Date())
      )
    )
    .limit(1);

  if (!result) return null;
  return {
    ...result.post,
    authorName: result.authorName,
    categoryName: result.categoryName,
    categorySlug: result.categorySlug,
  };
}

/**
 * Get post with author info and category
 */
export async function getPostWithAuthor(postId: string): Promise<
  | (BlogPost & {
      author: { id: string; full_name: string | null; email: string } | null;
      category: { id: string; name: string; slug: string } | null;
    })
  | null
> {
  const [result] = await db
    .select({
      post: blogPosts,
      author: {
        id: users.id,
        full_name: users.full_name,
        email: users.email,
      },
      category: {
        id: blogCategories.id,
        name: blogCategories.name,
        slug: blogCategories.slug,
      },
    })
    .from(blogPosts)
    .leftJoin(users, eq(blogPosts.author_id, users.id))
    .leftJoin(blogCategories, eq(blogPosts.category_id, blogCategories.id))
    .where(eq(blogPosts.id, postId))
    .limit(1);

  if (!result) return null;

  return {
    ...result.post,
    author: result.author,
    category: result.category?.id ? result.category : null,
  };
}

/**
 * Get a published post by site slug and post slug (public view)
 */
export async function getPublishedPostBySlug(
  siteSlug: string,
  postSlug: string
): Promise<
  | (BlogPost & {
      author: { id: string; full_name: string | null; email: string } | null;
      site: { id: string; name: string; show_blog_author: boolean; favicon_url: string | null };
      category: { id: string; name: string; slug: string } | null;
    })
  | null
> {
  const [result] = await db
    .select({
      post: blogPosts,
      author: {
        id: users.id,
        full_name: users.full_name,
        email: users.email,
      },
      site: {
        id: sites.id,
        name: sites.name,
        show_blog_author: sites.show_blog_author,
        favicon_url: sites.favicon_url,
      },
      category: {
        id: blogCategories.id,
        name: blogCategories.name,
        slug: blogCategories.slug,
      },
    })
    .from(blogPosts)
    .innerJoin(sites, eq(blogPosts.site_id, sites.id))
    .leftJoin(users, eq(blogPosts.author_id, users.id))
    .leftJoin(blogCategories, eq(blogPosts.category_id, blogCategories.id))
    .where(
      and(
        eq(sites.slug, siteSlug),
        eq(blogPosts.slug, postSlug),
        eq(blogPosts.status, "published"),
        lte(blogPosts.published_at, new Date())
      )
    )
    .limit(1);

  if (!result) return null;

  return {
    ...result.post,
    author: result.author,
    site: result.site,
    category: result.category?.id ? result.category : null,
  };
}

// ============================================================================
// Category Queries
// ============================================================================

/**
 * Get all categories for a site
 */
export async function getCategoriesBySite(siteId: string): Promise<BlogCategory[]> {
  return db
    .select()
    .from(blogCategories)
    .where(eq(blogCategories.site_id, siteId))
    .orderBy(blogCategories.name);
}

/**
 * Get a category by slug within a site
 */
export async function getCategoryBySlug(
  siteId: string,
  categorySlug: string
): Promise<BlogCategory | null> {
  const [category] = await db
    .select()
    .from(blogCategories)
    .where(
      and(
        eq(blogCategories.site_id, siteId),
        eq(blogCategories.slug, categorySlug)
      )
    )
    .limit(1);
  return category ?? null;
}

/**
 * Get published posts filtered by category
 */
export async function getPublishedPostsByCategory(
  siteId: string,
  categorySlug: string,
  limit: number = 10,
  offset: number = 0
): Promise<(BlogPost & { authorName: string | null; categoryName: string | null })[]> {
  const results = await db
    .select({
      post: blogPosts,
      authorName: users.full_name,
      categoryName: blogCategories.name,
    })
    .from(blogPosts)
    .leftJoin(users, eq(blogPosts.author_id, users.id))
    .innerJoin(blogCategories, eq(blogPosts.category_id, blogCategories.id))
    .where(
      and(
        eq(blogPosts.site_id, siteId),
        eq(blogPosts.status, "published"),
        eq(blogCategories.slug, categorySlug),
        lte(blogPosts.published_at, new Date())
      )
    )
    .orderBy(desc(blogPosts.published_at))
    .limit(limit)
    .offset(offset);

  return results.map((row) => ({
    ...row.post,
    authorName: row.authorName,
    categoryName: row.categoryName,
  }));
}

/**
 * Get count of published posts in a category
 */
export async function getPublishedPostCountByCategory(
  siteId: string,
  categorySlug: string
): Promise<number> {
  const result = await db
    .select({ id: blogPosts.id })
    .from(blogPosts)
    .innerJoin(blogCategories, eq(blogPosts.category_id, blogCategories.id))
    .where(
      and(
        eq(blogPosts.site_id, siteId),
        eq(blogPosts.status, "published"),
        eq(blogCategories.slug, categorySlug),
        lte(blogPosts.published_at, new Date())
      )
    );
  return result.length;
}

/**
 * Get adjacent posts (previous and next) for navigation
 */
export async function getAdjacentPosts(
  siteId: string,
  currentPublishedAt: Date
): Promise<{
  previous: { slug: string; title: string } | null;
  next: { slug: string; title: string } | null;
}> {
  // Previous post: most recent post published before current
  const [previous] = await db
    .select({ slug: blogPosts.slug, title: blogPosts.title })
    .from(blogPosts)
    .where(
      and(
        eq(blogPosts.site_id, siteId),
        eq(blogPosts.status, "published"),
        lt(blogPosts.published_at, currentPublishedAt),
        lte(blogPosts.published_at, new Date())
      )
    )
    .orderBy(desc(blogPosts.published_at))
    .limit(1);

  // Next post: oldest post published after current
  const [next] = await db
    .select({ slug: blogPosts.slug, title: blogPosts.title })
    .from(blogPosts)
    .where(
      and(
        eq(blogPosts.site_id, siteId),
        eq(blogPosts.status, "published"),
        gt(blogPosts.published_at, currentPublishedAt),
        lte(blogPosts.published_at, new Date())
      )
    )
    .orderBy(blogPosts.published_at)
    .limit(1);

  return {
    previous: previous ?? null,
    next: next ?? null,
  };
}
