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
 * Redirects to the actual document storage URL.
 * This provides a clean, user-friendly URL for documents.
 */
export async function GET(
  request: Request,
  { params }: RouteParams
): Promise<NextResponse> {
  const { siteSlug, documentSlug } = await params;

  const document = await getDocumentBySlug(siteSlug, documentSlug);

  if (!document) {
    return new NextResponse("Document not found", { status: 404 });
  }

  // Redirect to the actual storage URL
  // Using 302 (temporary) redirect so the browser doesn't cache it permanently
  // This allows us to change the underlying storage without breaking links
  return NextResponse.redirect(document.url, 302);
}
