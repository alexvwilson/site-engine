import type { ThemeData } from "@/lib/drizzle/schema/theme-types";
import type { ArticleContent } from "@/lib/section-types";

interface ArticleBlockProps {
  content: ArticleContent;
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

export function ArticleBlock({ content, theme }: ArticleBlockProps): React.JSX.Element | null {
  // Handle empty content
  if (!content.body || content.body.trim() === "" || content.body === "<p></p>") {
    return null;
  }

  const enableStyling = content.enableStyling ?? false;
  const textSizes = TEXT_SIZES[content.textSize ?? "normal"];
  const contentWidthClass = CONTENT_WIDTHS[content.contentWidth ?? "medium"];
  const imageRounding = BORDER_RADII[content.imageRounding ?? "medium"];

  // CSS for inline image float behavior (shared between plain and styled modes)
  const imageFloatStyles = `
    /* Base image styling - applies to all images */
    .article-block img.article-inline-image,
    .article-block img[data-alignment] {
      border-radius: ${imageRounding} !important;
    }
    /* Article inline image alignment - use !important to override inline styles */
    .article-block img.article-inline-image[data-alignment="left"],
    .article-block img[data-alignment="left"] {
      float: left !important;
      margin: 0.5rem 1.5rem 1rem 0 !important;
      max-width: 50% !important;
      height: auto !important;
    }
    .article-block img.article-inline-image[data-alignment="right"],
    .article-block img[data-alignment="right"] {
      float: right !important;
      margin: 0.5rem 0 1rem 1.5rem !important;
      max-width: 50% !important;
      height: auto !important;
    }
    .article-block img.article-inline-image[data-alignment="center"],
    .article-block img[data-alignment="center"] {
      display: block !important;
      float: none !important;
      margin: 1.5rem auto !important;
      max-width: 100% !important;
      height: auto !important;
    }
    .article-block img.article-inline-image[data-alignment="full"],
    .article-block img[data-alignment="full"] {
      display: block !important;
      float: none !important;
      width: 100% !important;
      margin: 1.5rem 0 !important;
      height: auto !important;
    }
    /* Mobile: Stack floated images above text */
    @media (max-width: 640px) {
      .article-block img.article-inline-image[data-alignment="left"],
      .article-block img.article-inline-image[data-alignment="right"],
      .article-block img[data-alignment="left"],
      .article-block img[data-alignment="right"] {
        float: none !important;
        display: block !important;
        max-width: 100% !important;
        margin: 1rem auto !important;
      }
    }
    /* Clear floats at container end only */
    .article-block::after {
      content: "";
      display: table;
      clear: both;
    }
  `;

  // ============================================================================
  // PLAIN ARTICLE MODE (styling disabled)
  // ============================================================================
  if (!enableStyling) {
    const plainProseStyles = `
      ${imageFloatStyles}
      .article-block-plain {
        font-family: var(--font-body);
        font-size: ${textSizes.body};
        color: var(--color-foreground);
        line-height: ${theme.typography.lineHeights.relaxed};
      }
      .article-block-plain > *:first-child {
        margin-top: 0;
      }
      .article-block-plain h2 {
        font-family: var(--font-heading);
        font-size: ${textSizes.h2};
        font-weight: 600;
        margin-top: 1.5em;
        margin-bottom: 0.5em;
        color: var(--color-foreground);
      }
      .article-block-plain h2:first-child {
        margin-top: 0;
      }
      .article-block-plain h3 {
        font-family: var(--font-heading);
        font-size: ${textSizes.h3};
        font-weight: 600;
        margin-top: 1.25em;
        margin-bottom: 0.5em;
        color: var(--color-foreground);
      }
      .article-block-plain h3:first-child {
        margin-top: 0;
      }
      .article-block-plain p {
        margin-top: 1em;
        margin-bottom: 1em;
      }
      .article-block-plain p:first-child {
        margin-top: 0;
      }
      .article-block-plain a {
        color: var(--color-primary);
        text-decoration: underline;
      }
      .article-block-plain blockquote {
        border-left: 2px solid var(--color-primary);
        padding-left: 1rem;
        font-style: italic;
        color: var(--color-muted-foreground);
      }
      .article-block-plain ul {
        padding-left: 1.5rem;
        margin: 1rem 0;
        list-style-type: disc;
      }
      .article-block-plain ol {
        padding-left: 1.5rem;
        margin: 1rem 0;
        list-style-type: decimal;
      }
      .article-block-plain li {
        margin: 0.25rem 0;
        display: list-item;
      }
    `;

    return (
      <section
        className="py-12 px-6"
        style={{ backgroundColor: "var(--color-background)" }}
      >
        <style dangerouslySetInnerHTML={{ __html: plainProseStyles }} />
        <div className={`${contentWidthClass} mx-auto`}>
          <div
            className="article-block article-block-plain max-w-none"
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

    if (useThemeBackground && !content.boxBackgroundColor) {
      return boxBgOpacity < 1 ? undefined : "var(--color-background)";
    }

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
  const getTextColors = (): { text: string; link: string; muted: string } => {
    if (textColorMode === "light") {
      return {
        text: "#FFFFFF",
        link: "#FFFFFF",
        muted: "rgba(255, 255, 255, 0.9)",
      };
    } else if (textColorMode === "dark") {
      return {
        text: "#1F2937",
        link: "#2563EB",
        muted: "#6B7280",
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
    ${imageFloatStyles}
    .article-block-styled {
      font-family: var(--font-body);
      font-size: ${textSizes.body};
      color: ${textColor};
      line-height: ${theme.typography.lineHeights.relaxed};
    }
    .article-block-styled > *:first-child {
      margin-top: 0;
    }
    .article-block-styled h2 {
      font-family: var(--font-heading);
      font-size: ${textSizes.h2};
      font-weight: 600;
      margin-top: 1.5em;
      margin-bottom: 0.5em;
      color: ${textColor};
    }
    .article-block-styled h2:first-child {
      margin-top: 0;
    }
    .article-block-styled h3 {
      font-family: var(--font-heading);
      font-size: ${textSizes.h3};
      font-weight: 600;
      margin-top: 1.25em;
      margin-bottom: 0.5em;
      color: ${textColor};
    }
    .article-block-styled h3:first-child {
      margin-top: 0;
    }
    .article-block-styled p {
      margin-top: 1em;
      margin-bottom: 1em;
    }
    .article-block-styled p:first-child {
      margin-top: 0;
    }
    .article-block-styled a {
      color: ${linkColor};
      text-decoration: underline;
    }
    .article-block-styled blockquote {
      border-left: 2px solid ${linkColor};
      padding-left: 1rem;
      font-style: italic;
      color: ${mutedColor};
    }
    .article-block-styled ul {
      padding-left: 1.5rem;
      margin: 1rem 0;
      list-style-type: disc;
    }
    .article-block-styled ol {
      padding-left: 1.5rem;
      margin: 1rem 0;
      list-style-type: decimal;
    }
    .article-block-styled li {
      margin: 0.25rem 0;
      display: list-item;
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
          className="article-block article-block-styled max-w-none"
          dangerouslySetInnerHTML={{ __html: content.body }}
        />
      </div>
    </section>
  );
}
