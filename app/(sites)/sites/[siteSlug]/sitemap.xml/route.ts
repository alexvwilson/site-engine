import { NextResponse } from "next/server";
import { getSitemapData, SitemapData } from "@/lib/queries/sitemap";
import { getPublicSiteUrl } from "@/lib/url-utils";

export const revalidate = 3600; // 1 hour cache

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function generateSitemapXml(baseUrl: string, data: SitemapData): string {
  const urls: string[] = [];

  // Homepage
  const homePage = data.pages.find((p) => p.is_home);
  urls.push(`
  <url>
    <loc>${escapeXml(baseUrl)}</loc>
    <lastmod>${formatDate(homePage?.updated_at || data.site.updated_at)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>`);

  // Other pages (non-home)
  for (const page of data.pages.filter((p) => !p.is_home)) {
    urls.push(`
  <url>
    <loc>${escapeXml(baseUrl)}/${escapeXml(page.slug)}</loc>
    <lastmod>${formatDate(page.updated_at)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);
  }

  // Blog section (only if posts exist)
  if (data.posts.length > 0) {
    // Blog listing page
    const latestPost = data.posts.reduce((latest, post) =>
      post.updated_at > latest.updated_at ? post : latest
    );
    urls.push(`
  <url>
    <loc>${escapeXml(baseUrl)}/blog</loc>
    <lastmod>${formatDate(latestPost.updated_at)}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>`);

    // Blog posts
    for (const post of data.posts) {
      urls.push(`
  <url>
    <loc>${escapeXml(baseUrl)}/blog/${escapeXml(post.slug)}</loc>
    <lastmod>${formatDate(post.published_at || post.updated_at)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`);
    }

    // Category pages (only include categories that might have posts)
    for (const category of data.categories) {
      urls.push(`
  <url>
    <loc>${escapeXml(baseUrl)}/blog/category/${escapeXml(category.slug)}</loc>
    <lastmod>${formatDate(category.created_at)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>`);
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join("")}
</urlset>`;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ siteSlug: string }> }
): Promise<NextResponse> {
  const { siteSlug } = await params;
  const data = await getSitemapData(siteSlug);

  if (!data) {
    return new NextResponse("Site not found", { status: 404 });
  }

  const baseUrl = getPublicSiteUrl(
    siteSlug,
    data.site.custom_domain,
    process.env.NEXT_PUBLIC_APP_URL || ""
  );

  const xml = generateSitemapXml(baseUrl, data);

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
