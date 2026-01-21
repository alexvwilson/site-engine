import type { ThemeData } from "@/lib/drizzle/schema/theme-types";
import type { CTAContent } from "@/lib/section-types";
import {
  getHeadingStyles,
  getBodyStyles,
  getButtonStyles,
} from "../utilities/theme-styles";
import { transformUrl } from "@/lib/url-utils";
import {
  hexToRgba,
  BORDER_WIDTHS,
  BORDER_RADII,
  TEXT_SIZES,
} from "@/lib/styling-utils";

interface CTABlockProps {
  content: CTAContent;
  theme: ThemeData;
  basePath?: string;
}

// Legacy aliases for existing code
const borderWidthMap = BORDER_WIDTHS;
const borderRadiusMap = BORDER_RADII;
const textSizeScale = {
  small: TEXT_SIZES.small.scale,
  normal: TEXT_SIZES.normal.scale,
  large: TEXT_SIZES.large.scale,
};

export function CTABlock({ content, theme, basePath = "" }: CTABlockProps) {
  // Plain mode (styling disabled) - original behavior with primary background
  if (!content.enableStyling) {
    return (
      <section
        className="py-20 px-6"
        style={{ backgroundColor: "var(--color-primary)" }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <h2
            style={{
              ...getHeadingStyles(theme, "h2"),
              color: "#FFFFFF",
            }}
          >
            {content.heading}
          </h2>

          {content.description && (
            <p
              className="mt-4"
              style={{
                ...getBodyStyles(theme),
                color: "rgba(255, 255, 255, 0.9)",
              }}
            >
              {content.description}
            </p>
          )}

          {content.buttonText && content.buttonUrl && (
            <a
              href={transformUrl(basePath, content.buttonUrl)}
              className="inline-block mt-8 hover:opacity-90 transition-opacity"
              style={{
                ...getButtonStyles(theme),
                backgroundColor: "#FFFFFF",
                color: "var(--color-primary)",
              }}
            >
              {content.buttonText}
            </a>
          )}
        </div>
      </section>
    );
  }

  // Styled mode - full styling support
  const hasBackgroundImage = !!content.backgroundImage;
  const hasOverlay =
    (content.overlayOpacity ?? 0) > 0 ||
    (!hasBackgroundImage && content.overlayColor);
  const showBorder = content.showBorder ?? false;
  const textScale = textSizeScale[content.textSize ?? "normal"];

  // Section background styles
  const sectionStyles: React.CSSProperties = {
    position: "relative",
  };

  if (hasBackgroundImage) {
    sectionStyles.backgroundImage = `url(${content.backgroundImage})`;
    sectionStyles.backgroundSize = "cover";
    sectionStyles.backgroundPosition = "center";
  }

  // Overlay color
  const overlayRgba = hasOverlay
    ? hexToRgba(
        content.overlayColor || "#000000",
        content.overlayOpacity ?? 0
      )
    : undefined;

  // Container styles (border + box background)
  const containerStyles: React.CSSProperties = {};

  if (showBorder) {
    const borderColor = content.borderColor || "var(--color-primary)";
    containerStyles.border = `${borderWidthMap[content.borderWidth ?? "medium"]} solid ${borderColor}`;
    containerStyles.borderRadius =
      borderRadiusMap[content.borderRadius ?? "medium"];
    containerStyles.padding = "2rem";

    // Box background
    if (content.useThemeBackground) {
      containerStyles.backgroundColor = "var(--color-background)";
    } else if (content.boxBackgroundColor) {
      containerStyles.backgroundColor = hexToRgba(
        content.boxBackgroundColor,
        content.boxBackgroundOpacity ?? 100
      );
    }
  }

  // Text color based on mode
  let headingColor: string;
  let descriptionColor: string;
  let buttonBgColor: string;
  let buttonTextColor: string;

  switch (content.textColorMode) {
    case "light":
      headingColor = "#FFFFFF";
      descriptionColor = "rgba(255, 255, 255, 0.9)";
      buttonBgColor = "#FFFFFF";
      buttonTextColor = "var(--color-primary)";
      break;
    case "dark":
      headingColor = "#1F2937";
      descriptionColor = "#6B7280";
      buttonBgColor = "var(--color-primary)";
      buttonTextColor = "#FFFFFF";
      break;
    default: // auto
      if (hasBackgroundImage || (hasOverlay && (content.overlayOpacity ?? 0) > 30)) {
        // Dark background - use light text
        headingColor = "#FFFFFF";
        descriptionColor = "rgba(255, 255, 255, 0.9)";
        buttonBgColor = "#FFFFFF";
        buttonTextColor = "var(--color-primary)";
      } else if (showBorder && (content.useThemeBackground || content.boxBackgroundColor)) {
        // Has container background - use theme colors
        headingColor = "var(--color-foreground)";
        descriptionColor = "var(--color-muted-foreground)";
        buttonBgColor = "var(--color-primary)";
        buttonTextColor = "#FFFFFF";
      } else {
        // Plain section background - use theme colors
        headingColor = "var(--color-foreground)";
        descriptionColor = "var(--color-muted-foreground)";
        buttonBgColor = "var(--color-primary)";
        buttonTextColor = "#FFFFFF";
      }
  }

  return (
    <section className="py-20 px-6" style={sectionStyles}>
      {/* Overlay layer */}
      {hasOverlay && overlayRgba && (
        <div
          className="absolute inset-0"
          style={{ backgroundColor: overlayRgba }}
        />
      )}

      {/* Content container */}
      <div
        className="relative z-10 max-w-3xl mx-auto text-center"
        style={containerStyles}
      >
        <h2
          style={{
            ...getHeadingStyles(theme, "h2"),
            color: headingColor,
            fontSize: `calc(${getHeadingStyles(theme, "h2").fontSize} * ${textScale})`,
          }}
        >
          {content.heading}
        </h2>

        {content.description && (
          <p
            className="mt-4"
            style={{
              ...getBodyStyles(theme),
              color: descriptionColor,
              fontSize: `calc(${getBodyStyles(theme).fontSize || "1rem"} * ${textScale})`,
            }}
          >
            {content.description}
          </p>
        )}

        {content.buttonText && content.buttonUrl && (
          <a
            href={transformUrl(basePath, content.buttonUrl)}
            className="inline-block mt-8 hover:opacity-90 transition-opacity"
            style={{
              ...getButtonStyles(theme),
              backgroundColor: buttonBgColor,
              color: buttonTextColor,
            }}
          >
            {content.buttonText}
          </a>
        )}
      </div>
    </section>
  );
}
