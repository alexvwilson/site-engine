import type { ThemeData } from "@/lib/drizzle/schema/theme-types";
import type { CSSProperties } from "react";

/**
 * Generate inline styles for primary buttons
 * Uses CSS variables for colors to support light/dark mode switching
 */
export function getButtonStyles(theme: ThemeData): CSSProperties {
  return {
    backgroundColor: "var(--color-primary)",
    color: "#FFFFFF",
    borderRadius: theme.components.button.borderRadius,
    padding: `${theme.components.button.paddingY} ${theme.components.button.paddingX}`,
    fontFamily: "var(--font-body)",
    fontWeight: 500,
    display: "inline-block",
    textDecoration: "none",
    border: "none",
    cursor: "pointer",
  };
}

/**
 * Generate inline styles for secondary/outline buttons
 */
export function getOutlineButtonStyles(theme: ThemeData): CSSProperties {
  return {
    backgroundColor: "transparent",
    color: "var(--color-primary)",
    borderRadius: theme.components.button.borderRadius,
    padding: `${theme.components.button.paddingY} ${theme.components.button.paddingX}`,
    fontFamily: "var(--font-body)",
    fontWeight: 500,
    display: "inline-block",
    textDecoration: "none",
    border: "1px solid var(--color-primary)",
    cursor: "pointer",
  };
}

/**
 * Generate inline styles for headings (h1-h4)
 */
export function getHeadingStyles(
  theme: ThemeData,
  level: "h1" | "h2" | "h3" | "h4"
): CSSProperties {
  return {
    fontFamily: "var(--font-heading)",
    fontSize: theme.typography.scale[level],
    lineHeight: theme.typography.lineHeights.tight,
    color: "var(--color-foreground)",
    fontWeight: 600,
    margin: 0,
  };
}

/**
 * Generate inline styles for body text
 */
export function getBodyStyles(theme: ThemeData): CSSProperties {
  return {
    fontFamily: "var(--font-body)",
    fontSize: theme.typography.scale.body,
    lineHeight: theme.typography.lineHeights.normal,
    color: "var(--color-foreground)",
  };
}

/**
 * Generate inline styles for small/muted text
 */
export function getSmallStyles(theme: ThemeData): CSSProperties {
  return {
    fontFamily: "var(--font-body)",
    fontSize: theme.typography.scale.small,
    lineHeight: theme.typography.lineHeights.normal,
    color: "var(--color-muted-foreground)",
  };
}

/**
 * Generate inline styles for cards
 */
export function getCardStyles(theme: ThemeData): CSSProperties {
  return {
    backgroundColor: "var(--color-background)",
    borderRadius: theme.components.card.borderRadius,
    padding: theme.components.card.padding,
    boxShadow: theme.components.card.shadow,
    border: "1px solid var(--color-border)",
  };
}

/**
 * Generate inline styles for input fields
 */
export function getInputStyles(theme: ThemeData): CSSProperties {
  return {
    backgroundColor: "var(--color-background)",
    borderRadius: theme.components.input.borderRadius,
    padding: theme.components.input.padding,
    border: "1px solid var(--color-border)",
    fontFamily: "var(--font-body)",
    fontSize: theme.typography.scale.body,
    color: "var(--color-foreground)",
    width: "100%",
  };
}

/**
 * Generate inline styles for badges
 */
export function getBadgeStyles(theme: ThemeData): CSSProperties {
  return {
    backgroundColor: "var(--color-primary)",
    color: "#FFFFFF",
    borderRadius: theme.components.badge.borderRadius,
    padding: theme.components.badge.padding,
    fontFamily: "var(--font-body)",
    fontSize: theme.typography.scale.small,
    fontWeight: 500,
    display: "inline-block",
  };
}

/**
 * Generate inline styles for page/section backgrounds
 */
export function getPageStyles(theme: ThemeData): CSSProperties {
  return {
    backgroundColor: "var(--color-background)",
    color: "var(--color-foreground)",
    fontFamily: "var(--font-body)",
  };
}

/**
 * Generate inline styles for muted background sections
 */
export function getMutedSectionStyles(theme: ThemeData): CSSProperties {
  return {
    backgroundColor: "var(--color-muted)",
    color: "var(--color-foreground)",
  };
}

/**
 * Generate inline styles for links
 */
export function getLinkStyles(theme: ThemeData): CSSProperties {
  return {
    color: "var(--color-primary)",
    textDecoration: "none",
  };
}
