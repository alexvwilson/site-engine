import { NextResponse } from "next/server";
import { db } from "@/lib/drizzle/db";
import { sites } from "@/lib/drizzle/schema/sites";
import { eq, and } from "drizzle-orm";
import { getPublicSiteUrl } from "@/lib/url-utils";

export const revalidate = 3600; // 1 hour cache

export async function GET(
  request: Request,
  { params }: { params: Promise<{ siteSlug: string }> }
): Promise<NextResponse> {
  const { siteSlug } = await params;

  const [site] = await db
    .select({ custom_domain: sites.custom_domain })
    .from(sites)
    .where(and(eq(sites.slug, siteSlug), eq(sites.status, "published")))
    .limit(1);

  if (!site) {
    return new NextResponse("Site not found", { status: 404 });
  }

  const baseUrl = getPublicSiteUrl(
    siteSlug,
    site.custom_domain,
    process.env.NEXT_PUBLIC_APP_URL || ""
  );

  const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml
`;

  return new NextResponse(robotsTxt, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
