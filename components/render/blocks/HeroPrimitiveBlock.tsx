import type { ThemeData } from "@/lib/drizzle/schema/theme-types";
import type {
  HeroPrimitiveContent,
  HeroButton,
  HeroImageRounding,
  HeroImageBorderWidth,
  HeroImageShadow,
  HeadingLevel,
} from "@/lib/section-types";
import {
  getHeadingStyles,
  getBodyStyles,
  getButtonStyles,
  getOutlineButtonStyles,
} from "../utilities/theme-styles";
import { transformUrl } from "@/lib/url-utils";
import { RotatingText } from "./RotatingText";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  hexToRgba,
  BORDER_WIDTHS,
  BORDER_RADII,
  TEXT_SIZES,
} from "@/lib/styling-utils";

interface HeroPrimitiveBlockProps {
  content: HeroPrimitiveContent;
  theme: ThemeData;
  basePath?: string;
}

// =============================================================================
// Helper Functions (shared across layouts)
// =============================================================================

function getImageBorderRadius(rounding: HeroImageRounding): string {
  switch (rounding) {
    case "none":
      return "0";
    case "small":
      return "0.375rem";
    case "medium":
      return "0.75rem";
    case "large":
      return "1.5rem";
    case "full":
      return "9999px";
    default:
      return "0";
  }
}

function getImageBorderWidth(width: HeroImageBorderWidth): string {
  switch (width) {
    case "none":
      return "0";
    case "thin":
      return "1px";
    case "medium":
      return "2px";
    case "thick":
      return "4px";
    default:
      return "0";
  }
}

function getImageDropShadow(shadow: HeroImageShadow): string {
  switch (shadow) {
    case "none":
      return "none";
    case "small":
      return "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.4))";
    case "medium":
      return "drop-shadow(0 6px 12px rgba(0, 0, 0, 0.5))";
    case "large":
      return "drop-shadow(0 10px 20px rgba(0, 0, 0, 0.5))";
    case "xl":
      return "drop-shadow(0 16px 32px rgba(0, 0, 0, 0.6))";
    default:
      return "none";
  }
}

function getTextColorFromMode(
  mode: "auto" | "light" | "dark" | undefined,
  hasDarkBackground: boolean
): { heading: string; body: string } {
  switch (mode) {
    case "light":
      return { heading: "#FFFFFF", body: "rgba(255, 255, 255, 0.9)" };
    case "dark":
      return { heading: "#1F2937", body: "#6B7280" };
    default:
      if (hasDarkBackground) {
        return { heading: "#FFFFFF", body: "rgba(255, 255, 255, 0.9)" };
      }
      return {
        heading: "var(--color-foreground)",
        body: "var(--color-muted-foreground)",
      };
  }
}

// =============================================================================
// Shared Sub-Components
// =============================================================================

interface HeroImageElementProps {
  content: HeroPrimitiveContent;
  className?: string;
}

function HeroImageElement({ content, className }: HeroImageElementProps) {
  if (!content.image?.trim()) return null;

  const imageSize = content.imageSize ?? 200;
  const imageRounding = content.imageRounding ?? "none";
  const imageBorderWidth = content.imageBorderWidth ?? "none";
  const imageBorderColor = content.imageBorderColor || "var(--color-primary)";
  const imageShadow = content.imageShadow ?? "none";

  return (
    <div
      className={cn("relative flex-shrink-0", className)}
      style={{
        width: imageSize,
        height: imageSize,
        filter: imageShadow !== "none" ? getImageDropShadow(imageShadow) : undefined,
      }}
    >
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          borderRadius: getImageBorderRadius(imageRounding),
          borderWidth: getImageBorderWidth(imageBorderWidth),
          borderStyle: imageBorderWidth !== "none" ? "solid" : "none",
          borderColor: imageBorderColor,
        }}
      >
        <Image
          src={content.image}
          alt={content.imageAlt || "Hero image"}
          fill
          className="object-cover"
        />
      </div>
    </div>
  );
}

interface ButtonGroupProps {
  content: HeroPrimitiveContent;
  theme: ThemeData;
  basePath: string;
  maxButtons?: number;
  invertColors?: boolean;
  hasDarkBackground?: boolean;
}

