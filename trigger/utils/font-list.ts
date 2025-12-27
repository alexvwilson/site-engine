/**
 * Font List
 *
 * Curated list of Google Fonts for theme generation.
 * These fonts are widely available and provide good variety for different styles.
 */

// ============================================================================
// Font Categories
// ============================================================================

/**
 * Sans-serif fonts - Modern, clean, versatile
 */
export const SANS_SERIF_FONTS = [
  "Inter",
  "Roboto",
  "Open Sans",
  "Lato",
  "Poppins",
  "Montserrat",
  "Nunito",
  "Raleway",
  "Work Sans",
  "DM Sans",
  "Plus Jakarta Sans",
  "Manrope",
  "Outfit",
  "Sora",
  "Space Grotesk",
  "IBM Plex Sans",
  "Source Sans 3",
  "Figtree",
  "Geist",
] as const;

/**
 * Serif fonts - Traditional, elegant, authoritative
 */
export const SERIF_FONTS = [
  "Merriweather",
  "Playfair Display",
  "Lora",
  "Libre Baskerville",
  "Crimson Text",
  "Source Serif 4",
  "DM Serif Display",
  "Fraunces",
  "Newsreader",
  "Cormorant Garamond",
] as const;

/**
 * Display fonts - Headlines, bold statements
 */
export const DISPLAY_FONTS = [
  "Bebas Neue",
  "Oswald",
  "Anton",
  "Archivo Black",
  "Secular One",
  "Righteous",
] as const;

/**
 * Monospace fonts - Code, technical content
 */
export const MONOSPACE_FONTS = [
  "JetBrains Mono",
  "Fira Code",
  "Source Code Pro",
  "IBM Plex Mono",
  "Roboto Mono",
  "Geist Mono",
] as const;

// ============================================================================
// Combined Lists
// ============================================================================

/**
 * All heading-suitable fonts (sans-serif, serif, display)
 */
export const HEADING_FONTS = [
  ...SANS_SERIF_FONTS,
  ...SERIF_FONTS,
  ...DISPLAY_FONTS,
] as const;

/**
 * All body-suitable fonts (sans-serif, serif)
 */
export const BODY_FONTS = [...SANS_SERIF_FONTS, ...SERIF_FONTS] as const;

/**
 * All available fonts
 */
export const ALL_FONTS = [
  ...SANS_SERIF_FONTS,
  ...SERIF_FONTS,
  ...DISPLAY_FONTS,
  ...MONOSPACE_FONTS,
] as const;

// ============================================================================
// Types
// ============================================================================

export type SansSerifFont = (typeof SANS_SERIF_FONTS)[number];
export type SerifFont = (typeof SERIF_FONTS)[number];
export type DisplayFont = (typeof DISPLAY_FONTS)[number];
export type MonospaceFont = (typeof MONOSPACE_FONTS)[number];
export type HeadingFont = (typeof HEADING_FONTS)[number];
export type BodyFont = (typeof BODY_FONTS)[number];
export type AllFont = (typeof ALL_FONTS)[number];

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Check if a font name is in the allowed list
 */
export function isValidFont(fontName: string): boolean {
  return ALL_FONTS.includes(fontName as AllFont);
}

/**
 * Check if a font is suitable for headings
 */
export function isHeadingFont(fontName: string): boolean {
  return HEADING_FONTS.includes(fontName as HeadingFont);
}

/**
 * Check if a font is suitable for body text
 */
export function isBodyFont(fontName: string): boolean {
  return BODY_FONTS.includes(fontName as BodyFont);
}

/**
 * Get a fallback font if the provided font is not valid
 */
export function getFallbackFont(
  fontName: string,
  type: "heading" | "body"
): string {
  if (type === "heading" && isHeadingFont(fontName)) return fontName;
  if (type === "body" && isBodyFont(fontName)) return fontName;

  // Default fallbacks
  return type === "heading" ? "Inter" : "Inter";
}

/**
 * Get the font category for a given font
 */
export function getFontCategory(
  fontName: string
): "sans-serif" | "serif" | "display" | "monospace" | "unknown" {
  if (SANS_SERIF_FONTS.includes(fontName as SansSerifFont)) return "sans-serif";
  if (SERIF_FONTS.includes(fontName as SerifFont)) return "serif";
  if (DISPLAY_FONTS.includes(fontName as DisplayFont)) return "display";
  if (MONOSPACE_FONTS.includes(fontName as MonospaceFont)) return "monospace";
  return "unknown";
}

/**
 * Get the CSS font-family stack for a font
 */
export function getFontStack(fontName: string): string {
  const category = getFontCategory(fontName);

  const fallbacks: Record<string, string> = {
    "sans-serif": "ui-sans-serif, system-ui, sans-serif",
    serif: "ui-serif, Georgia, serif",
    display: "ui-sans-serif, system-ui, sans-serif",
    monospace: "ui-monospace, SFMono-Regular, monospace",
    unknown: "ui-sans-serif, system-ui, sans-serif",
  };

  return `"${fontName}", ${fallbacks[category]}`;
}

// ============================================================================
// Font Suggestions
// ============================================================================

/**
 * Recommended font pairings for different styles
 */
export const FONT_PAIRINGS: Record<
  string,
  { heading: string; body: string; description: string }
> = {
  modern: {
    heading: "Inter",
    body: "Inter",
    description: "Clean and versatile, works for any industry",
  },
  elegant: {
    heading: "Playfair Display",
    body: "Lora",
    description: "Sophisticated serif combination for luxury brands",
  },
  bold: {
    heading: "Bebas Neue",
    body: "Open Sans",
    description: "Strong headlines with readable body text",
  },
  friendly: {
    heading: "Poppins",
    body: "Nunito",
    description: "Rounded, approachable feel for consumer brands",
  },
  minimal: {
    heading: "DM Sans",
    body: "DM Sans",
    description: "Geometric simplicity for minimal designs",
  },
  professional: {
    heading: "IBM Plex Sans",
    body: "IBM Plex Sans",
    description: "Corporate, trustworthy appearance",
  },
  creative: {
    heading: "Space Grotesk",
    body: "Manrope",
    description: "Contemporary geometric fonts for creative industries",
  },
  editorial: {
    heading: "Fraunces",
    body: "Source Serif 4",
    description: "Editorial feel for content-heavy sites",
  },
};

/**
 * Get a font pairing suggestion based on style keyword
 */
export function getSuggestedPairing(
  style: string
): { heading: string; body: string } | null {
  const normalizedStyle = style.toLowerCase().trim();

  for (const [key, value] of Object.entries(FONT_PAIRINGS)) {
    if (normalizedStyle.includes(key)) {
      return { heading: value.heading, body: value.body };
    }
  }

  return null;
}
