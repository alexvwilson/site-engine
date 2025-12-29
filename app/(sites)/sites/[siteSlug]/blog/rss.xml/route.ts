import { NextResponse } from "next/server";
import { getPublishedSiteBySlug } from "@/lib/queries/sites";
import { getPublishedPostsBySite } from "@/lib/queries/blog";
import { generateRssFeed } from "@/lib/blog-utils";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ siteSlug: string }>;
}

export async function GET(
  _request: Request,
  { params }: RouteParams
): Promise<NextResponse> {
  const { siteSlug } = await params;

  const site = await getPublishedSiteBySlug(siteSlug);
  if (!site) {
    return new NextResponse("Site not found", { status: 404 });
  }

  // Get last 50 published posts for the feed
  const posts = await getPublishedPostsBySite(site.id, 50, 0);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "";

  const rssXml = generateRssFeed(
    {
      name: site.name,
      slug: siteSlug,
      meta_description: site.description,
    },
    posts.map((post) => ({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      published_at: post.published_at,
      featured_image: post.featured_image,
    })),
    baseUrl
  );

  return new NextResponse(rssXml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
