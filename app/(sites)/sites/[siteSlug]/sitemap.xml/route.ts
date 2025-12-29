import { db } from "@/lib/drizzle/db";
import { sites } from "@/lib/drizzle/schema/sites";
import { pages } from "@/lib/drizzle/schema/pages";
import { blogPosts } from "@/lib/drizzle/schema/blog-posts";
import { eq, and, lte } from "drizzle-orm";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://example.com";

interface RouteParams {
  params: Promise<{ siteSlug: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const { siteSlug } = await params;
  const now = new Date();

  // Get the site
  const [site] = await db
    .select({
      id: sites.id,
      slug: sites.slug,
      updated_at: sites.updated_at,
    })
    .from(sites)
    .where(and(eq(sites.slug, siteSlug), eq(sites.status, "published")))
    .limit(1);

  if (!site) {
    return new Response("Site not found", { status: 404 });
  }

  const urls: string[] = [];

  // Add site homepage
  urls.push(`
    <url>
      <loc>${BASE_URL}/sites/${site.slug}</loc>
      <lastmod>${site.updated_at.toISOString()}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>1.0</priority>
    </url>`);

  // Add site blog listing
  urls.push(`
    <url>
      <loc>${BASE_URL}/sites/${site.slug}/blog</loc>
      <lastmod>${site.updated_at.toISOString()}</lastmod>
      <changefreq>daily</changefreq>
      <priority>0.8</priority>
    </url>`);

  // Get published pages for this site
  const sitePages = await db
    .select({
      slug: pages.slug,
      updated_at: pages.updated_at,
      is_home: pages.is_home,
    })
    .from(pages)
    .where(and(eq(pages.site_id, site.id), eq(pages.status, "published")));

  for (const page of sitePages) {
    if (!page.is_home) {
      urls.push(`
    <url>
      <loc>${BASE_URL}/sites/${site.slug}/${page.slug}</loc>
      <lastmod>${page.updated_at.toISOString()}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.7</priority>
    </url>`);
    }
  }

  // Get published blog posts for this site
  const sitePosts = await db
    .select({
      slug: blogPosts.slug,
      updated_at: blogPosts.updated_at,
      published_at: blogPosts.published_at,
    })
    .from(blogPosts)
    .where(
      and(
        eq(blogPosts.site_id, site.id),
        eq(blogPosts.status, "published"),
        lte(blogPosts.published_at, now)
      )
    );

  for (const post of sitePosts) {
    urls.push(`
    <url>
      <loc>${BASE_URL}/sites/${site.slug}/blog/${post.slug}</loc>
      <lastmod>${post.updated_at.toISOString()}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.6</priority>
    </url>`);
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("")}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
