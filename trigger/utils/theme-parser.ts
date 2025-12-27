/**
 * Theme Parser
 *
 * Zod schemas and validation functions for AI-generated theme data.
 * Ensures AI responses match expected TypeScript interfaces.
 */

import { z } from "zod";
import { isHeadingFont, isBodyFont, getFallbackFont } from "./font-list";
import type {
  ColorPalette,
  TypographySettings,
  ComponentStyles,
  ThemeData,
} from "@/lib/drizzle/schema/theme-types";

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Hex color validation regex (with or without #)
 */
const hexColorRegex = /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

/**
 * Normalize hex color to include # prefix
 */
function normalizeHexColor(color: string): string {
  const cleaned = color.replace("#", "");
  return `#${cleaned.toUpperCase()}`;
}

/**
 * CSS size value (e.g., "1rem", "16px", "1.5")
 */
const cssSizeRegex = /^[\d.]+(?:rem|em|px|%)?$/;

// ============================================================================
// Zod Schemas
// ============================================================================

/**
 * Hex color schema with normalization
 */
const hexColorSchema = z
  .string()
  .regex(hexColorRegex, "Must be valid hex color")
  .transform(normalizeHexColor);

/**
 * CSS size value schema
 */
const cssSizeSchema = z.string().regex(cssSizeRegex, "Must be valid CSS size");

/**
 * Color Palette Schema (Stage 1)
 */
export const colorPaletteSchema = z.object({
  primary: hexColorSchema,
  secondary: hexColorSchema,
  accent: hexColorSchema,
  background: hexColorSchema,
  foreground: hexColorSchema,
  muted: hexColorSchema,
  mutedForeground: hexColorSchema,
  border: hexColorSchema,
  rationale: z.string().min(1, "Rationale is required"),
});

/**
 * Font Config Schema
 */
const fontConfigSchema = z.object({
  family: z.string().min(1),
  weights: z.array(z.number().int().min(100).max(900)),
});

/**
 * Font Scale Schema
 */
const fontScaleSchema = z.object({
  h1: cssSizeSchema,
  h2: cssSizeSchema,
  h3: cssSizeSchema,
  h4: cssSizeSchema,
  body: cssSizeSchema,
  small: cssSizeSchema,
});

/**
 * Line Heights Schema
 */
const lineHeightsSchema = z.object({
  tight: z.string(),
  normal: z.string(),
  relaxed: z.string(),
});

/**
 * Typography Settings Schema (Stage 2)
 */
export const typographySettingsSchema = z
  .object({
    headingFont: fontConfigSchema,
    bodyFont: fontConfigSchema,
    scale: fontScaleSchema,
    lineHeights: lineHeightsSchema,
    rationale: z.string().min(1, "Rationale is required"),
  })
  .transform((data) => {
    // Validate and fallback fonts if needed
    const headingFamily = isHeadingFont(data.headingFont.family)
      ? data.headingFont.family
      : getFallbackFont(data.headingFont.family, "heading");

    const bodyFamily = isBodyFont(data.bodyFont.family)
      ? data.bodyFont.family
      : getFallbackFont(data.bodyFont.family, "body");

    return {
      ...data,
      headingFont: { ...data.headingFont, family: headingFamily },
      bodyFont: { ...data.bodyFont, family: bodyFamily },
    };
  });

/**
 * Button Variant Schema
 */
const buttonVariantSchema = z.object({
  bg: z.string(),
  text: z.string(),
  border: z.string().optional(),
});

/**
 * Button Styles Schema
 */
const buttonStylesSchema = z.object({
  borderRadius: cssSizeSchema,
  paddingX: cssSizeSchema,
  paddingY: cssSizeSchema,
  variants: z.record(z.string(), buttonVariantSchema),
});

/**
 * Card Styles Schema
 */
const cardStylesSchema = z.object({
  borderRadius: cssSizeSchema,
  padding: cssSizeSchema,
  shadow: z.string(),
  border: z.string(),
});

/**
 * Input Styles Schema
 */
const inputStylesSchema = z.object({
  borderRadius: cssSizeSchema,
  borderColor: z.string(),
  focusRing: z.string(),
  padding: cssSizeSchema,
});

/**
 * Badge Styles Schema
 */
const badgeStylesSchema = z.object({
  borderRadius: cssSizeSchema,
  padding: z.string(),
});

/**
 * Component Styles Schema (Stage 3)
 */
export const componentStylesSchema = z.object({
  button: buttonStylesSchema,
  card: cardStylesSchema,
  input: inputStylesSchema,
  badge: badgeStylesSchema,
  rationale: z.string().min(1, "Rationale is required"),
});

/**
 * Complete Theme Data Schema (Quick Generate / Final Output)
 */
export const themeDataSchema = z.object({
  colors: colorPaletteSchema,
  darkColors: colorPaletteSchema.optional(),
  typography: typographySettingsSchema,
  components: componentStylesSchema,
  tailwindExtends: z.record(z.string(), z.unknown()).default({}),
  cssVariables: z.string().default(""),
  generatedAt: z.string().default(() => new Date().toISOString()),
  aiProvider: z.string().default("openai"),
  aiModel: z.string().default("gpt-4o"),
});

/**
 * Quick Generate Response Schema
 * Used when generating complete theme in one AI call
 */
export const quickGenerateResponseSchema = z.object({
  colors: colorPaletteSchema,
  darkColors: colorPaletteSchema.optional(),
  typography: typographySettingsSchema,
  components: componentStylesSchema,
});

// ============================================================================
// Parse Functions
// ============================================================================

/**
 * Parse and validate color palette from AI response
 */
export function parseColorPalette(data: unknown): ColorPalette {
  return colorPaletteSchema.parse(data);
}

/**
 * Parse and validate typography settings from AI response
 */
export function parseTypographySettings(data: unknown): TypographySettings {
  return typographySettingsSchema.parse(data);
}

/**
 * Parse and validate component styles from AI response
 */
export function parseComponentStyles(data: unknown): ComponentStyles {
  return componentStylesSchema.parse(data);
}

/**
 * Parse and validate complete theme data from AI response
 */
export function parseThemeData(data: unknown): ThemeData {
  return themeDataSchema.parse(data);
}

/**
 * Parse quick generate response and construct full ThemeData
 */
export function parseQuickGenerateResponse(
  data: unknown,
  aiProvider: string = "openai",
  aiModel: string = "gpt-4o"
): ThemeData {
  const parsed = quickGenerateResponseSchema.parse(data);

  return {
    colors: parsed.colors,
    darkColors: parsed.darkColors,
    typography: parsed.typography,
    components: parsed.components,
    tailwindExtends: {},
    cssVariables: "",
    generatedAt: new Date().toISOString(),
    aiProvider,
    aiModel,
  };
}

// ============================================================================
// Safe Parse Functions (return result object instead of throwing)
// ============================================================================

/**
 * Safely parse color palette, returns success/error result
 */
export function safeParseColorPalette(data: unknown) {
  return colorPaletteSchema.safeParse(data);
}

/**
 * Safely parse typography settings, returns success/error result
 */
export function safeParseTypographySettings(data: unknown) {
  return typographySettingsSchema.safeParse(data);
}

/**
 * Safely parse component styles, returns success/error result
 */
export function safeParseComponentStyles(data: unknown) {
  return componentStylesSchema.safeParse(data);
}

/**
 * Safely parse complete theme data, returns success/error result
 */
export function safeParseThemeData(data: unknown) {
  return themeDataSchema.safeParse(data);
}

// ============================================================================
// Type Exports (inferred from Zod schemas)
// ============================================================================

export type ParsedColorPalette = z.infer<typeof colorPaletteSchema>;
export type ParsedTypographySettings = z.infer<typeof typographySettingsSchema>;
export type ParsedComponentStyles = z.infer<typeof componentStylesSchema>;
export type ParsedThemeData = z.infer<typeof themeDataSchema>;
