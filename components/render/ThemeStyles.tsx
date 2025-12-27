"use client";

import type { ThemeData } from "@/lib/drizzle/schema/theme-types";
import type { ColorMode } from "@/lib/drizzle/schema/sites";
import { generateDefaultDarkPalette } from "@/lib/theme-utils";

interface ThemeStylesProps {
  theme: ThemeData;
  colorMode: ColorMode;
}

/**
 * Injects CSS custom properties for theme colors.
 * Supports light, dark, system, and user_choice color modes.
 */
export function ThemeStyles({ theme, colorMode }: ThemeStylesProps): React.ReactElement {
  const lightColors = theme.colors;
  const darkColors = theme.darkColors || generateDefaultDarkPalette(lightColors);

  // Base CSS variables (light mode)
  const lightVars = `
    --color-primary: ${lightColors.primary};
    --color-secondary: ${lightColors.secondary};
    --color-accent: ${lightColors.accent};
    --color-background: ${lightColors.background};
    --color-foreground: ${lightColors.foreground};
    --color-muted: ${lightColors.muted};
    --color-muted-foreground: ${lightColors.mutedForeground};
    --color-border: ${lightColors.border};
    --font-heading: "${theme.typography.headingFont.family}", sans-serif;
    --font-body: "${theme.typography.bodyFont.family}", sans-serif;
  `;

  // Dark mode CSS variables
  const darkVars = `
    --color-primary: ${darkColors.primary};
    --color-secondary: ${darkColors.secondary};
    --color-accent: ${darkColors.accent};
    --color-background: ${darkColors.background};
    --color-foreground: ${darkColors.foreground};
    --color-muted: ${darkColors.muted};
    --color-muted-foreground: ${darkColors.mutedForeground};
    --color-border: ${darkColors.border};
  `;

  // Build CSS based on color mode
  let css = `:root { ${lightVars} }`;

  if (colorMode === "dark") {
    // Always dark mode
    css = `:root { ${darkVars} --font-heading: "${theme.typography.headingFont.family}", sans-serif; --font-body: "${theme.typography.bodyFont.family}", sans-serif; }`;
  } else if (colorMode === "system") {
    // Follow system preference
    css = `
      :root { ${lightVars} }
      @media (prefers-color-scheme: dark) {
        :root { ${darkVars} }
      }
    `;
  } else if (colorMode === "user_choice") {
    // Light by default, dark when .dark class is present
    css = `
      :root { ${lightVars} }
      .dark { ${darkVars} }
    `;
  }
  // "light" mode just uses the base lightVars

  return (
    <style
      dangerouslySetInnerHTML={{ __html: css }}
    />
  );
}

/**
 * Script to prevent flash of wrong color mode.
 * Should be placed in <head> before any content renders.
 */
export function ColorModeScript({ colorMode }: { colorMode: ColorMode }): React.ReactElement | null {
  if (colorMode !== "user_choice" && colorMode !== "system") {
    return null;
  }

  const script = colorMode === "user_choice"
    ? `
      (function() {
        try {
          var mode = localStorage.getItem('site-color-mode');
          if (mode === 'dark') {
            document.documentElement.classList.add('dark');
          }
        } catch (e) {}
      })();
    `
    : `
      (function() {
        try {
          if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.classList.add('dark');
          }
        } catch (e) {}
      })();
    `;

  return (
    <script
      dangerouslySetInnerHTML={{ __html: script }}
    />
  );
}
