/**
 * Shared utilities for RichText primitive (visual, markdown, article modes)
 * Consolidates rendering logic from TextBlock, MarkdownBlock, and ArticleBlock
 */

import TurndownService from "turndown";
import { marked } from "marked";
import type {
  RichTextContent,
  RichTextMode,
  TextColorMode,
  TextSize,
  TextBorderRadius,
} from "./section-types";
import { hexToRgba, TEXT_SIZES, BORDER_RADII } from "./styling-utils";

// =============================================================================
// CONTENT CONVERSION
// =============================================================================

const turndown = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
  bulletListMarker: "-",
});

/**
 * Convert content between RichText modes
 * - visual/article → markdown: HTML to Markdown via turndown
 * - markdown → visual/article: Markdown to HTML via marked
 * - visual ↔ article: Direct transfer (both use HTML body)
 */
export function convertContent(
  content: RichTextContent,
  toMode: RichTextMode
): RichTextContent {
  const fromMode = content.mode ?? "visual";

  // Same mode, no conversion needed
  if (fromMode === toMode) {
    return { ...content, mode: toMode };
  }

  // Markdown → Visual/Article (convert markdown to HTML)
  if (fromMode === "markdown" && (toMode === "visual" || toMode === "article")) {
    const html = marked.parse(content.markdown ?? "", { async: false }) as string;
    return {
      ...content,
      mode: toMode,
      body: html,
      markdown: undefined,
    };
  }

  // Visual/Article → Markdown (convert HTML to markdown)
  if ((fromMode === "visual" || fromMode === "article") && toMode === "markdown") {
    const md = turndown.turndown(content.body ?? "");
    return {
      ...content,
      mode: toMode,
      markdown: md,
      body: undefined,
    };
  }

  // Visual ↔ Article: just change mode (both use HTML body)
  return { ...content, mode: toMode };
}

// =============================================================================
// TEXT COLOR UTILITIES
// =============================================================================

export interface RichTextColors {
  text: string;
  link: string;
  muted: string;
}

/**
 * Get text colors based on textColorMode and background presence
 * Matches the logic from TextBlock/MarkdownBlock/ArticleBlock
 */
export function getRichTextColors(
  textColorMode: TextColorMode | undefined,
  hasBackgroundImage: boolean
): RichTextColors {
  const mode = textColorMode ?? "auto";

  if (mode === "light") {
    return {
      text: "#FFFFFF",
      link: "#FFFFFF",
      muted: "rgba(255, 255, 255, 0.9)",
    };
  }

  if (mode === "dark") {
    return {
      text: "#1F2937",
      link: "#2563EB",
      muted: "#6B7280",
    };
  }

  // Auto mode: use light text if there's a background image
  if (hasBackgroundImage) {
    return {
      text: "#FFFFFF",
      link: "#FFFFFF",
      muted: "rgba(255, 255, 255, 0.9)",
    };
  }

  // No background image: use theme colors
  return {
    text: "var(--color-foreground)",
    link: "var(--color-primary)",
    muted: "var(--color-muted-foreground)",
  };
}

/**
 * Compute box background color with opacity
 */
export function getBoxBackgroundColor(
  showBorder: boolean,
  useThemeBackground: boolean,
  boxBackgroundColor: string | undefined,
  opacity: number
): string | undefined {
  if (!showBorder) return undefined;

  // If using theme background, use CSS variable (adapts to light/dark mode)
  if (useThemeBackground && !boxBackgroundColor) {
    return opacity < 1 ? undefined : "var(--color-background)";
  }

  // If custom color is set, apply opacity
  if (boxBackgroundColor) {
    return hexToRgba(boxBackgroundColor, opacity);
  }

  return undefined;
}

// =============================================================================
// THEME SCOPE STYLES
// =============================================================================

interface ColorPaletteSubset {
  primary: string;
  background: string;
  foreground: string;
  muted: string;
  mutedForeground: string;
  border: string;
}

