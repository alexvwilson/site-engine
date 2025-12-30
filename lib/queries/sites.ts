import { db } from "@/lib/drizzle/db";
import { sites, type Site } from "@/lib/drizzle/schema/sites";
import { pages } from "@/lib/drizzle/schema/pages";
import { eq, desc, asc, count, sql, and } from "drizzle-orm";

export type SiteSortField = "updated_at" | "name" | "created_at";
export type SortOrder = "asc" | "desc";

export interface GetSitesOptions {
  sortBy?: SiteSortField;
  sortOrder?: SortOrder;
}

/**
 * Get all sites for a user with optional sorting
 */
export async function getSites(
  userId: string,
  options?: GetSitesOptions
): Promise<Site[]> {
  const sortBy = options?.sortBy ?? "updated_at";
  const sortOrder = options?.sortOrder ?? "desc";

  const orderByColumn = {
    updated_at: sites.updated_at,
    name: sites.name,
    created_at: sites.created_at,
  }[sortBy];

  const orderFn = sortOrder === "asc" ? asc : desc;

  return db
    .select()
    .from(sites)
    .where(eq(sites.user_id, userId))
    .orderBy(orderFn(orderByColumn));
}

/**
 * Get a single site by ID with ownership verification
 */
export async function getSiteById(
  siteId: string,
  userId: string
): Promise<Site | null> {
  const [site] = await db
    .select()
    .from(sites)
    .where(eq(sites.id, siteId))
    .limit(1);

  if (!site || site.user_id !== userId) {
    return null;
  }

  return site;
}

/**
 * Get a site by slug (for public URL routing)
 */
export async function getSiteBySlug(slug: string): Promise<Site | null> {
  const [site] = await db
    .select()
    .from(sites)
    .where(eq(sites.slug, slug))
    .limit(1);

  return site ?? null;
}

export type SiteWithPageCount = Site & { pageCount: number };

/**
 * Get all sites for a user with page counts
 */
export async function getSitesWithPageCounts(
  userId: string,
  options?: GetSitesOptions
): Promise<SiteWithPageCount[]> {
  const sortBy = options?.sortBy ?? "updated_at";
  const sortOrder = options?.sortOrder ?? "desc";

  const orderByColumn = {
    updated_at: sites.updated_at,
    name: sites.name,
    created_at: sites.created_at,
  }[sortBy];

  const orderFn = sortOrder === "asc" ? asc : desc;

  // Subquery to count pages per site
  const pageCountSubquery = db
    .select({
      site_id: pages.site_id,
      count: count().as("page_count"),
    })
    .from(pages)
    .groupBy(pages.site_id)
    .as("page_counts");

  const result = await db
    .select({
      id: sites.id,
      user_id: sites.user_id,
      name: sites.name,
      description: sites.description,
      slug: sites.slug,
      status: sites.status,
      published_at: sites.published_at,
      created_at: sites.created_at,
      updated_at: sites.updated_at,
      under_construction: sites.under_construction,
      pageCount: sql<number>`COALESCE(${pageCountSubquery.count}, 0)`.as(
        "pageCount"
      ),
    })
    .from(sites)
    .leftJoin(pageCountSubquery, eq(sites.id, pageCountSubquery.site_id))
    .where(eq(sites.user_id, userId))
    .orderBy(orderFn(orderByColumn));

  return result as SiteWithPageCount[];
}

/**
 * Get a published site by slug (for public access - no auth check)
 */
export async function getPublishedSiteBySlug(slug: string): Promise<Site | null> {
  const [site] = await db
    .select()
    .from(sites)
    .where(and(eq(sites.slug, slug), eq(sites.status, "published")))
    .limit(1);

  return site ?? null;
}

/**
 * Get a published site by custom domain (for middleware routing)
 * Only returns verified domains on published sites
 */
export async function getPublishedSiteByDomain(
  domain: string
): Promise<Site | null> {
  const [site] = await db
    .select()
    .from(sites)
    .where(
      and(
        eq(sites.custom_domain, domain),
        eq(sites.domain_verification_status, "verified"),
        eq(sites.status, "published")
      )
    )
    .limit(1);

  return site ?? null;
}

/**
 * Get site slug by custom domain (lightweight query for middleware)
 */
export async function getSiteSlugByDomain(
  domain: string
): Promise<string | null> {
  const [result] = await db
    .select({ slug: sites.slug })
    .from(sites)
    .where(
      and(
        eq(sites.custom_domain, domain),
        eq(sites.domain_verification_status, "verified"),
        eq(sites.status, "published")
      )
    )
    .limit(1);

  return result?.slug ?? null;
}
