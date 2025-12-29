import { db } from "@/lib/drizzle/db";
import { blogPosts, type BlogPost } from "@/lib/drizzle/schema/blog-posts";
import { sites } from "@/lib/drizzle/schema/sites";
import { users } from "@/lib/drizzle/schema/users";
import { eq, and, desc } from "drizzle-orm";

/**
 * Get all posts for a site (admin view - includes drafts)
 */
export async function getPostsBySite(siteId: string): Promise<BlogPost[]> {
  return db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.site_id, siteId))
    .orderBy(desc(blogPosts.updated_at));
}

/**
 * Get published posts for a site (public view) with author names
 */
export async function getPublishedPostsBySite(
  siteId: string,
  limit: number = 10,
  offset: number = 0
): Promise<(BlogPost & { authorName: string | null })[]> {
  const results = await db
    .select({
      post: blogPosts,
      authorName: users.full_name,
    })
    .from(blogPosts)
    .leftJoin(users, eq(blogPosts.author_id, users.id))
    .where(and(eq(blogPosts.site_id, siteId), eq(blogPosts.status, "published")))
    .orderBy(desc(blogPosts.published_at))
    .limit(limit)
    .offset(offset);

  return results.map((row) => ({
    ...row.post,
    authorName: row.authorName,
  }));
}

/**
 * Get total count of published posts for a site
 */
export async function getPublishedPostCount(siteId: string): Promise<number> {
  const result = await db
    .select()
    .from(blogPosts)
    .where(and(eq(blogPosts.site_id, siteId), eq(blogPosts.status, "published")));
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
export async function getPostById(postId: string): Promise<BlogPost | null> {
  const [post] = await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.id, postId))
    .limit(1);
  return post ?? null;
}

/**
 * Get a single published post by ID with author (public view)
 */
export async function getPublishedPostById(
  postId: string
): Promise<(BlogPost & { authorName: string | null }) | null> {
  const [result] = await db
    .select({
      post: blogPosts,
      authorName: users.full_name,
    })
    .from(blogPosts)
    .leftJoin(users, eq(blogPosts.author_id, users.id))
    .where(and(eq(blogPosts.id, postId), eq(blogPosts.status, "published")))
    .limit(1);

  if (!result) return null;
  return { ...result.post, authorName: result.authorName };
}

/**
 * Get post with author info
 */
export async function getPostWithAuthor(postId: string): Promise<
  | (BlogPost & {
      author: { id: string; full_name: string | null; email: string } | null;
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
    })
    .from(blogPosts)
    .leftJoin(users, eq(blogPosts.author_id, users.id))
    .where(eq(blogPosts.id, postId))
    .limit(1);

  if (!result) return null;

  return {
    ...result.post,
    author: result.author,
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
      site: { id: string; name: string; show_blog_author: boolean };
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
      },
    })
    .from(blogPosts)
    .innerJoin(sites, eq(blogPosts.site_id, sites.id))
    .leftJoin(users, eq(blogPosts.author_id, users.id))
    .where(
      and(
        eq(sites.slug, siteSlug),
        eq(blogPosts.slug, postSlug),
        eq(blogPosts.status, "published")
      )
    )
    .limit(1);

  if (!result) return null;

  return {
    ...result.post,
    author: result.author,
    site: result.site,
  };
}
