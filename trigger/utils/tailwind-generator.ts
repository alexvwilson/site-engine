/**
 * Tailwind Generator
 *
 * Generates Tailwind CSS configuration and CSS custom properties
 * from theme data for use in site rendering.
 */

import type { ThemeData, ColorPalette, TypographySettings } from "@/lib/drizzle/schema/theme-types";
import { getFontStack } from "./font-list";

// ============================================================================
// Tailwind Config Generation
// ============================================================================

/**
 * Generate Tailwind config extends object from theme data.
 * This can be merged with base Tailwind config for site-specific theming.
 */
export function generateTailwindExtends(theme: ThemeData): Record<string, unknown> {
  return {
    colors: generateColorExtends(theme.colors),
    fontFamily: generateFontFamilyExtends(theme.typography),
    fontSize: generateFontSizeExtends(theme.typography),
    lineHeight: generateLineHeightExtends(theme.typography),
    borderRadius: generateBorderRadiusExtends(theme),
    boxShadow: generateBoxShadowExtends(theme),
  };
}

/**
 * Generate color extends for Tailwind
 */
function generateColorExtends(colors: ColorPalette): Record<string, string> {
  return {
    primary: colors.primary,
    secondary: colors.secondary,
    accent: colors.accent,
    background: colors.background,
    foreground: colors.foreground,
    muted: colors.muted,
    "muted-foreground": colors.mutedForeground,
    border: colors.border,
  };
}

/**
 * Generate font family extends for Tailwind
 */
function generateFontFamilyExtends(typography: TypographySettings): Record<string, string[]> {
  return {
    heading: [typography.headingFont.family, ...getFontStack(typography.headingFont.family).split(", ").slice(1)],
    body: [typography.bodyFont.family, ...getFontStack(typography.bodyFont.family).split(", ").slice(1)],
    sans: [typography.bodyFont.family, "ui-sans-serif", "system-ui", "sans-serif"],
  };
}

/**
 * Generate font size extends for Tailwind
 */
function generateFontSizeExtends(typography: TypographySettings): Record<string, string> {
  return {
    h1: typography.scale.h1,
    h2: typography.scale.h2,
    h3: typography.scale.h3,
    h4: typography.scale.h4,
    body: typography.scale.body,
    small: typography.scale.small,
  };
}

/**
 * Generate line height extends for Tailwind
 */
function generateLineHeightExtends(typography: TypographySettings): Record<string, string> {
  return {
    tight: typography.lineHeights.tight,
    normal: typography.lineHeights.normal,
    relaxed: typography.lineHeights.relaxed,
  };
}

/**
 * Generate border radius extends from component styles
 */
function generateBorderRadiusExtends(theme: ThemeData): Record<string, string> {
  return {
    button: theme.components.button.borderRadius,
    card: theme.components.card.borderRadius,
    input: theme.components.input.borderRadius,
    badge: theme.components.badge.borderRadius,
  };
}

/**
 * Generate box shadow extends from component styles
 */
function generateBoxShadowExtends(theme: ThemeData): Record<string, string> {
  return {
    card: theme.components.card.shadow,
  };
}

// ============================================================================
// CSS Variables Generation
// ============================================================================

/**
 * Generate CSS custom properties string from theme data.
 * These variables can be injected into globals.css or a style tag.
 */
export function generateCSSVariables(theme: ThemeData): string {
  const lines: string[] = [];

  lines.push(":root {");
  lines.push("  /* Theme Colors */");
  lines.push(...generateColorVariables(theme.colors));
  lines.push("");
  lines.push("  /* Typography */");
  lines.push(...generateTypographyVariables(theme.typography));
  lines.push("");
  lines.push("  /* Component Styles */");
  lines.push(...generateComponentVariables(theme));
  lines.push("}");

  return lines.join("\n");
}

/**
 * Generate color CSS variables
 */
function generateColorVariables(colors: ColorPalette): string[] {
  return [
    `  --color-primary: ${colors.primary};`,
    `  --color-secondary: ${colors.secondary};`,
    `  --color-accent: ${colors.accent};`,
    `  --color-background: ${colors.background};`,
    `  --color-foreground: ${colors.foreground};`,
    `  --color-muted: ${colors.muted};`,
    `  --color-muted-foreground: ${colors.mutedForeground};`,
    `  --color-border: ${colors.border};`,
  ];
}