function ButtonGroup({
  content,
  theme,
  basePath,
  maxButtons,
  invertColors,
  hasDarkBackground,
}: ButtonGroupProps) {
  const buttons = content.buttons ?? [];
  if (buttons.length === 0) return null;

  const displayButtons = maxButtons ? buttons.slice(0, maxButtons) : buttons;

  const getButtonStyle = (variant: "primary" | "secondary") => {
    if (invertColors) {
      return {
        ...getButtonStyles(theme),
        backgroundColor: "#FFFFFF",
        color: "var(--color-primary)",
      };
    }
    if (variant === "primary") {
      return getButtonStyles(theme);
    }
    const outlineStyles = getOutlineButtonStyles(theme);
    if (hasDarkBackground) {
      return {
        ...outlineStyles,
        color: "#FFFFFF",
        borderColor: "#FFFFFF",
      };
    }
    return outlineStyles;
  };

  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
      {displayButtons.map((button: HeroButton) => (
        <a
          key={button.id}
          href={transformUrl(basePath, button.url)}
          className="hover:opacity-90 transition-opacity"
          style={getButtonStyle(button.variant)}
        >
          {button.text}
        </a>
      ))}
    </div>
  );
}

// =============================================================================
// Layout Components
// =============================================================================

interface LayoutProps {
  content: HeroPrimitiveContent;
  theme: ThemeData;
  basePath: string;
}

