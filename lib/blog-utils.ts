/**
 * Blog utility functions for reading time calculation and RSS feed generation
 */

/**
 * Calculate estimated reading time based on word count
 * Uses average reading speed of 200 words per minute
 */
export function calculateReadingTime(htmlContent: string | null | undefined): number {
  if (!htmlContent) return 1;

  // Strip HTML tags to get plain text
  const text = htmlContent.replace(/<[^>]*>/g, "");

  // Count words (split by whitespace and filter empty strings)
  const wordCount = text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;

  // Calculate minutes (minimum 1)
  const minutes = Math.ceil(wordCount / 200);
  return Math.max(1, minutes);
}

/**
 * Format reading time for display
 */
export function formatReadingTime(minutes: number): string {
  if (minutes <= 1) return "1 min read";
  return `${minutes} min read`;
}

interface RssFeedPost {
  title: string;
  slug: string;
  excerpt: string | null;
  published_at: Date | null;
  featured_image: string | null;
}

interface RssFeedSite {
  name: string;
  slug: string;
  meta_description?: string | null;
}

/**
 * Generate RSS 2.0 feed XML
 */
export function generateRssFeed(
  site: RssFeedSite,
  posts: RssFeedPost[],
  baseUrl: string
): string {
  const siteUrl = `${baseUrl}/sites/${site.slug}`;
  const feedUrl = `${siteUrl}/blog/feed.xml`;

  // Escape XML special characters
  const escapeXml = (str: string): string =>
    str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");

  const items = posts
    .filter((post) => post.published_at)
    .map((post) => {
      const postUrl = `${siteUrl}/blog/${post.slug}`;
      const pubDate = post.published_at!.toUTCString();

      return `    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${escapeXml(postUrl)}</link>
      <guid isPermaLink="true">${escapeXml(postUrl)}</guid>
      <description><![CDATA[${post.excerpt || ""}]]></description>
      <pubDate>${pubDate}</pubDate>${
        post.featured_image
          ? `
      <enclosure url="${escapeXml(post.featured_image)}" type="image/jpeg" length="0" />`
          : ""
      }
    </item>`;
    })
    .join("\n");

  const lastBuildDate = new Date().toUTCString();
  const channelDescription = site.meta_description || `Latest posts from ${site.name}`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title><![CDATA[${site.name} Blog]]></title>
    <link>${escapeXml(siteUrl)}/blog</link>
    <description><![CDATA[${channelDescription}]]></description>
    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
${items}
  </channel>
</rss>`;
}
