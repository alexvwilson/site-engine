import type { ThemeData } from "@/lib/drizzle/schema/theme-types";
import type { ImageContent, ImageLayout, ImageWidth } from "@/lib/section-types";
import { hexToRgba, BORDER_WIDTHS, BORDER_RADII } from "@/lib/styling-utils";

interface ImageBlockProps {
  content: ImageContent;
  theme: ThemeData;
}

/**
 * Get container style based on percentage width
 */
function getContainerStyle(imageWidth: ImageWidth): React.CSSProperties {
  if (imageWidth === 100) {
    return { width: "100%" };
  }
  return {
    width: "100%",
    maxWidth: `${imageWidth}%`,
    marginLeft: "auto",
    marginRight: "auto",
  };
}

/**
 * Get text colors based on textColorMode and background
 */
function getTextColors(
  textColorMode: string | undefined,
  hasBackgroundImage: boolean
): { text: string; link: string; muted: string } {
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
    // Auto mode: use light text if there's a background image with overlay
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
}

export function ImageBlock({ content, theme }: ImageBlockProps) {
  // Don't render if no image
  if (!content.src) {
    return null;
  }

  const layout: ImageLayout = content.layout ?? "image-only";
  const imageWidth: ImageWidth = content.imageWidth ?? 50;
  const textWidth: ImageWidth = content.textWidth ?? 50;
  const enableStyling = content.enableStyling ?? false;
  const containerStyle = getContainerStyle(imageWidth);

  // Styling values
  const showBorder = enableStyling && (content.showBorder ?? false);
  const hasBackgroundImage = Boolean(content.backgroundImage?.trim());
  const overlayOpacity = (content.overlayOpacity ?? 0) / 100;
  const showOverlay = enableStyling && overlayOpacity > 0;

  // Border styles for the image
  const borderStyles: React.CSSProperties = showBorder
    ? {
        border: `${BORDER_WIDTHS[content.borderWidth ?? "medium"]} solid ${content.borderColor || "var(--color-primary)"}`,
        borderRadius: BORDER_RADII[content.borderRadius ?? "medium"],
      }
    : {};

  // Section background styles
  const sectionStyles: React.CSSProperties = enableStyling && hasBackgroundImage
    ? {
        backgroundImage: `url(${content.backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : {
        backgroundColor: "var(--color-background)",
      };

  // Text colors for description
  const colors = getTextColors(content.textColorMode, enableStyling && hasBackgroundImage);

  // Check if layout shows text
  const showsText = layout !== "image-only";
  const hasDescription = Boolean(content.description?.trim());

  // Image element with optional caption
  const imageElement = (
    <figure className="overflow-hidden" style={borderStyles}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={content.src}
        alt={content.alt}
        className="w-full h-auto object-cover"
        style={showBorder ? { borderRadius: "inherit" } : {}}
      />
      {content.caption && (
        <figcaption
          className="p-3 text-sm"
          style={{
            backgroundColor: "var(--color-muted)",
            color: "var(--color-muted-foreground)",
            fontFamily: "var(--font-body)",
          }}
        >
          {content.caption}
        </figcaption>
      )}
    </figure>
  );

  // Description element (rich text)
  const descriptionStyles = `
    .image-block-description {
      font-family: var(--font-body);
      font-size: 1rem;
      color: ${colors.text};
      line-height: ${theme.typography.lineHeights.relaxed};
    }
    .image-block-description > *:first-child {
      margin-top: 0;
    }
    .image-block-description h2 {
      font-family: var(--font-heading);
      font-size: 1.875rem;
      font-weight: 600;
      margin-top: 1.5em;
      margin-bottom: 0.5em;
      color: ${colors.text};
    }
    .image-block-description h2:first-child {
      margin-top: 0;
    }
    .image-block-description h3 {
      font-family: var(--font-heading);
      font-size: 1.5rem;
      font-weight: 600;
      margin-top: 1.25em;
      margin-bottom: 0.5em;
      color: ${colors.text};
    }
    .image-block-description h3:first-child {
      margin-top: 0;
    }
    .image-block-description p {
      margin-top: 1em;
      margin-bottom: 1em;
    }
    .image-block-description p:first-child {
      margin-top: 0;
    }
    .image-block-description a {
      color: ${colors.link};
      text-decoration: underline;
    }
    .image-block-description blockquote {
      border-left: 2px solid ${colors.link};
      padding-left: 1rem;
      font-style: italic;
      color: ${colors.muted};
    }
    .image-block-description ul {
      padding-left: 1.5rem;
      margin: 1rem 0;
      list-style-type: disc;
    }
    .image-block-description ol {
      padding-left: 1.5rem;
      margin: 1rem 0;
      list-style-type: decimal;
    }
    .image-block-description li {
      margin: 0.25rem 0;
      display: list-item;
    }
  `;

  const descriptionElement = showsText && hasDescription && (
    <>
      <style dangerouslySetInnerHTML={{ __html: descriptionStyles }} />
      <div
        className="image-block-description max-w-none"
        dangerouslySetInnerHTML={{ __html: content.description! }}
      />
    </>
  );

  // Check if this is a side-by-side layout
  const isSideBySide = layout === "image-left" || layout === "image-right";

  // For side-by-side layouts, calculate container width (image + text)
  // Uses both imageWidth and textWidth, capped at 100%
  const getSideBySideContainerWidth = (): number => {
    const total = imageWidth + textWidth;
    return Math.min(total, 100);
  };

  // Calculate flex ratios for side-by-side layouts
  const getImageFlexBasis = (): string => {
    const total = imageWidth + textWidth;
    const ratio = (imageWidth / total) * 100;
    return `${ratio}%`;
  };

  const getTextFlexBasis = (): string => {
    const total = imageWidth + textWidth;
    const ratio = (textWidth / total) * 100;
    return `${ratio}%`;
  };

  // Render content based on layout
  const renderContent = (): React.ReactNode => {
    switch (layout) {
      case "image-only":
        return imageElement;

      case "image-left":
        return (
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div
              className="w-full md:flex-shrink-0"
              style={{ flexBasis: getImageFlexBasis() }}
            >
              {imageElement}
            </div>
            <div
              className="w-full"
              style={{ flexBasis: getTextFlexBasis() }}
            >
              {descriptionElement}
            </div>
          </div>
        );

      case "image-right":
        return (
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div
              className="w-full md:flex-shrink-0 order-1 md:order-2"
              style={{ flexBasis: getImageFlexBasis() }}
            >
              {imageElement}
            </div>
            <div
              className="w-full order-2 md:order-1"
              style={{ flexBasis: getTextFlexBasis() }}
            >
              {descriptionElement}
            </div>
          </div>
        );

      case "image-top":
        return (
          <div className="flex flex-col gap-6">
            {imageElement}
            {descriptionElement}
          </div>
        );

      case "image-bottom":
        return (
          <div className="flex flex-col gap-6">
            {descriptionElement}
            {imageElement}
          </div>
        );

      default:
        return imageElement;
    }
  };

  // For side-by-side layouts, use calculated container width (image + text, both equal)
  // For other layouts, use percentage-based container width
  const getContainerStyles = (): React.CSSProperties => {
    if (isSideBySide) {
      const containerWidth = getSideBySideContainerWidth();
      if (containerWidth === 100) {
        return { width: "100%" };
      }
      return {
        width: "100%",
        maxWidth: `${containerWidth}%`,
        marginLeft: "auto",
        marginRight: "auto",
      };
    }
    return containerStyle;
  };

  // Padding: always have horizontal padding for side-by-side, otherwise based on width
  const paddingClass = isSideBySide
    ? "py-12 px-6"
    : imageWidth === 100
      ? "py-12"
      : "py-12 px-6";

  return (
    <section className={`relative ${paddingClass}`} style={sectionStyles}>
      {/* Overlay (when styling enabled and opacity > 0) */}
      {showOverlay && (
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: hexToRgba(
              content.overlayColor || "#000000",
              overlayOpacity
            ),
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10" style={getContainerStyles()}>
        {renderContent()}
      </div>
    </section>
  );
}
