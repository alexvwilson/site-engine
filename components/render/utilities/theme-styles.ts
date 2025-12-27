import type { ThemeData } from "@/lib/drizzle/schema/theme-types";
import type { CSSProperties } from "react";

/**
 * Generate inline styles for primary buttons
 */
export function getButtonStyles(theme: ThemeData): CSSProperties {
  return {
    backgroundColor: theme.colors.primary,
    color: "#FFFFFF",
    borderRadius: theme.components.button.borderRadius,
    padding: `${theme.components.button.paddingY} ${theme.components.button.paddingX}`,
    fontFamily: theme.typography.bodyFont.family,
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
    color: theme.colors.primary,
    borderRadius: theme.components.button.borderRadius,
    padding: `${theme.components.button.paddingY} ${theme.components.button.paddingX}`,
    fontFamily: theme.typography.bodyFont.family,
    fontWeight: 500,
    display: "inline-block",
    textDecoration: "none",
    border: `1px solid ${theme.colors.primary}`,
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
    fontFamily: theme.typography.headingFont.family,
    fontSize: theme.typography.scale[level],
    lineHeight: theme.typography.lineHeights.tight,
    color: theme.colors.foreground,
    fontWeight: 600,
    margin: 0,
  };
}

/**
 * Generate inline styles for body text
 */
export function getBodyStyles(theme: ThemeData): CSSProperties {
  return {
    fontFamily: theme.typography.bodyFont.family,
    fontSize: theme.typography.scale.body,
    lineHeight: theme.typography.lineHeights.normal,
    color: theme.colors.foreground,
  };
}

/**
 * Generate inline styles for small/muted text
 */
export function getSmallStyles(theme: ThemeData): CSSProperties {
  return {
    fontFamily: theme.typography.bodyFont.family,
    fontSize: theme.typography.scale.small,
    lineHeight: theme.typography.lineHeights.normal,
    color: theme.colors.mutedForeground,
  };
}

/**
 * Generate inline styles for cards
 */
export function getCardStyles(theme: ThemeData): CSSProperties {
  return {
    backgroundColor: theme.colors.background,
    borderRadius: theme.components.card.borderRadius,
    padding: theme.components.card.padding,
    boxShadow: theme.components.card.shadow,
    border: `1px solid ${theme.colors.border}`,
  };
}

/**
 * Generate inline styles for input fields
 */
export function getInputStyles(theme: ThemeData): CSSProperties {
  return {
    backgroundColor: theme.colors.background,
    borderRadius: theme.components.input.borderRadius,
    padding: theme.components.input.padding,
    border: `1px solid ${theme.colors.border}`,
    fontFamily: theme.typography.bodyFont.family,
    fontSize: theme.typography.scale.body,
    color: theme.colors.foreground,
    width: "100%",
  };
}

/**
 * Generate inline styles for badges
 */
export function getBadgeStyles(theme: ThemeData): CSSProperties {
  return {
    backgroundColor: theme.colors.primary,
    color: "#FFFFFF",
    borderRadius: theme.components.badge.borderRadius,
    padding: theme.components.badge.padding,
    fontFamily: theme.typography.bodyFont.family,
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
    backgroundColor: theme.colors.background,
    color: theme.colors.foreground,
    fontFamily: theme.typography.bodyFont.family,
  };
}

/**
 * Generate inline styles for muted background sections
 */
export function getMutedSectionStyles(theme: ThemeData): CSSProperties {
  return {
    backgroundColor: theme.colors.muted,
    color: theme.colors.foreground,
  };
}

/**
 * Generate inline styles for links
 */
export function getLinkStyles(theme: ThemeData): CSSProperties {
  return {
    color: theme.colors.primary,
    textDecoration: "none",
  };
}