/**
 * Generate CSS that scopes theme color variables to a specific RichText section.
 * This prevents the admin app's @theme inline CSS variables (which reference
 * the admin's --foreground/--background) from overriding the site theme's colors.
 *
 * Sets --color-foreground, --color-background, etc. directly on the section element
 * using the site theme's actual hex values. Also includes a .site-dark override
 * for user_choice color mode support.
 */
export function generateThemeScopeStyles(
  instanceId: string,
  lightColors: ColorPaletteSubset,
  darkColors: ColorPaletteSubset
): string {
  return `
    [data-rt="${instanceId}"] {
      --color-foreground: ${lightColors.foreground};
      --color-background: ${lightColors.background};
      --color-primary: ${lightColors.primary};
      --color-muted: ${lightColors.muted};
      --color-muted-foreground: ${lightColors.mutedForeground};
      --color-border: ${lightColors.border};
    }
    .site-dark [data-rt="${instanceId}"] {
      --color-foreground: ${darkColors.foreground};
      --color-background: ${darkColors.background};
      --color-primary: ${darkColors.primary};
      --color-muted: ${darkColors.muted};
      --color-muted-foreground: ${darkColors.mutedForeground};
      --color-border: ${darkColors.border};
    }
  `;
}

// =============================================================================
// PROSE STYLE GENERATORS
// =============================================================================

interface ProseStyleOptions {
  prefix: string;
  textSizes: (typeof TEXT_SIZES)[TextSize];
  colors: RichTextColors;
  lineHeight: string;
  includeH1?: boolean; // Markdown mode includes h1 styling
}

/**
 * Generate base prose CSS styles
 * Common to all modes: headings, paragraphs, links, blockquotes, lists
 */
export function generateProseStyles(options: ProseStyleOptions): string {
  const { prefix, textSizes, colors, lineHeight, includeH1 = false } = options;

  const h1Styles = includeH1
    ? `
    .${prefix} h1 {
      font-family: var(--font-heading);
      font-size: ${textSizes.h1};
      font-weight: 700;
      margin-top: 1.5em;
      margin-bottom: 0.5em;
      color: ${colors.text};
    }
    .${prefix} h1:first-child {
      margin-top: 0;
    }`
    : "";

  return `
    .${prefix} {
      font-family: var(--font-body);
      font-size: ${textSizes.body};
      color: ${colors.text};
      line-height: ${lineHeight};
    }
    .${prefix} > *:first-child {
      margin-top: 0;
    }
    ${h1Styles}
    .${prefix} h2 {
      font-family: var(--font-heading);
      font-size: ${textSizes.h2};
      font-weight: 600;
      margin-top: 1.5em;
      margin-bottom: 0.5em;
      color: ${colors.text};
    }
    .${prefix} h2:first-child {
      margin-top: 0;
    }
    .${prefix} h3 {
      font-family: var(--font-heading);
      font-size: ${textSizes.h3};
      font-weight: 600;
      margin-top: 1.25em;
      margin-bottom: 0.5em;
      color: ${colors.text};
    }
    .${prefix} h3:first-child {
      margin-top: 0;
    }
    .${prefix} p {
      margin-top: 1em;
      margin-bottom: 1em;
    }
    .${prefix} p:first-child {
      margin-top: 0;
    }
    .${prefix} a {
      color: ${colors.link};
      text-decoration: underline;
    }
    .${prefix} blockquote {
      border-left: 2px solid ${colors.link};
      padding-left: 1rem;
      font-style: italic;
      color: ${colors.muted};
      margin: 1rem 0;
    }
    .${prefix} ul {
      padding-left: 1.5rem;
      margin: 1rem 0;
      list-style-type: disc;
    }
    .${prefix} ol {
      padding-left: 1.5rem;
      margin: 1rem 0;
      list-style-type: decimal;
    }
    .${prefix} li {
      margin: 0.25rem 0;
      display: list-item;
    }
    .${prefix} hr {
      border: 0;
      border-top: 1px solid var(--color-border);
      margin: 2rem 0;
    }
    .${prefix} img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
    }
  `;
}

// =============================================================================
// MODE-SPECIFIC STYLE GENERATORS
// =============================================================================

/**
 * Generate code block styles for Markdown mode
 * Includes: pre, code, tables, checkboxes
 */
