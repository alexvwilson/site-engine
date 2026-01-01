import { db } from "@/lib/drizzle/db";
import { sites } from "@/lib/drizzle/schema/sites";
import { pages } from "@/lib/drizzle/schema/pages";
import { sections } from "@/lib/drizzle/schema/sections";
import { eq, asc, inArray } from "drizzle-orm";
import type { SeoAuditData } from "@/lib/seo-checks";
import type { HeaderContent, SectionContent } from "@/lib/section-types";
import type { BlockType } from "@/lib/drizzle/schema/sections";

/**
 * Fetch all data needed for SEO audit
 * Requires site ownership verification
 */
export async function getSeoAuditData(
  siteId: string,
  userId: string
): Promise<SeoAuditData | null> {
  // Fetch site with ownership check
  const [site] = await db
    .select({
      id: sites.id,
      user_id: sites.user_id,
      name: sites.name,
      description: sites.description,
      meta_title: sites.meta_title,
      meta_description: sites.meta_description,
      favicon_url: sites.favicon_url,
      header_content: sites.header_content,
    })
    .from(sites)
    .where(eq(sites.id, siteId))
    .limit(1);

  if (!site || site.user_id !== userId) {
    return null;
  }

  // Fetch all pages for the site
  const sitePages = await db
    .select({
      id: pages.id,
      title: pages.title,
      slug: pages.slug,
      meta_title: pages.meta_title,
      meta_description: pages.meta_description,
      is_home: pages.is_home,
    })
    .from(pages)
    .where(eq(pages.site_id, siteId))
    .orderBy(asc(pages.created_at));

  // Get page IDs for section query
  const pageIds = sitePages.map((p) => p.id);

  // Fetch all sections for analysis (only if we have pages)
  let siteSections: Array<{
    page_id: string;
    block_type: string;
    content: unknown;
  }> = [];

  if (pageIds.length > 0) {
    siteSections = await db
      .select({
        page_id: sections.page_id,
        block_type: sections.block_type,
        content: sections.content,
      })
      .from(sections)
      .where(inArray(sections.page_id, pageIds))
      .orderBy(asc(sections.position));
  }

  return {
    site: {
      id: site.id,
      name: site.name,
      description: site.description,
      metaTitle: site.meta_title,
      metaDescription: site.meta_description,
      faviconUrl: site.favicon_url,
      headerContent: site.header_content as HeaderContent | null,
    },
    pages: sitePages.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      metaTitle: p.meta_title,
      metaDescription: p.meta_description,
      isHome: p.is_home,
    })),
    sections: siteSections.map((s) => ({
      pageId: s.page_id,
      blockType: s.block_type as BlockType,
      content: s.content as SectionContent,
    })),
  };
}
