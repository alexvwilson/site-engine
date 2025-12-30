/**
 * URL utilities for custom domain support
 * Transforms URLs to work correctly on both custom domains and default /sites/[slug] routes
 */

/**
 * Transform a stored URL to use the correct base path
 * Handles: external URLs, anchor links, absolute paths, relative paths
 */
export function transformUrl(basePath: string, url: string): string {
  if (!url) return basePath || "/";

  // Skip external URLs
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  // Skip anchor-only links
  if (url.startsWith("#")) {
    return url;
  }

  // Skip mailto and tel links
  if (url.startsWith("mailto:") || url.startsWith("tel:")) {
    return url;
  }

  // If URL contains /sites/[slug]/, strip it and use basePath
  const sitePathMatch = url.match(/^\/sites\/[^/]+(.*)$/);
  if (sitePathMatch) {
    const relativePath = sitePathMatch[1] || "/";
    // Avoid double slashes
    if (basePath === "" && relativePath === "/") {
      return "/";
    }
    return `${basePath}${relativePath}`;
  }

  // For other paths, ensure leading slash and prepend basePath
  const normalizedPath = url.startsWith("/") ? url : `/${url}`;

  // Avoid double slashes when basePath is empty
  if (basePath === "") {
    return normalizedPath;
  }

  return `${basePath}${normalizedPath}`;
}

/**
 * Get the base path for a site based on custom domain status
 */
export function getBasePath(siteSlug: string, isCustomDomain: boolean): string {
  return isCustomDomain ? "" : `/sites/${siteSlug}`;
}

/**
 * Get the public URL for a site (for social sharing, RSS, etc.)
 * Returns the custom domain URL if available, otherwise the default app URL path
 */
export function getPublicSiteUrl(
  siteSlug: string,
  customDomain: string | null | undefined,
  appUrl: string
): string {
  if (customDomain) {
    // Ensure https:// prefix for custom domains
    return `https://${customDomain}`;
  }
  return `${appUrl}/sites/${siteSlug}`;
}
