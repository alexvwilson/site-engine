/**
 * Embed utilities for validating and parsing iframe embed codes.
 * Uses an allowlist approach for security.
 */

export const ALLOWED_EMBED_DOMAINS = [
  // YouTube
  "youtube.com",
  "www.youtube.com",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
  // Vimeo
  "player.vimeo.com",
  // Google Maps
  "google.com",
  "www.google.com",
  "maps.google.com",
  // Spotify
  "open.spotify.com",
  // SoundCloud
  "w.soundcloud.com",
] as const;

export interface ParsedEmbed {
  src: string;
  width?: string;
  height?: string;
  allow?: string;
  allowFullscreen: boolean;
  title?: string;
}

export interface ValidationResult {
  valid: boolean;
  parsed?: ParsedEmbed;
  error?: string;
}

/**
 * Check if a URL's domain is in the allowlist
 */
export function isAllowedDomain(src: string): boolean {
  try {
    const url = new URL(src);
    const hostname = url.hostname.toLowerCase();

    return ALLOWED_EMBED_DOMAINS.some(
      (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
}

/**
 * Parse iframe HTML and extract safe attributes
 */
export function parseIframeCode(html: string): ParsedEmbed | null {
  const trimmed = html.trim();

  // Match iframe tag
  const iframeMatch = trimmed.match(/<iframe[^>]*>/i);
  if (!iframeMatch) return null;

  const iframeTag = iframeMatch[0];

  // Extract src attribute
  const srcMatch = iframeTag.match(/src=["']([^"']+)["']/i);
  if (!srcMatch) return null;

  const src = srcMatch[1];

  // Reject javascript: protocol
  if (src.toLowerCase().startsWith("javascript:")) return null;

  // Extract other attributes
  const widthMatch = iframeTag.match(/width=["']?(\d+)["']?/i);
  const heightMatch = iframeTag.match(/height=["']?(\d+)["']?/i);
  const allowMatch = iframeTag.match(/allow=["']([^"']+)["']/i);
  const titleMatch = iframeTag.match(/title=["']([^"']+)["']/i);
  const allowFullscreen = /allowfullscreen/i.test(iframeTag);

  return {
    src,
    width: widthMatch?.[1],
    height: heightMatch?.[1],
    allow: allowMatch?.[1],
    allowFullscreen,
    title: titleMatch?.[1],
  };
}

/**
 * Validate embed code and return parsed result or error
 */
export function validateEmbedCode(html: string): ValidationResult {
  if (!html.trim()) {
    return { valid: false, error: "Please paste an embed code" };
  }

  const parsed = parseIframeCode(html);

  if (!parsed) {
    return {
      valid: false,
      error: "Could not find a valid iframe in the pasted code",
    };
  }

  if (!isAllowedDomain(parsed.src)) {
    return {
      valid: false,
      error:
        "This embed source is not supported. Allowed: YouTube, Vimeo, Google Maps, Spotify, SoundCloud",
    };
  }

  return { valid: true, parsed };
}

/**
 * Get display name for an embed based on its domain
 */
export function getEmbedServiceName(src: string): string {
  try {
    const url = new URL(src);
    const hostname = url.hostname.toLowerCase();

    if (hostname.includes("youtube")) return "YouTube";
    if (hostname.includes("vimeo")) return "Vimeo";
    if (hostname.includes("google")) return "Google Maps";
    if (hostname.includes("spotify")) return "Spotify";
    if (hostname.includes("soundcloud")) return "SoundCloud";

    return "Embed";
  } catch {
    return "Embed";
  }
}
