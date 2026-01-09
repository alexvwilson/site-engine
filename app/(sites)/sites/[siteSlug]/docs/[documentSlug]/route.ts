import { NextResponse } from "next/server";
import { getDocumentBySlug } from "@/lib/queries/documents";

interface RouteParams {
  params: Promise<{
    siteSlug: string;
    documentSlug: string;
  }>;
}

/**
 * GET /sites/[siteSlug]/docs/[documentSlug]
 *
 * Proxies the document content from storage.
 * This provides a clean, user-friendly URL and returns a 200 response
 * which works better for crawlers, bots, and automated tools.
 */
export async function GET(
  request: Request,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { siteSlug, documentSlug } = await params;

    console.log(`[Document Route] Fetching: siteSlug=${siteSlug}, documentSlug=${documentSlug}`);

    const document = await getDocumentBySlug(siteSlug, documentSlug);

    if (!document) {
      console.error(`[Document Route] Not found: siteSlug=${siteSlug}, documentSlug=${documentSlug}`);
      return new NextResponse("Document not found", {
        status: 404,
        headers: { "Content-Type": "text/plain" },
      });
    }

    console.log(`[Document Route] Found document: id=${document.id}, url=${document.url}`);

    // Fetch the document from storage
    const response = await fetch(document.url);

    if (!response.ok) {
      console.error(
        `Failed to fetch document from storage: ${response.status} ${response.statusText}`
      );
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
    console.error("Document proxy error:", error);
    return new NextResponse("Internal server error", {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
}
