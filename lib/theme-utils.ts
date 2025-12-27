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
    cssVariables: generateCSSVariables(data.colors, data.typography),
    tailwindExtends: generateTailwindExtends(data),
  };
}

/**
 * Generate CSS custom properties string from theme data.
 */
function generateCSSVariables(
  colors: ColorPalette,
  typography: TypographySettings
): string {
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
