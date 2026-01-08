import { db } from "@/lib/drizzle/db";
import { documents, type DocumentRecord } from "@/lib/drizzle/schema/documents";
import { sites } from "@/lib/drizzle/schema/sites";
import { eq, and } from "drizzle-orm";

/**
 * Get a document by slug for a published site (public access, no auth required)
 */
export async function getDocumentBySlug(
  siteSlug: string,
  documentSlug: string
): Promise<DocumentRecord | null> {
  const [result] = await db
    .select({
      document: documents,
    })
    .from(documents)
    .innerJoin(sites, eq(documents.site_id, sites.id))
    .where(
      and(
        eq(sites.slug, siteSlug),
        eq(sites.status, "published"),
        eq(documents.slug, documentSlug)
      )
    )
    .limit(1);

  return result?.document ?? null;
}

/**
 * Get a document by slug for any site (requires site ID, used internally)
 */
export async function getDocumentBySlugAndSiteId(
  siteId: string,
  documentSlug: string
): Promise<DocumentRecord | null> {
  const [document] = await db
    .select()
    .from(documents)
    .where(
      and(
        eq(documents.site_id, siteId),
        eq(documents.slug, documentSlug)
      )
    )
    .limit(1);

  return document ?? null;
}
