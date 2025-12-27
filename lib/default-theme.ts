/**
 * Default Theme
 *
 * Fallback theme used when a site has no active theme.
 * Clean, professional design with neutral colors.
 */

import type { ThemeData } from "@/lib/drizzle/schema/theme-types";

export const DEFAULT_THEME: ThemeData = {
  colors: {
    primary: "#2563eb",
    secondary: "#64748b",
    accent: "#f59e0b",
    background: "#ffffff",
    foreground: "#0f172a",
    muted: "#f1f5f9",
    mutedForeground: "#64748b",
    border: "#e2e8f0",
    rationale: "Default professional color palette with blue primary.",
  },
  typography: {
    headingFont: {
      family: "Inter",
      weights: [400, 500, 600, 700],
    },
    bodyFont: {
      family: "Inter",
      weights: [400, 500],
    },
    scale: {
      h1: "3rem",
      h2: "2.25rem",
      h3: "1.875rem",
      h4: "1.5rem",
      body: "1rem",
      small: "0.875rem",
    },
    lineHeights: {
      tight: "1.25",
      normal: "1.5",
      relaxed: "1.75",
    },
    rationale: "Inter provides excellent readability across all sizes.",
  },
  components: {
    button: {
      borderRadius: "0.5rem",
      paddingX: "1rem",
      paddingY: "0.5rem",
      variants: {
        default: {
          bg: "#2563eb",
          text: "#ffffff",
        },
        secondary: {
          bg: "#f1f5f9",
          text: "#0f172a",
        },
        outline: {
          bg: "transparent",
          text: "#2563eb",
          border: "#2563eb",
        },
        ghost: {
          bg: "transparent",
          text: "#0f172a",
        },
      },
    },
    card: {
      borderRadius: "0.75rem",
      padding: "1.5rem",
      shadow: "0 1px 3px rgba(0,0,0,0.1)",
      border: "#e2e8f0",
    },
    input: {
      borderRadius: "0.375rem",
      borderColor: "#e2e8f0",
      focusRing: "#2563eb",
      padding: "0.75rem",
    },
    badge: {
      borderRadius: "9999px",
      padding: "0.25rem 0.75rem",
    },
    rationale: "Clean, modern component styles with subtle shadows.",
  },
  tailwindExtends: {
    colors: {
      primary: "#2563eb",
      secondary: "#64748b",
      accent: "#f59e0b",
    },
  },
  cssVariables: `
    --color-primary: #2563eb;
    --color-secondary: #64748b;
    --color-accent: #f59e0b;
    --color-background: #ffffff;
    --color-foreground: #0f172a;
    --color-muted: #f1f5f9;
    --color-muted-foreground: #64748b;
    --color-border: #e2e8f0;
  `.trim(),
  generatedAt: "2025-01-01T00:00:00.000Z",
  aiProvider: "default",
  aiModel: "fallback",
};
