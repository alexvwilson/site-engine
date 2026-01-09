import { NextResponse } from "next/server";
import { db } from "@/lib/drizzle/db";
import { documents } from "@/lib/drizzle/schema/documents";
import { sites } from "@/lib/drizzle/schema/sites";
import { eq, and } from "drizzle-orm";

interface RouteParams {
  params: Promise<{
    documentSlug: string;
  }>;
}

/**
 * GET /docs/[documentSlug]
 *
 * Root-level document route that works for both custom domains and internal routes.
 * Uses the Referer header to determine site context when accessed from internal routes.
 */
export async function GET(
  request: Request,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { documentSlug } = await params;
    const referer = request.headers.get("referer");

    // Try to extract site slug from referer
    let siteSlug: string | null = null;

    if (referer) {
      // Match /sites/[siteSlug]/ pattern in referer URL
      const siteMatch = referer.match(/\/sites\/([^\/]+)/);
      if (siteMatch) {
        siteSlug = siteMatch[1];
      }
    }

    let document;

    if (siteSlug) {
      // Look up document by site slug and document slug
      const [result] = await db
        .select({
          document: documents,
        })
        .from(documents)
        .innerJoin(sites, eq(documents.site_id, sites.id))
        .where(
          and(
            eq(sites.slug, siteSlug),
            eq(documents.slug, documentSlug)
          )
        )
        .limit(1);

      document = result?.document;
    }

    // If no document found via site slug, try to find by document slug alone
    // (works if slug is globally unique or only one site has this document)
    if (!document) {
      const [result] = await db
        .select()
        .from(documents)
        .where(eq(documents.slug, documentSlug))
        .limit(1);

      document = result;
    }

    if (!document) {
      return new NextResponse("Document not found", {
        status: 404,
        headers: { "Content-Type": "text/plain" },
      });
    }

    // Fetch the document from storage
    const response = await fetch(document.url);

    if (!response.ok) {
      return new NextResponse("Document temporarily unavailable", {
        status: 502,
        headers: { "Content-Type": "text/plain" },
      });
    }

    // Get the content type from the response or infer from filename
    const contentType =
      response.headers.get("Content-Type") || "application/octet-stream";

    // Stream the document content back to the client
    const headers = new Headers({
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    });

    // Add Content-Disposition for downloads (inline for PDFs, attachment for others)
    const filename = document.filename || `${documentSlug}.pdf`;
    if (contentType === "application/pdf") {
      headers.set("Content-Disposition", `inline; filename="${filename}"`);
    } else {
      headers.set("Content-Disposition", `attachment; filename="${filename}"`);
    }

    // Forward content length if available
    const contentLength = response.headers.get("Content-Length");
    if (contentLength) {
      headers.set("Content-Length", contentLength);
    }

    return new NextResponse(response.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Document route error:", error);
    return new NextResponse("Internal server error", {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
}