/**
 * Generate typography CSS variables
 */
function generateTypographyVariables(typography: TypographySettings): string[] {
  return [
    `  --font-heading: ${getFontStack(typography.headingFont.family)};`,
    `  --font-body: ${getFontStack(typography.bodyFont.family)};`,
    `  --font-size-h1: ${typography.scale.h1};`,
    `  --font-size-h2: ${typography.scale.h2};`,
    `  --font-size-h3: ${typography.scale.h3};`,
    `  --font-size-h4: ${typography.scale.h4};`,
    `  --font-size-body: ${typography.scale.body};`,
    `  --font-size-small: ${typography.scale.small};`,
    `  --line-height-tight: ${typography.lineHeights.tight};`,
    `  --line-height-normal: ${typography.lineHeights.normal};`,
    `  --line-height-relaxed: ${typography.lineHeights.relaxed};`,
  ];
}

/**
 * Generate component CSS variables
 */
function generateComponentVariables(theme: ThemeData): string[] {
  const { button, card, input, badge } = theme.components;

  return [
    `  --radius-button: ${button.borderRadius};`,
    `  --radius-card: ${card.borderRadius};`,
    `  --radius-input: ${input.borderRadius};`,
    `  --radius-badge: ${badge.borderRadius};`,
    `  --padding-button-x: ${button.paddingX};`,
    `  --padding-button-y: ${button.paddingY};`,
    `  --padding-card: ${card.padding};`,
    `  --padding-input: ${input.padding};`,
    `  --shadow-card: ${card.shadow};`,
    `  --border-card: ${card.border};`,
    `  --border-input: ${input.borderColor};`,
    `  --focus-ring: ${input.focusRing};`,
  ];
}

// ============================================================================
// Google Fonts Import Generation
// ============================================================================

/**
 * Generate Google Fonts import URL for the theme fonts
 */
export function generateGoogleFontsUrl(typography: TypographySettings): string {
  const fonts: string[] = [];

  // Add heading font
  const headingWeights = typography.headingFont.weights.join(";");
  fonts.push(`family=${encodeURIComponent(typography.headingFont.family)}:wght@${headingWeights}`);

  // Add body font (if different from heading)
  if (typography.bodyFont.family !== typography.headingFont.family) {
    const bodyWeights = typography.bodyFont.weights.join(";");
    fonts.push(`family=${encodeURIComponent(typography.bodyFont.family)}:wght@${bodyWeights}`);
  }

  return `https://fonts.googleapis.com/css2?${fonts.join("&")}&display=swap`;
}

/**
 * Generate HTML link tag for Google Fonts
 */
export function generateGoogleFontsLink(typography: TypographySettings): string {
  const url = generateGoogleFontsUrl(typography);
  return `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${url}" rel="stylesheet">`;
}

/**
 * Generate CSS @import for Google Fonts
 */
export function generateGoogleFontsImport(typography: TypographySettings): string {
  const url = generateGoogleFontsUrl(typography);
  return `@import url('${url}');`;
}

// ============================================================================
// Complete Theme Output
// ============================================================================

/**
 * Generate all theme outputs (extends, CSS variables, font imports)
 */
export function generateThemeOutputs(theme: ThemeData): {
  tailwindExtends: Record<string, unknown>;
  cssVariables: string;
  googleFontsUrl: string;
  googleFontsLink: string;
  googleFontsImport: string;
} {
  return {
    tailwindExtends: generateTailwindExtends(theme),
    cssVariables: generateCSSVariables(theme),
    googleFontsUrl: generateGoogleFontsUrl(theme.typography),
    googleFontsLink: generateGoogleFontsLink(theme.typography),
    googleFontsImport: generateGoogleFontsImport(theme.typography),
  };
}

/**
 * Update ThemeData with generated outputs
 */
export function completeThemeData(theme: ThemeData): ThemeData {
  return {
    ...theme,
    tailwindExtends: generateTailwindExtends(theme),
    cssVariables: generateCSSVariables(theme),
  };
}
