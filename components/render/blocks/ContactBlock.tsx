import type { ThemeData } from "@/lib/drizzle/schema/theme-types";
import type { ContactContent } from "@/lib/section-types";
import {
  getHeadingStyles,
  getBodyStyles,
  getInputStyles,
  getButtonStyles,
  getCardStyles,
} from "../utilities/theme-styles";
import {
  hexToRgba,
  BORDER_WIDTHS,
  BORDER_RADII,
  TEXT_SIZES,
} from "@/lib/styling-utils";

interface ContactBlockProps {
  content: ContactContent;
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

export function ContactBlock({ content, theme }: ContactBlockProps) {
  // Handle legacy data - default to "detailed" for backwards compatibility
  const variant = content.variant ?? "detailed";

  // Plain mode (styling disabled) - original behavior
  if (!content.enableStyling) {
    return (
      <section
        className="py-16 px-6"
        style={{ backgroundColor: "var(--color-muted)" }}
      >
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 style={getHeadingStyles(theme, "h2")}>{content.heading}</h2>
            {content.description && (
              <p
                className="mt-4"
                style={{
                  ...getBodyStyles(theme),
                  color: "var(--color-muted-foreground)",
                }}
              >
                {content.description}
              </p>
            )}
          </div>

          <div style={getCardStyles(theme)}>
            <form className="space-y-4">
              {/* Name */}
              <div>
                <label
                  className="block mb-2"
                  style={{ ...getBodyStyles(theme), fontWeight: 500 }}
                >
                  Name
                </label>
                <input
                  type="text"
                  placeholder="Your name"
                  disabled
                  style={getInputStyles(theme)}
                  className="opacity-60 cursor-not-allowed"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  className="block mb-2"
                  style={{ ...getBodyStyles(theme), fontWeight: 500 }}
                >
                  Email <span style={{ color: "var(--color-primary)" }}>*</span>
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  disabled
                  style={getInputStyles(theme)}
                  className="opacity-60 cursor-not-allowed"
                />
              </div>

              {/* Company & Phone - only for detailed variant */}
              {variant === "detailed" && (
                <>
                  <div>
                    <label
                      className="block mb-2"
                      style={{ ...getBodyStyles(theme), fontWeight: 500 }}
                    >
                      Company
                    </label>
                    <input
                      type="text"
                      placeholder="Your company"
                      disabled
                      style={getInputStyles(theme)}
                      className="opacity-60 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label
                      className="block mb-2"
                      style={{ ...getBodyStyles(theme), fontWeight: 500 }}
                    >
                      Phone
                    </label>
                    <input
                      type="tel"
                      placeholder="Your phone number"
                      disabled
                      style={getInputStyles(theme)}
                      className="opacity-60 cursor-not-allowed"
                    />
                  </div>
                </>
              )}

              {/* Message */}
              <div>
                <label
                  className="block mb-2"
                  style={{ ...getBodyStyles(theme), fontWeight: 500 }}
                >
                  Message <span style={{ color: "var(--color-primary)" }}>*</span>
                </label>
                <textarea
                  placeholder="Your message..."
                  rows={4}
                  disabled
                  style={{
                    ...getInputStyles(theme),
                    resize: "none",
                    minHeight: "100px",
                  }}
                  className="opacity-60 cursor-not-allowed"
                />
              </div>

              <button
                type="submit"
                disabled
                className="w-full mt-4 opacity-60 cursor-not-allowed"
                style={getButtonStyles(theme)}
              >
                Send Message
              </button>
              <p
                className="text-center mt-2"
                style={{
                  fontSize: theme.typography.scale.small,
                  color: "var(--color-muted-foreground)",
                }}
              >
                Form is display-only in preview mode
              </p>
            </form>
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
  const showFormBackground = content.showFormBackground ?? true;
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

  // Form card styles
  const formCardStyles: React.CSSProperties = {};

  if (showFormBackground) {
    if (content.formBackgroundColor) {
      formCardStyles.backgroundColor = content.formBackgroundColor;
      formCardStyles.padding = "1.5rem";
      formCardStyles.borderRadius = "0.5rem";
    } else {
      Object.assign(formCardStyles, getCardStyles(theme));
    }
  }

  // Text color based on mode
  let headingColor: string;
  let descriptionColor: string;
  let labelColor: string;

  switch (content.textColorMode) {
    case "light":
      headingColor = "#FFFFFF";
      descriptionColor = "rgba(255, 255, 255, 0.8)";
      labelColor = "#FFFFFF";
      break;
    case "dark":
      headingColor = "#1F2937";
      descriptionColor = "#6B7280";
      labelColor = "#374151";
      break;
    default: // auto
      // Heading/description adapt to section background
      if (hasBackgroundImage || (hasOverlay && (content.overlayOpacity ?? 0) > 30)) {
        headingColor = "#FFFFFF";
        descriptionColor = "rgba(255, 255, 255, 0.8)";
      } else {
        headingColor = "var(--color-foreground)";
        descriptionColor = "var(--color-muted-foreground)";
      }
      // Labels are inside form card, so use theme colors if form has background
      if (showFormBackground) {
        labelColor = "var(--color-foreground)";
      } else if (hasBackgroundImage) {
        labelColor = "#FFFFFF";
      } else {
        labelColor = "var(--color-foreground)";
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
        className="relative z-10 max-w-2xl mx-auto"
        style={containerStyles}
      >
        <div className="text-center mb-8">
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
        </div>

        <div style={formCardStyles}>
          <form className="space-y-4">
            {/* Name */}
            <div>
              <label
                className="block mb-2"
                style={{
                  ...getBodyStyles(theme),
                  fontWeight: 500,
                  color: labelColor,
                  fontSize: `calc(${getBodyStyles(theme).fontSize || "1rem"} * ${textScale})`,
                }}
              >
                Name
              </label>
              <input
                type="text"
                placeholder="Your name"
                disabled
                style={getInputStyles(theme)}
                className="opacity-60 cursor-not-allowed"
              />
            </div>

            {/* Email */}
            <div>
              <label
                className="block mb-2"
                style={{
                  ...getBodyStyles(theme),
                  fontWeight: 500,
                  color: labelColor,
                  fontSize: `calc(${getBodyStyles(theme).fontSize || "1rem"} * ${textScale})`,
                }}
              >
                Email <span style={{ color: "var(--color-primary)" }}>*</span>
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                disabled
                style={getInputStyles(theme)}
                className="opacity-60 cursor-not-allowed"
              />
            </div>

            {/* Company & Phone - only for detailed variant */}
            {variant === "detailed" && (
              <>
                <div>
                  <label
                    className="block mb-2"
                    style={{
                      ...getBodyStyles(theme),
                      fontWeight: 500,
                      color: labelColor,
                      fontSize: `calc(${getBodyStyles(theme).fontSize || "1rem"} * ${textScale})`,
                    }}
                  >
                    Company
                  </label>
                  <input
                    type="text"
                    placeholder="Your company"
                    disabled
                    style={getInputStyles(theme)}
                    className="opacity-60 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label
                    className="block mb-2"
                    style={{
                      ...getBodyStyles(theme),
                      fontWeight: 500,
                      color: labelColor,
                      fontSize: `calc(${getBodyStyles(theme).fontSize || "1rem"} * ${textScale})`,
                    }}
                  >
                    Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="Your phone number"
                    disabled
                    style={getInputStyles(theme)}
                    className="opacity-60 cursor-not-allowed"
                  />
                </div>
              </>
            )}

            {/* Message */}
            <div>
              <label
                className="block mb-2"
                style={{
                  ...getBodyStyles(theme),
                  fontWeight: 500,
                  color: labelColor,
                  fontSize: `calc(${getBodyStyles(theme).fontSize || "1rem"} * ${textScale})`,
                }}
              >
                Message <span style={{ color: "var(--color-primary)" }}>*</span>
              </label>
              <textarea
                placeholder="Your message..."
                rows={4}
                disabled
                style={{
                  ...getInputStyles(theme),
                  resize: "none",
                  minHeight: "100px",
                }}
                className="opacity-60 cursor-not-allowed"
              />
            </div>

            <button
              type="submit"
              disabled
              className="w-full mt-4 opacity-60 cursor-not-allowed"
              style={getButtonStyles(theme)}
            >
              Send Message
            </button>
            <p
              className="text-center mt-2"
              style={{
                fontSize: `calc(${theme.typography.scale.small} * ${textScale})`,
                color: showFormBackground
                  ? "var(--color-muted-foreground)"
                  : descriptionColor,
              }}
            >
              Form is display-only in preview mode
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
