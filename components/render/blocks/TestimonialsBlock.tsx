import type { ThemeData } from "@/lib/drizzle/schema/theme-types";
import type { TestimonialsContent } from "@/lib/section-types";
import {
  getHeadingStyles,
  getBodyStyles,
  getSmallStyles,
  getCardStyles,
} from "../utilities/theme-styles";
import { Quote } from "lucide-react";
import {
  hexToRgba,
  BORDER_WIDTHS,
  BORDER_RADII,
  TEXT_SIZES,
} from "@/lib/styling-utils";

interface TestimonialsBlockProps {
  content: TestimonialsContent;
  theme: ThemeData;
}

// Legacy aliases for existing code
const borderWidthMap = BORDER_WIDTHS;
const borderRadiusMap = BORDER_RADII;
const textSizeScale = {
  small: TEXT_SIZES.small.scale,
  normal: TEXT_SIZES.normal.scale,
  large: TEXT_SIZES.large.scale,
};

export function TestimonialsBlock({
  content,
  theme,
}: TestimonialsBlockProps) {
  // Empty state
  if (!content.testimonials || content.testimonials.length === 0) {
    return (
      <section
        className="py-16 px-6"
        style={{ backgroundColor: "var(--color-background)" }}
      >
        <div className="max-w-6xl mx-auto text-center">
          <p style={{ color: "var(--color-muted-foreground)" }}>
            No testimonials added
          </p>
        </div>
      </section>
    );
  }

  // Plain mode (styling disabled) - original behavior
  if (!content.enableStyling) {
    return (
      <section
        className="py-16 px-6"
        style={{ backgroundColor: "var(--color-background)" }}
      >
        <div className="max-w-6xl mx-auto">
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "2rem",
              justifyContent: "center",
            }}
          >
            {content.testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="flex flex-col"
                style={{
                  ...getCardStyles(theme),
                  flex: "1 1 280px",
                  maxWidth: "400px",
                }}
              >
                <Quote
                  className="mb-4 opacity-20"
                  size={32}
                  style={{ color: "var(--color-primary)" }}
                />
                <blockquote
                  className="flex-1 mb-6"
                  style={{
                    ...getBodyStyles(theme),
                    fontStyle: "italic",
                  }}
                >
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
                <div className="flex items-center gap-3">
                  {testimonial.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.author}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold"
                      style={{ backgroundColor: "var(--color-primary)" }}
                    >
                      {testimonial.author.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p
                      style={{
                        ...getHeadingStyles(theme, "h4"),
                        fontSize: theme.typography.scale.body,
                      }}
                    >
                      {testimonial.author}
                    </p>
                    {testimonial.role && (
                      <p style={getSmallStyles(theme)}>{testimonial.role}</p>
                    )}
                  </div>
                </div>
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
    (content.overlayOpacity ?? 0) > 0 ||
    (!hasBackgroundImage && content.overlayColor);
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

  // Card styles
  const cardStyles: React.CSSProperties = {
    flex: "1 1 280px",
    maxWidth: "400px",
  };

  if (showCardBackground) {
    if (content.cardBackgroundColor) {
      cardStyles.backgroundColor = content.cardBackgroundColor;
      cardStyles.padding = "1.5rem";
      cardStyles.borderRadius = "0.5rem";
    } else {
      Object.assign(cardStyles, getCardStyles(theme));
    }
  }

  // Text color based on mode
  let quoteColor: string;
  let authorColor: string;
  let roleColor: string;

  switch (content.textColorMode) {
    case "light":
      quoteColor = "rgba(255, 255, 255, 0.9)";
      authorColor = "#FFFFFF";
      roleColor = "rgba(255, 255, 255, 0.7)";
      break;
    case "dark":
      quoteColor = "#374151";
      authorColor = "#1F2937";
      roleColor = "#6B7280";
      break;
    default: // auto
      if (showCardBackground) {
        // Cards have backgrounds - use theme colors
        quoteColor = "var(--color-foreground)";
        authorColor = "var(--color-foreground)";
        roleColor = "var(--color-muted-foreground)";
      } else if (hasBackgroundImage) {
        // No card backgrounds, section has image - use light text
        quoteColor = "rgba(255, 255, 255, 0.9)";
        authorColor = "#FFFFFF";
        roleColor = "rgba(255, 255, 255, 0.7)";
      } else {
        // No card backgrounds, no image - use theme colors
        quoteColor = "var(--color-foreground)";
        authorColor = "var(--color-foreground)";
        roleColor = "var(--color-muted-foreground)";
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
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "2rem",
            justifyContent: "center",
          }}
        >
          {content.testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="flex flex-col"
              style={cardStyles}
            >
              <Quote
                className="mb-4 opacity-20"
                size={32 * textScale}
                style={{ color: "var(--color-primary)" }}
              />
              <blockquote
                className="flex-1 mb-6"
                style={{
                  ...getBodyStyles(theme),
                  fontStyle: "italic",
                  color: quoteColor,
                  fontSize: `calc(${getBodyStyles(theme).fontSize || "1rem"} * ${textScale})`,
                }}
              >
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>
              <div className="flex items-center gap-3">
                {testimonial.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.author}
                    className="w-12 h-12 rounded-full object-cover"
                    style={{ transform: `scale(${textScale})` }}
                  />
                ) : (
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold"
                    style={{
                      backgroundColor: "var(--color-primary)",
                      transform: `scale(${textScale})`,
                    }}
                  >
                    {testimonial.author.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p
                    style={{
                      ...getHeadingStyles(theme, "h4"),
                      fontSize: `calc(${theme.typography.scale.body} * ${textScale})`,
                      color: authorColor,
                    }}
                  >
                    {testimonial.author}
                  </p>
                  {testimonial.role && (
                    <p
                      style={{
                        ...getSmallStyles(theme),
                        color: roleColor,
                        fontSize: `calc(${getSmallStyles(theme).fontSize || "0.875rem"} * ${textScale})`,
                      }}
                    >
                      {testimonial.role}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
