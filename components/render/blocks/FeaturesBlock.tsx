import type { ThemeData } from "@/lib/drizzle/schema/theme-types";
import type { FeaturesContent } from "@/lib/section-types";
import {
  getHeadingStyles,
  getBodyStyles,
  getCardStyles,
} from "../utilities/theme-styles";
import { Icon } from "../utilities/icon-resolver";

interface FeaturesBlockProps {
  content: FeaturesContent;
  theme: ThemeData;
}

function hexToRgba(hex: string, opacity: number): string {
  const cleanHex = hex.replace("#", "");
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
}

const borderWidthMap = {
  thin: "1px",
  medium: "2px",
  thick: "4px",
};

const borderRadiusMap = {
  none: "0",
  small: "0.25rem",
  medium: "0.5rem",
  large: "1rem",
  full: "9999px",
};

const textSizeScale = {
  small: 0.875,
  normal: 1,
  large: 1.125,
};

export function FeaturesBlock({ content, theme }: FeaturesBlockProps) {
  // Empty state
  if (!content.features || content.features.length === 0) {
    return (
      <section
        className="py-16 px-6"
        style={{ backgroundColor: "var(--color-muted)" }}
      >
        <div className="max-w-6xl mx-auto text-center">
          <p style={{ color: "var(--color-muted-foreground)" }}>
            No features added
          </p>
        </div>
      </section>
    );
  }

  // Check if section header should be shown
  const hasSectionHeader = content.sectionTitle || content.sectionSubtitle;

  // Plain mode (styling disabled) - original behavior
  if (!content.enableStyling) {
    return (
      <section
        className="py-16 px-6"
        style={{ backgroundColor: "var(--color-muted)" }}
      >
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          {hasSectionHeader && (
            <div className="text-center mb-12">
              {content.sectionTitle && (
                <h2
                  className="mb-3"
                  style={getHeadingStyles(theme, "h2")}
                >
                  {content.sectionTitle}
                </h2>
              )}
              {content.sectionSubtitle && (
                <p
                  style={{
                    ...getBodyStyles(theme),
                    color: "var(--color-muted-foreground)",
                    maxWidth: "600px",
                    marginLeft: "auto",
                    marginRight: "auto",
                  }}
                >
                  {content.sectionSubtitle}
                </p>
              )}
            </div>
          )}

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "2rem",
              justifyContent: "center",
            }}
          >
            {content.features.map((feature, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center"
                style={{
                  ...getCardStyles(theme),
                  flex: "1 1 280px",
                  maxWidth: "400px",
                }}
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                  style={{ backgroundColor: "var(--color-primary)" }}
                >
                  <Icon name={feature.icon} className="text-white" size={28} />
                </div>
                <h3
                  className="mb-1"
                  style={{
                    ...getHeadingStyles(theme, "h4"),
                  }}
                >
                  {feature.title}
                </h3>
                {feature.subtitle && (
                  <p
                    className="mb-2"
                    style={{
                      ...getBodyStyles(theme),
                      color: "var(--color-primary)",
                      fontWeight: 500,
                      fontSize: theme.typography.scale.small,
                    }}
                  >
                    {feature.subtitle}
                  </p>
                )}
                <p
                  style={{
                    ...getBodyStyles(theme),
                    color: "var(--color-muted-foreground)",
                  }}
                >
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Styled mode - full styling support
  const hasBackgroundImage = !!content.backgroundImage;
  const hasOverlay =
    (content.overlayOpacity ?? 0) > 0 || (!hasBackgroundImage && content.overlayColor);
  const showBorder = content.showBorder ?? false;
  const showCardBackground = content.showCardBackground ?? true;
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
    ? hexToRgba(content.overlayColor || "#000000", content.overlayOpacity ?? 0)
    : undefined;

  // Container styles (border + box background)
  const containerStyles: React.CSSProperties = {};

  if (showBorder) {
    const borderColor = content.borderColor || "var(--color-primary)";
    containerStyles.border = `${borderWidthMap[content.borderWidth ?? "medium"]} solid ${borderColor}`;
    containerStyles.borderRadius = borderRadiusMap[content.borderRadius ?? "medium"];
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

  // Card styles
  const cardStyles: React.CSSProperties = {
    flex: "1 1 280px",
    maxWidth: "400px",
  };

  if (showCardBackground) {
    // Use theme card styles or custom color
    if (content.cardBackgroundColor) {
      cardStyles.backgroundColor = content.cardBackgroundColor;
      cardStyles.padding = "1.5rem";
      cardStyles.borderRadius = "0.5rem";
    } else {
      Object.assign(cardStyles, getCardStyles(theme));
    }
  }

  // Text color based on mode
  // Key fix: When cards have backgrounds, text should be readable on the CARD, not the section
  let titleColor: string;
  let descriptionColor: string;

  switch (content.textColorMode) {
    case "light":
      titleColor = "#FFFFFF";
      descriptionColor = "rgba(255, 255, 255, 0.8)";
      break;
    case "dark":
      titleColor = "#1F2937";
      descriptionColor = "#6B7280";
      break;
    default: // auto
      if (showCardBackground) {
        // Cards have backgrounds - use theme colors (readable on card background)
        titleColor = "var(--color-foreground)";
        descriptionColor = "var(--color-muted-foreground)";
      } else if (hasBackgroundImage) {
        // No card backgrounds, section has image - use light text
        titleColor = "#FFFFFF";
        descriptionColor = "rgba(255, 255, 255, 0.8)";
      } else {
        // No card backgrounds, no image - use theme colors
        titleColor = "var(--color-foreground)";
        descriptionColor = "var(--color-muted-foreground)";
      }
  }

  return (
    <section className="py-16 px-6" style={sectionStyles}>
      {/* Overlay layer */}
      {hasOverlay && overlayRgba && (
        <div
          className="absolute inset-0"
          style={{ backgroundColor: overlayRgba }}
        />
      )}

      {/* Content container */}
      <div
        className="relative z-10 max-w-6xl mx-auto"
        style={containerStyles}
      >
        {/* Section Header */}
        {hasSectionHeader && (
          <div className="text-center mb-12">
            {content.sectionTitle && (
              <h2
                className="mb-3"
                style={{
                  ...getHeadingStyles(theme, "h2"),
                  color: titleColor,
                  fontSize: `calc(${getHeadingStyles(theme, "h2").fontSize} * ${textScale})`,
                }}
              >
                {content.sectionTitle}
              </h2>
            )}
            {content.sectionSubtitle && (
              <p
                style={{
                  ...getBodyStyles(theme),
                  color: descriptionColor,
                  maxWidth: "600px",
                  marginLeft: "auto",
                  marginRight: "auto",
                  fontSize: `calc(${getBodyStyles(theme).fontSize || "1rem"} * ${textScale})`,
                }}
              >
                {content.sectionSubtitle}
              </p>
            )}
          </div>
        )}

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "2rem",
            justifyContent: "center",
          }}
        >
          {content.features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center"
              style={cardStyles}
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                style={{
                  backgroundColor: "var(--color-primary)",
                  transform: `scale(${textScale})`,
                }}
              >
                <Icon name={feature.icon} className="text-white" size={28} />
              </div>
              <h3
                className="mb-1"
                style={{
                  ...getHeadingStyles(theme, "h4"),
                  color: titleColor,
                  fontSize: `calc(${getHeadingStyles(theme, "h4").fontSize} * ${textScale})`,
                }}
              >
                {feature.title}
              </h3>
              {feature.subtitle && (
                <p
                  className="mb-2"
                  style={{
                    ...getBodyStyles(theme),
                    color: "var(--color-primary)",
                    fontWeight: 500,
                    fontSize: `calc(${theme.typography.scale.small} * ${textScale})`,
                  }}
                >
                  {feature.subtitle}
                </p>
              )}
              <p
                style={{
                  ...getBodyStyles(theme),
                  color: descriptionColor,
                  fontSize: `calc(${getBodyStyles(theme).fontSize || "1rem"} * ${textScale})`,
                }}
              >
                {feature.description}
              </p>
              {feature.buttonText && feature.buttonUrl && (
                <a
                  href={feature.buttonUrl}
                  className="mt-4 inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors hover:opacity-80"
                  style={{
                    border: "2px solid var(--color-primary)",
                    color: "var(--color-primary)",
                    backgroundColor: "transparent",
                    fontSize: `calc(0.875rem * ${textScale})`,
                  }}
                >
                  {feature.buttonText}
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
