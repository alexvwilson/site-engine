import { db } from "@/lib/drizzle/db";
import { sites } from "@/lib/drizzle/schema/sites";
import { pages } from "@/lib/drizzle/schema/pages";
import { blogPosts } from "@/lib/drizzle/schema/blog-posts";
import { blogCategories } from "@/lib/drizzle/schema/blog-categories";
import { eq, and } from "drizzle-orm";

export interface SitemapData {
  site: {
    id: string;
    slug: string;
    custom_domain: string | null;
    updated_at: Date;
  };
  pages: Array<{
    slug: string;
    is_home: boolean;
    updated_at: Date;
  }>;
  posts: Array<{
    slug: string;
    published_at: Date | null;
    updated_at: Date;
  }>;
  categories: Array<{
    slug: string;
    created_at: Date;
  }>;
}

export async function getSitemapData(
  siteSlug: string
): Promise<SitemapData | null> {
  const [site] = await db
    .select({
      id: sites.id,
      slug: sites.slug,
      custom_domain: sites.custom_domain,
      updated_at: sites.updated_at,
    })
    .from(sites)
    .where(and(eq(sites.slug, siteSlug), eq(sites.status, "published")))
    .limit(1);

  if (!site) return null;

  const [publishedPages, publishedPosts, siteCategories] = await Promise.all([
    db
      .select({
        slug: pages.slug,
        is_home: pages.is_home,
        updated_at: pages.updated_at,
      })
      .from(pages)
      .where(eq(pages.site_id, site.id)),
    db
      .select({
        slug: blogPosts.slug,
        published_at: blogPosts.published_at,
        updated_at: blogPosts.updated_at,
      })
      .from(blogPosts)
      .where(
        and(eq(blogPosts.site_id, site.id), eq(blogPosts.status, "published"))
      ),
    db
      .select({
        slug: blogCategories.slug,
        created_at: blogCategories.created_at,
      })
      .from(blogCategories)
      .where(eq(blogCategories.site_id, site.id)),
  ]);

  return {
    site,
    pages: publishedPages,
    posts: publishedPosts,
    categories: siteCategories,
  };
}
