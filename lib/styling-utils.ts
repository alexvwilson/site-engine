import type { CSSProperties } from "react";
import type {
  SectionStyling,
  TextBorderWidth,
  TextBorderRadius,
  TextContentWidth,
  TextSize,
  TextColorMode,
} from "./section-types";

// Re-export SectionStyling for convenience
export type { SectionStyling };

/**
 * Extended styling for blocks that have card/form children
 */
export interface CardStylingFields {
  showCardBackground?: boolean;
  cardBackgroundColor?: string;
  cardBackgroundOpacity?: number;
}

export interface FormStylingFields {
  showFormBackground?: boolean;
  formBackgroundColor?: string;
}

// =============================================================================
// STYLE MAPS
// =============================================================================

/**
 * Border width CSS values
 */
export const BORDER_WIDTHS: Record<TextBorderWidth, string> = {
  thin: "1px",
  medium: "2px",
  thick: "4px",
};

/**
 * Border radius CSS values
 */
export const BORDER_RADII: Record<TextBorderRadius, string> = {
  none: "0",
  small: "4px",
  medium: "8px",
  large: "16px",
  full: "9999px",
};

/**
 * Content width Tailwind classes
 */
export const CONTENT_WIDTHS: Record<TextContentWidth, string> = {
  narrow: "max-w-3xl",
  medium: "max-w-5xl",
  full: "max-w-7xl",
};

/**
 * Text size scale for body and headings
 */
export const TEXT_SIZES: Record<
  TextSize,
  { body: string; h1: string; h2: string; h3: string; scale: number }
> = {
  small: { body: "0.875rem", h1: "1.75rem", h2: "1.5rem", h3: "1.25rem", scale: 0.875 },
  normal: { body: "1rem", h1: "2.25rem", h2: "1.875rem", h3: "1.5rem", scale: 1 },
  large: { body: "1.125rem", h1: "2.75rem", h2: "2.25rem", h3: "1.875rem", scale: 1.125 },
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Convert hex color and opacity to rgba string
 */
export function hexToRgba(hex: string, opacity: number): string {
  const cleanHex = hex.replace("#", "");
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  // Handle opacity as 0-100 or 0-1
  const normalizedOpacity = opacity > 1 ? opacity / 100 : opacity;
  return `rgba(${r}, ${g}, ${b}, ${normalizedOpacity})`;
}

/**
 * Check if a hex color is considered "dark" (for text color decisions)
 */
export function isColorDark(hex: string): boolean {
  const cleanHex = hex.replace("#", "");
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  // Using relative luminance formula
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
}

/**
 * Get text colors based on textColorMode setting
 */
export function getTextColors(textColorMode?: TextColorMode): {
  headingColor: string;
  textColor: string;
  mutedColor: string;
} {
  switch (textColorMode) {
    case "light":
      return {
        headingColor: "#FFFFFF",
        textColor: "#F3F4F6",
        mutedColor: "#D1D5DB",
      };
    case "dark":
      return {
        headingColor: "#111827",
        textColor: "#374151",
        mutedColor: "#6B7280",
      };
    case "auto":
    default:
      return {
        headingColor: "var(--color-foreground)",
        textColor: "var(--color-foreground)",
        mutedColor: "var(--color-muted-foreground)",
      };
  }
}

// =============================================================================
// STYLE BUILDERS
// =============================================================================

export interface SectionStyleResult {
  /** Styles for the outermost section wrapper (background image, overlay) */
  sectionStyles: CSSProperties;
  /** Styles for the inner container (border, box background) */
  containerStyles: CSSProperties;
  /** Overlay div styles if background image exists, null otherwise */
  overlayStyles: CSSProperties | null;
  /** Text colors based on textColorMode */
  textColors: ReturnType<typeof getTextColors>;
  /** Text size config */
  textSizes: (typeof TEXT_SIZES)[TextSize];
  /** Content width class */
  contentWidthClass: string;
}

/**
 * Build style objects for a styled section.
 * Returns everything needed to render the section with proper styling.
 */
export function buildSectionStyles(
  content: SectionStyling,
  themePrimary?: string
): SectionStyleResult {
  const borderColor = content.borderColor || themePrimary || "var(--color-primary)";
  const textSizes = TEXT_SIZES[content.textSize ?? "normal"];
  const contentWidthClass = CONTENT_WIDTHS[content.contentWidth ?? "full"];
  const textColors = getTextColors(content.textColorMode);

  // Section wrapper styles (background image)
  const sectionStyles: CSSProperties = {};
  if (content.backgroundImage) {
    sectionStyles.backgroundImage = `url(${content.backgroundImage})`;
    sectionStyles.backgroundSize = "cover";
    sectionStyles.backgroundPosition = "center";
    sectionStyles.position = "relative";
  }

  // Overlay styles (only if background image exists)
  let overlayStyles: CSSProperties | null = null;
  if (content.backgroundImage && content.overlayColor) {
    overlayStyles = {
      position: "absolute",
      inset: 0,
      backgroundColor: hexToRgba(
        content.overlayColor,
        content.overlayOpacity ?? 50
      ),
      pointerEvents: "none",
    };
  }

  // Container styles (border and box background)
  const containerStyles: CSSProperties = {};

  if (content.showBorder) {
    containerStyles.borderWidth = BORDER_WIDTHS[content.borderWidth ?? "medium"];
    containerStyles.borderStyle = "solid";
    containerStyles.borderColor = borderColor;
    containerStyles.borderRadius = BORDER_RADII[content.borderRadius ?? "medium"];
  }

  // Box background
  if (content.useThemeBackground) {
    containerStyles.backgroundColor = "var(--color-background)";
  } else if (content.boxBackgroundColor) {
    containerStyles.backgroundColor = hexToRgba(
      content.boxBackgroundColor,
      content.boxBackgroundOpacity ?? 100
    );
  }

  return {
    sectionStyles,
    containerStyles,
    overlayStyles,
    textColors,
    textSizes,
    contentWidthClass,
  };
}

/**
 * Build card/item background styles for blocks with card children
 */
export function buildCardStyles(cardFields: CardStylingFields): CSSProperties {
  const styles: CSSProperties = {};

  if (cardFields.showCardBackground !== false) {
    if (cardFields.cardBackgroundColor) {
      styles.backgroundColor = hexToRgba(
        cardFields.cardBackgroundColor,
        cardFields.cardBackgroundOpacity ?? 100
      );
    } else {
      // Default card background
      styles.backgroundColor = "var(--color-card)";
    }
  }

  return styles;
}

/**
 * Build form background styles for contact block
 */
export function buildFormStyles(formFields: FormStylingFields): CSSProperties {
  const styles: CSSProperties = {};

  if (formFields.showFormBackground !== false) {
    if (formFields.formBackgroundColor) {
      styles.backgroundColor = formFields.formBackgroundColor;
    } else {
      styles.backgroundColor = "var(--color-card)";
    }
  }

  return styles;
}