function FullHeroLayout({ content, theme, basePath }: LayoutProps) {
  const hasBackgroundImage = !!content.heroBackgroundImage?.trim();
  const hasHeroImage = !!content.image?.trim();
  const imagePosition = content.imagePosition ?? "top";
  const imageMobileStack = content.imageMobileStack ?? "above";
  const isHorizontalLayout = imagePosition === "left" || imagePosition === "right";

  const textColors = getTextColorFromMode(content.textColorMode, hasBackgroundImage);

  const showRotatingTitle =
    content.titleMode === "rotating" &&
    content.rotatingTitle &&
    content.rotatingTitle.words.length > 0;

  const HeadingElement = (
    <h1
      style={{
        ...getHeadingStyles(theme, "h1"),
        color: textColors.heading,
      }}
    >
      {showRotatingTitle ? (
        <>
          {content.rotatingTitle!.beforeText}{" "}
          <RotatingText
            words={content.rotatingTitle!.words}
            effect={content.rotatingTitle!.effect}
            displayTime={content.rotatingTitle!.displayTime}
            animationMode={content.rotatingTitle!.animationMode}
          />
          {content.rotatingTitle!.afterText && ` ${content.rotatingTitle!.afterText}`}
        </>
      ) : (
        content.heading
      )}
    </h1>
  );

  const SubheadingElement = content.subheading ? (
    <p
      className="mt-4"
      style={{
        ...getBodyStyles(theme),
        fontSize: theme.typography.scale.h4,
        color: textColors.body,
      }}
    >
      {content.subheading}
    </p>
  ) : null;

  const BodyTextElement = content.bodyText ? (
    <div
      className="mt-6 prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
      style={{
        textAlign: content.bodyTextAlignment ?? "center",
        color: textColors.body,
      }}
      dangerouslySetInnerHTML={{ __html: content.bodyText }}
    />
  ) : null;

  const TextContent = (
    <div style={{ textAlign: content.textAlignment ?? "center" }}>
      {HeadingElement}
      {imagePosition === "after-title" && hasHeroImage && (
        <div className="my-6 flex justify-center">
          <HeroImageElement content={content} />
        </div>
      )}
      {SubheadingElement}
      {BodyTextElement}
      <ButtonGroup
        content={content}
        theme={theme}
        basePath={basePath}
        hasDarkBackground={hasBackgroundImage}
      />
    </div>
  );

  return (
    <section
      className="relative min-h-[400px] flex items-center justify-center py-20 px-6"
      style={{
        backgroundColor: hasBackgroundImage ? undefined : "var(--color-muted)",
        backgroundImage: hasBackgroundImage
          ? `url(${content.heroBackgroundImage})`
          : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {hasBackgroundImage && (
        <div
          className="absolute inset-0"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        />
      )}

      {isHorizontalLayout ? (
        <div
          className={cn(
            "relative z-10 max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-12",
            imagePosition === "right" && "md:flex-row-reverse"
          )}
        >
          <div className={imageMobileStack === "below" ? "order-2 md:order-none" : ""}>
            <HeroImageElement content={content} />
          </div>
          <div
            className={cn(
              "flex-1 text-center md:text-left",
              imageMobileStack === "below" && "order-1 md:order-none"
            )}
          >
            {TextContent}
          </div>
        </div>
      ) : (
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          {imagePosition === "top" && hasHeroImage && (
            <div className="mb-6 flex justify-center">
              <HeroImageElement content={content} />
            </div>
          )}
          {TextContent}
          {imagePosition === "bottom" && hasHeroImage && (
            <div className="mt-8 flex justify-center">
              <HeroImageElement content={content} />
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function CompactHeroLayout({ content, theme, basePath }: LayoutProps) {
  const hasHeroImage = !!content.image?.trim();
  const textColors = getTextColorFromMode(content.textColorMode, false);

  return (
    <section className="py-12 px-6 bg-muted/50">
      <div
        className="max-w-4xl mx-auto"
        style={{ textAlign: content.textAlignment ?? "center" }}
      >
        <h2
          style={{
            ...getHeadingStyles(theme, "h2"),
            color: textColors.heading,
          }}
        >
          {content.heading}
        </h2>
        {content.subheading && (
          <p
            className="mt-4"
            style={{
              ...getBodyStyles(theme),
              color: textColors.body,
            }}
          >
            {content.subheading}
          </p>
        )}
        {hasHeroImage && (
          <div className="mt-6 flex justify-center">
            <HeroImageElement content={content} />
          </div>
        )}
        <ButtonGroup
          content={content}
          theme={theme}
          basePath={basePath}
          maxButtons={1}
        />
      </div>
    </section>
  );
}

function CTALayout({ content, theme, basePath }: LayoutProps) {
  const borderWidthMap = BORDER_WIDTHS;
  const borderRadiusMap = BORDER_RADII;
  const textSizeScale = {
    small: TEXT_SIZES.small.scale,
    normal: TEXT_SIZES.normal.scale,
    large: TEXT_SIZES.large.scale,
  };

  // Plain mode (styling disabled) - primary background with inverted colors
  if (!content.enableStyling) {
    return (
      <section
        className="py-20 px-6"
        style={{ backgroundColor: "var(--color-primary)" }}
      >
        <div
          className="max-w-3xl mx-auto"
          style={{ textAlign: content.textAlignment ?? "center" }}
        >
          <h2
            style={{
              ...getHeadingStyles(theme, "h2"),
              color: "#FFFFFF",
            }}
          >
            {content.heading}
          </h2>
          {content.subheading && (
            <p
              className="mt-4"
              style={{
                ...getBodyStyles(theme),
                color: "rgba(255, 255, 255, 0.9)",
              }}
            >
              {content.subheading}
            </p>
          )}
          <ButtonGroup
            content={content}
            theme={theme}
            basePath={basePath}
            maxButtons={1}
            invertColors
          />
        </div>
      </section>
    );
  }

  // Styled mode - full SectionStyling support
  const hasBackgroundImage = !!content.backgroundImage;
  const hasOverlay =
    (content.overlayOpacity ?? 0) > 0 ||
    (!hasBackgroundImage && content.overlayColor);
  const showBorder = content.showBorder ?? false;
  const textScale = textSizeScale[content.textSize ?? "normal"];

  const sectionStyles: React.CSSProperties = {
    position: "relative",
  };

  if (hasBackgroundImage) {
    sectionStyles.backgroundImage = `url(${content.backgroundImage})`;
    sectionStyles.backgroundSize = "cover";
    sectionStyles.backgroundPosition = "center";
  }

  const overlayRgba = hasOverlay
    ? hexToRgba(content.overlayColor || "#000000", content.overlayOpacity ?? 0)
    : undefined;

  const containerStyles: React.CSSProperties = {};

  if (showBorder) {
    const borderColor = content.borderColor || "var(--color-primary)";
    containerStyles.border = `${borderWidthMap[content.borderWidth ?? "medium"]} solid ${borderColor}`;
    containerStyles.borderRadius = borderRadiusMap[content.borderRadius ?? "medium"];
    containerStyles.padding = "2rem";

    if (content.useThemeBackground) {
      containerStyles.backgroundColor = "var(--color-background)";
    } else if (content.boxBackgroundColor) {
      containerStyles.backgroundColor = hexToRgba(
        content.boxBackgroundColor,
        content.boxBackgroundOpacity ?? 100
      );
    }
  }

  // Determine colors based on mode
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
    default:
      if (hasBackgroundImage || (hasOverlay && (content.overlayOpacity ?? 0) > 30)) {
        headingColor = "#FFFFFF";
        descriptionColor = "rgba(255, 255, 255, 0.9)";
        buttonBgColor = "#FFFFFF";
        buttonTextColor = "var(--color-primary)";
      } else if (showBorder && (content.useThemeBackground || content.boxBackgroundColor)) {
        headingColor = "var(--color-foreground)";
        descriptionColor = "var(--color-muted-foreground)";
        buttonBgColor = "var(--color-primary)";
        buttonTextColor = "#FFFFFF";
      } else {
        headingColor = "var(--color-foreground)";
        descriptionColor = "var(--color-muted-foreground)";
        buttonBgColor = "var(--color-primary)";
        buttonTextColor = "#FFFFFF";
      }
  }

  const buttons = content.buttons ?? [];
  const firstButton = buttons[0];

  return (
    <section className="py-20 px-6" style={sectionStyles}>
      {hasOverlay && overlayRgba && (
        <div
          className="absolute inset-0"
          style={{ backgroundColor: overlayRgba }}
        />
      )}
      <div
        className="relative z-10 max-w-3xl mx-auto"
        style={{ ...containerStyles, textAlign: content.textAlignment ?? "center" }}
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
        {content.subheading && (
          <p
            className="mt-4"
            style={{
              ...getBodyStyles(theme),
              color: descriptionColor,
              fontSize: `calc(${getBodyStyles(theme).fontSize || "1rem"} * ${textScale})`,
            }}
          >
            {content.subheading}
          </p>
        )}
        {firstButton && (
          <a
            href={transformUrl(basePath, firstButton.url)}
            className="inline-block mt-8 hover:opacity-90 transition-opacity"
            style={{
              ...getButtonStyles(theme),
              backgroundColor: buttonBgColor,
              color: buttonTextColor,
            }}
          >
            {firstButton.text}
          </a>
        )}
      </div>
    </section>
  );
}

function TitleOnlyLayout({ content, theme }: LayoutProps) {
  const level = content.headingLevel ?? 1;
  const HeadingTag = `h${level}` as "h1" | "h2" | "h3";

  const textColors = getTextColorFromMode(content.textColorMode, false);

  const alignmentClass = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  }[content.textAlignment ?? "center"];

  const subtitleClass = {
    1: "text-xl",
    2: "text-lg",
    3: "text-base",
  }[level as HeadingLevel];

  return (
    <section className={cn("pt-6 pb-2 px-4", alignmentClass)}>
      <div className="max-w-4xl mx-auto">
        <HeadingTag
          style={{
            ...getHeadingStyles(theme, HeadingTag),
            color: textColors.heading,
          }}
        >
          {content.heading}
        </HeadingTag>
        {content.subheading && (
          <p
            style={{
              fontFamily: "var(--font-body)",
              color: textColors.heading,
              opacity: 0.8,
            }}
            className={cn("mt-4", subtitleClass)}
          >
            {content.subheading}
          </p>
        )}
      </div>
    </section>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export function HeroPrimitiveBlock({
  content,
  theme,
  basePath = "",
}: HeroPrimitiveBlockProps) {
  switch (content.layout) {
    case "full":
      return <FullHeroLayout content={content} theme={theme} basePath={basePath} />;
    case "compact":
      return <CompactHeroLayout content={content} theme={theme} basePath={basePath} />;
    case "cta":
      return <CTALayout content={content} theme={theme} basePath={basePath} />;
    case "title-only":
      return <TitleOnlyLayout content={content} theme={theme} basePath={basePath} />;
    default:
      return <FullHeroLayout content={content} theme={theme} basePath={basePath} />;
  }
}
