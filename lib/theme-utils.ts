import type {
  ThemeData,
  ColorPalette,
  TypographySettings,
} from "@/lib/drizzle/schema/theme-types";

/**
 * Regenerate cssVariables and tailwindExtends after manual theme edits.
 * Call this before saving to ensure output formats are in sync with colors/typography.
 */
export function regenerateThemeOutput(data: ThemeData): ThemeData {
  return {
    ...data,
    cssVariables: generateCSSVariables(data.colors, data.darkColors, data.typography),
    tailwindExtends: generateTailwindExtends(data),
  };
}

/**
 * Generate CSS custom properties string from theme data.
 * Includes both light and dark mode variables.
 */
function generateCSSVariables(
  colors: ColorPalette,
  darkColors: ColorPalette | undefined,
  typography: TypographySettings
): string {
  const dark = darkColors || generateDefaultDarkPalette(colors);

  return `:root {
  --color-primary: ${colors.primary};
  --color-secondary: ${colors.secondary};
  --color-accent: ${colors.accent};
  --color-background: ${colors.background};
  --color-foreground: ${colors.foreground};
  --color-muted: ${colors.muted};
  --color-muted-foreground: ${colors.mutedForeground};
  --color-border: ${colors.border};
  --font-heading: "${typography.headingFont.family}", sans-serif;
  --font-body: "${typography.bodyFont.family}", sans-serif;
}

.dark {
  --color-primary: ${dark.primary};
  --color-secondary: ${dark.secondary};
  --color-accent: ${dark.accent};
  --color-background: ${dark.background};
  --color-foreground: ${dark.foreground};
  --color-muted: ${dark.muted};
  --color-muted-foreground: ${dark.mutedForeground};
  --color-border: ${dark.border};
}`;
}

/**
 * Generate Tailwind config extends object from theme data.
 */
function generateTailwindExtends(data: ThemeData): Record<string, unknown> {
  return {
    colors: {
      primary: data.colors.primary,
      secondary: data.colors.secondary,
      accent: data.colors.accent,
      background: data.colors.background,
      foreground: data.colors.foreground,
      muted: data.colors.muted,
      "muted-foreground": data.colors.mutedForeground,
      border: data.colors.border,
    },
    fontFamily: {
      heading: [data.typography.headingFont.family, "sans-serif"],
      body: [data.typography.bodyFont.family, "sans-serif"],
    },
    borderRadius: {
      DEFAULT: data.components.button.borderRadius,
    },
  };
}

/**
 * Generate a default dark palette from a light palette.
 * Used when darkColors is not provided.
 */
export function generateDefaultDarkPalette(lightColors: ColorPalette): ColorPalette {
  return {
    primary: lightColors.primary, // Keep brand color
    secondary: lightColors.secondary,
    accent: lightColors.accent,
    background: "#0A0A0B", // Dark background
    foreground: "#FAFAFA", // Light text
    muted: "#18181B", // Slightly lighter than background
    mutedForeground: "#A1A1AA", // Muted text
    border: "#27272A", // Dark border
    rationale: "Auto-generated dark mode palette",
  };
}
