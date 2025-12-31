import type { ThemeData } from "@/lib/drizzle/schema/theme-types";
import type { TextContent } from "@/lib/section-types";

interface TextBlockProps {
  content: TextContent;
  theme: ThemeData;
}

/**
 * Convert hex color and opacity to rgba string
 */
function hexToRgba(hex: string, opacity: number): string {
  const cleanHex = hex.replace("#", "");
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

// Border width mappings
const BORDER_WIDTHS: Record<string, string> = {
  thin: "1px",
  medium: "2px",
  thick: "4px",
};

// Border radius mappings
const BORDER_RADII: Record<string, string> = {
  none: "0",
  small: "4px",
  medium: "8px",
  large: "16px",
  full: "9999px",
};

// Content width class mappings
const CONTENT_WIDTHS: Record<string, string> = {
  narrow: "max-w-3xl",
  medium: "max-w-5xl",
  full: "max-w-7xl",
};

// Text size scale mappings
const TEXT_SIZES: Record<string, { body: string; h2: string; h3: string }> = {
  small: { body: "0.875rem", h2: "1.5rem", h3: "1.25rem" },
  normal: { body: "1rem", h2: "1.875rem", h3: "1.5rem" },
  large: { body: "1.125rem", h2: "2.25rem", h3: "1.875rem" },
};

export function TextBlock({ content, theme }: TextBlockProps) {
  // Handle empty content
  if (!content.body || content.body.trim() === "" || content.body === "<p></p>") {
    return null;
  }

  const enableStyling = content.enableStyling ?? false;
  const textSizes = TEXT_SIZES[content.textSize ?? "normal"];

  // ============================================================================
  // PLAIN TEXT MODE (styling disabled)
  // ============================================================================
  if (!enableStyling) {
    const plainProseStyles = `
      .text-block-plain {
        font-family: var(--font-body);
        font-size: ${textSizes.body};
        color: var(--color-foreground);
        line-height: ${theme.typography.lineHeights.relaxed};
      }
      .text-block-plain > *:first-child {
        margin-top: 0;
      }
      .text-block-plain h2 {
        font-family: var(--font-heading);
        font-size: ${textSizes.h2};
        font-weight: 600;
        margin-top: 1.5em;
        margin-bottom: 0.5em;
        color: var(--color-foreground);
      }
      .text-block-plain h2:first-child {
        margin-top: 0;
      }
      .text-block-plain h3 {
        font-family: var(--font-heading);
        font-size: ${textSizes.h3};
        font-weight: 600;
        margin-top: 1.25em;
        margin-bottom: 0.5em;
        color: var(--color-foreground);
      }
      .text-block-plain h3:first-child {
        margin-top: 0;
      }
      .text-block-plain p {
        margin-top: 1em;
        margin-bottom: 1em;
      }
      .text-block-plain p:first-child {
        margin-top: 0;
      }
      .text-block-plain a {
        color: var(--color-primary);
        text-decoration: underline;
      }
      .text-block-plain blockquote {
        border-left: 2px solid var(--color-primary);
        padding-left: 1rem;
        font-style: italic;
        color: var(--color-muted-foreground);
      }
      .text-block-plain ul, .text-block-plain ol {
        padding-left: 1.5rem;
        margin: 1rem 0;
      }
      .text-block-plain li {
        margin: 0.25rem 0;
      }
    `;

    return (
      <section
        className="py-12 px-6"
        style={{ backgroundColor: "var(--color-background)" }}
      >
        <style dangerouslySetInnerHTML={{ __html: plainProseStyles }} />
        <div className="max-w-3xl mx-auto">
          <div
            className="text-block-plain max-w-none"
            dangerouslySetInnerHTML={{ __html: content.body }}
          />
        </div>
      </section>
    );
  }

  // ============================================================================
  // STYLED MODE (styling enabled)
  // ============================================================================

  // Styling values with defaults
  const showBorder = content.showBorder ?? false;
  const borderWidth = BORDER_WIDTHS[content.borderWidth ?? "medium"];
  const borderRadius = BORDER_RADII[content.borderRadius ?? "medium"];
  const borderColor = content.borderColor || "var(--color-primary)";
  const useThemeBackground = content.useThemeBackground ?? true;
  const boxBgOpacity = (content.boxBackgroundOpacity ?? 100) / 100;
  const contentWidthClass = CONTENT_WIDTHS[content.contentWidth ?? "narrow"];

  const hasBackgroundImage = Boolean(
    content.backgroundImage && content.backgroundImage.trim() !== ""
  );

  // Overlay - always render when color is set (opacity controls visibility)
  const overlayColor = content.overlayColor || "#000000";
  const overlayOpacity = (content.overlayOpacity ?? 0) / 100;
  const overlayRgba = hexToRgba(overlayColor, overlayOpacity);

  // Determine text color based on textColorMode
  const textColorMode = content.textColorMode ?? "auto";

  // Section background styles
  const sectionStyles: React.CSSProperties = {
    backgroundColor: hasBackgroundImage ? undefined : "var(--color-background)",
    backgroundImage: hasBackgroundImage
      ? `url(${content.backgroundImage})`
      : undefined,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

  // Compute box background color with opacity
  const getBoxBackgroundColor = (): string | undefined => {
    if (!showBorder) return undefined;

    // If using theme background, use CSS variable (adapts to light/dark mode)
    if (useThemeBackground && !content.boxBackgroundColor) {
      // For theme background with opacity < 100, we can't use CSS variables directly
      // So we return undefined and handle it with a pseudo-element or accept full opacity
      return boxBgOpacity < 1 ? undefined : "var(--color-background)";
    }

    // If custom color is set, apply opacity
    if (content.boxBackgroundColor) {
      return hexToRgba(content.boxBackgroundColor, boxBgOpacity);
    }

    return undefined;
  };

  // Border and box background styles for content container
  const containerStyles: React.CSSProperties = showBorder
    ? {
        border: `${borderWidth} solid ${borderColor}`,
        borderRadius: borderRadius,
        padding: "1.5rem",
        backgroundColor: getBoxBackgroundColor(),
      }
    : {};

  // Text colors based on textColorMode
  // - "light": Force white text (for dark backgrounds)
  // - "dark": Force dark text (for light backgrounds) - uses fixed dark color, not theme
  // - "auto": Detects from background image presence
  const getTextColors = (): { text: string; link: string; muted: string } => {
    if (textColorMode === "light") {
      return {
        text: "#FFFFFF",
        link: "#FFFFFF",
        muted: "rgba(255, 255, 255, 0.9)",
      };
    } else if (textColorMode === "dark") {
      // Use fixed dark colors that work on light backgrounds
      return {
        text: "#1F2937", // Dark gray (Tailwind gray-800)
        link: "#2563EB", // Blue (Tailwind blue-600)
        muted: "#6B7280", // Medium gray (Tailwind gray-500)
      };
    } else {
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
  };

  const colors = getTextColors();
  const textColor = colors.text;
  const linkColor = colors.link;
  const mutedColor = colors.muted;

  // Custom CSS for prose elements using theme values
  const proseStyles = `
    .text-block-styled {
      font-family: var(--font-body);
      font-size: ${textSizes.body};
      color: ${textColor};
      line-height: ${theme.typography.lineHeights.relaxed};
    }
    .text-block-styled > *:first-child {
      margin-top: 0;
    }
    .text-block-styled h2 {
      font-family: var(--font-heading);
      font-size: ${textSizes.h2};
      font-weight: 600;
      margin-top: 1.5em;
      margin-bottom: 0.5em;
      color: ${textColor};
    }
    .text-block-styled h2:first-child {
      margin-top: 0;
    }
    .text-block-styled h3 {
      font-family: var(--font-heading);
      font-size: ${textSizes.h3};
      font-weight: 600;
      margin-top: 1.25em;
      margin-bottom: 0.5em;
      color: ${textColor};
    }
    .text-block-styled h3:first-child {
      margin-top: 0;
    }
    .text-block-styled p {
      margin-top: 1em;
      margin-bottom: 1em;
    }
    .text-block-styled p:first-child {
      margin-top: 0;
    }
    .text-block-styled a {
      color: ${linkColor};
      text-decoration: underline;
    }
    .text-block-styled blockquote {
      border-left: 2px solid ${linkColor};
      padding-left: 1rem;
      font-style: italic;
      color: ${mutedColor};
    }
    .text-block-styled ul, .text-block-styled ol {
      padding-left: 1.5rem;
      margin: 1rem 0;
    }
    .text-block-styled li {
      margin: 0.25rem 0;
    }
  `;

  return (
    <section className="relative py-12 px-6" style={sectionStyles}>
      {/* Overlay layer - always rendered, opacity controls visibility */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: overlayRgba }}
      />

      <style dangerouslySetInnerHTML={{ __html: proseStyles }} />

      {/* Content container */}
      <div
        className={`relative z-10 mx-auto ${contentWidthClass}`}
        style={containerStyles}
      >
        <div
          className="text-block-styled max-w-none"
          dangerouslySetInnerHTML={{ __html: content.body }}
        />
      </div>
    </section>
  );
}
