/**
 * Blog utility functions for reading time calculation, RSS feed generation,
 * and Blog primitive rendering helpers
 */

// =============================================================================
// Blog Primitive Utilities
// =============================================================================

export interface TruncateResult {
  text: string;
  paragraphs: string[];
  truncated: boolean;
}

/**
 * Extract paragraphs from HTML and optionally truncate
 * Preserves paragraph structure for better formatting
 */
export function truncateContent(html: string, limit: number): TruncateResult {
  // Extract text content from each paragraph, preserving structure
  const paragraphMatches = html.match(/<p[^>]*>([\s\S]*?)<\/p>/gi) || [];

  // Clean each paragraph - remove HTML tags but keep the paragraph text
  const paragraphs = paragraphMatches
    .map((p) => p.replace(/<[^>]*>/g, "").trim())
    .filter((p) => p.length > 0);

  // If no paragraphs found, fall back to stripping all HTML
  if (paragraphs.length === 0) {
    const text = html.replace(/<[^>]*>/g, "").trim();
    if (limit <= 0 || text.length <= limit) {
      return { text, paragraphs: [text], truncated: false };
    }
    const truncatedText = text.slice(0, limit);
    const lastSpace = truncatedText.lastIndexOf(" ");
    const finalText =
      lastSpace > limit * 0.8 ? truncatedText.slice(0, lastSpace) : truncatedText;
    return { text: finalText, paragraphs: [finalText], truncated: true };
  }

  // Join for full text (for truncation calculation)
  const fullText = paragraphs.join(" ");

  // No truncation needed
  if (limit <= 0 || fullText.length <= limit) {
    return { text: fullText, paragraphs, truncated: false };
  }

  // Truncate while preserving paragraph boundaries where possible
  let charCount = 0;
  const truncatedParagraphs: string[] = [];
  let wasTruncated = false;

  for (const para of paragraphs) {
    if (charCount + para.length <= limit) {
      truncatedParagraphs.push(para);
      charCount += para.length + 1; // +1 for space between paragraphs
    } else {
      // This paragraph would exceed the limit
      const remaining = limit - charCount;
      if (remaining > 50 && truncatedParagraphs.length === 0) {
        // If first paragraph and we have reasonable space, truncate it
        const truncatedPara = para.slice(0, remaining);
        const lastSpace = truncatedPara.lastIndexOf(" ");
        truncatedParagraphs.push(
          lastSpace > remaining * 0.5
            ? truncatedPara.slice(0, lastSpace)
            : truncatedPara
        );
      }
      wasTruncated = true;
      break;
    }
  }

  const finalText = truncatedParagraphs.join(" ");
  return { text: finalText, paragraphs: truncatedParagraphs, truncated: wasTruncated };
}

/**
 * Get card border color based on mode setting
 */
export function getCardBorderColor(
  mode: string | undefined,
  customColor: string | undefined
): string {
  switch (mode) {
    case "primary":
      return "var(--color-primary)";
    case "custom":
      return customColor || "#E5E7EB";
    case "default":
    default:
      return "var(--color-border)";
  }
}

/**
 * Get image background color based on mode setting
 */
export function getImageBackgroundColor(
  mode: string | undefined,
  customColor: string | undefined
): string {
  switch (mode) {
    case "primary":
      return "var(--color-primary)";
    case "custom":
      return customColor || "var(--color-muted)";
    case "muted":
    default:
      return "var(--color-muted)";
  }
}

/**
 * Format date for blog display
 */
export function formatBlogDate(date: Date | string | null | undefined): string | null {
  if (!date) return null;
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// =============================================================================
// Reading Time and RSS Feed Utilities
// =============================================================================

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
  meta_description?: string | null;
}

/**
 * Generate RSS 2.0 feed XML
 * @param site - Site metadata
 * @param posts - Posts to include in the feed
 * @param publicSiteUrl - The public URL of the site (e.g., https://example.com or https://app.com/sites/slug)
 */
export function generateRssFeed(
  site: RssFeedSite,
  posts: RssFeedPost[],
  publicSiteUrl: string
): string {
  const siteUrl = publicSiteUrl;
  const feedUrl = `${siteUrl}/blog/rss.xml`;

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