export function generateMarkdownCodeStyles(prefix: string): string {
  return `
    .${prefix} pre {
      background: var(--color-muted);
      border-radius: 8px;
      padding: 1rem;
      overflow-x: auto;
      margin: 1rem 0;
    }
    .${prefix} code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 0.875em;
    }
    .${prefix} :not(pre) > code {
      background: var(--color-muted);
      padding: 0.2em 0.4em;
      border-radius: 4px;
    }
    .${prefix} table {
      width: 100%;
      border-collapse: collapse;
      margin: 1rem 0;
    }
    .${prefix} th,
    .${prefix} td {
      border: 1px solid var(--color-border);
      padding: 0.5rem 1rem;
      text-align: left;
    }
    .${prefix} th {
      background: var(--color-muted);
      font-weight: 600;
    }
    .${prefix} input[type="checkbox"] {
      margin-right: 0.5rem;
    }
  `;
}

/**
 * Generate inline image float styles for Article mode
 * Includes: left/right float, center, full-width, mobile responsiveness
 */
export function generateArticleImageStyles(
  prefix: string,
  imageRounding: TextBorderRadius = "medium"
): string {
  const borderRadius = BORDER_RADII[imageRounding];

  return `
    /* Base image styling - applies to all images */
    .${prefix} img.article-inline-image,
    .${prefix} img[data-alignment] {
      border-radius: ${borderRadius} !important;
    }
    /* Article inline image alignment */
    .${prefix} img.article-inline-image[data-alignment="left"],
    .${prefix} img[data-alignment="left"] {
      float: left !important;
      margin: 0.5rem 1.5rem 1rem 0 !important;
      max-width: 50% !important;
      height: auto !important;
    }
    .${prefix} img.article-inline-image[data-alignment="right"],
    .${prefix} img[data-alignment="right"] {
      float: right !important;
      margin: 0.5rem 0 1rem 1.5rem !important;
      max-width: 50% !important;
      height: auto !important;
    }
    .${prefix} img.article-inline-image[data-alignment="center"],
    .${prefix} img[data-alignment="center"] {
      display: block !important;
      float: none !important;
      margin: 1.5rem auto !important;
      max-width: 100% !important;
      height: auto !important;
    }
    .${prefix} img.article-inline-image[data-alignment="full"],
    .${prefix} img[data-alignment="full"] {
      display: block !important;
      float: none !important;
      width: 100% !important;
      margin: 1.5rem 0 !important;
      height: auto !important;
    }
    /* Mobile: Stack floated images above text */
    @media (max-width: 640px) {
      .${prefix} img.article-inline-image[data-alignment="left"],
      .${prefix} img.article-inline-image[data-alignment="right"],
      .${prefix} img[data-alignment="left"],
      .${prefix} img[data-alignment="right"] {
        float: none !important;
        display: block !important;
        max-width: 100% !important;
        margin: 1rem auto !important;
      }
    }
    /* Clear floats at container end */
    .${prefix}::after {
      content: "";
      display: table;
      clear: both;
    }
  `;
}

// =============================================================================
// COMBINED STYLE BUILDER
// =============================================================================

interface BuildStylesOptions {
  mode: RichTextMode;
  prefix: string;
  textSize: TextSize;
  colors: RichTextColors;
  lineHeight: string;
  imageRounding?: TextBorderRadius;
}

/**
 * Build complete CSS styles for a RichText block
 * Combines base prose styles with mode-specific additions
 */
export function buildRichTextStyles(options: BuildStylesOptions): string {
  const { mode, prefix, textSize, colors, lineHeight, imageRounding } = options;
  const textSizes = TEXT_SIZES[textSize];

  // Base prose styles (all modes)
  let styles = generateProseStyles({
    prefix,
    textSizes,
    colors,
    lineHeight,
    includeH1: mode === "markdown", // Markdown supports h1
  });

  // Mode-specific additions
  if (mode === "markdown") {
    styles += generateMarkdownCodeStyles(prefix);
  }

  if (mode === "article") {
    styles += generateArticleImageStyles(prefix, imageRounding);
  }

  return styles;
}
