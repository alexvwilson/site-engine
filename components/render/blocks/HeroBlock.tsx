import type { ThemeData } from "@/lib/drizzle/schema/theme-types";
import type {
  HeroContent,
  HeroButton,
  HeroImageRounding,
  HeroImageBorderWidth,
  HeroImageShadow,
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

// Get border radius value from rounding option
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

// Get border width value
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

// Get drop shadow filter value (works better with images than box-shadow)
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

// Get buttons from content, handling legacy format
function getButtons(content: HeroContent): HeroButton[] {
  // If buttons array exists, use it
  if (content.buttons && content.buttons.length > 0) {
    return content.buttons;
  }

  // Migrate from legacy showCta/ctaText/ctaUrl format
  if (content.showCta !== false && content.ctaText && content.ctaUrl) {
    return [
      {
        id: "legacy-btn",
        text: content.ctaText,
        url: content.ctaUrl,
        variant: "primary",
      },
    ];
  }

  // No buttons
  return [];
}

interface HeroBlockProps {
  content: HeroContent;
  theme: ThemeData;
  basePath?: string;
}

export function HeroBlock({ content, theme, basePath = "" }: HeroBlockProps) {
  const hasBackgroundImage =
    content.backgroundImage && content.backgroundImage.trim() !== "";

  const textColor = hasBackgroundImage ? "#FFFFFF" : "var(--color-foreground)";

  const showRotatingTitle =
    content.titleMode === "rotating" &&
    content.rotatingTitle &&
    content.rotatingTitle.words.length > 0;

  const buttons = getButtons(content);

  // Hero image settings
  const hasHeroImage = content.image && content.image.trim() !== "";
  const imagePosition = content.imagePosition ?? "top";
  const imageMobileStack = content.imageMobileStack ?? "above";
  const imageSize = content.imageSize ?? 200;
  const imageRounding = content.imageRounding ?? "none";
  const imageBorderWidth = content.imageBorderWidth ?? "none";
  const imageBorderColor =
    content.imageBorderColor || "var(--color-primary)";
  const imageShadow = content.imageShadow ?? "none";

  const isHorizontalLayout = imagePosition === "left" || imagePosition === "right";

  // Get button styles based on variant and background
  const getButtonStyle = (variant: "primary" | "secondary") => {
    if (variant === "primary") {
      return getButtonStyles(theme);
    }
    // Secondary/outline button
    const outlineStyles = getOutlineButtonStyles(theme);
    // When on background image, use white outline
    if (hasBackgroundImage) {
      return {
        ...outlineStyles,
        color: "#FFFFFF",
        borderColor: "#FFFFFF",
      };
    }
    return outlineStyles;
  };

  // Image element with styling
  // Using CSS filter drop-shadow which works better with images and rounded corners
  const HeroImage = hasHeroImage ? (
    <div
      className="relative flex-shrink-0"
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
          src={content.image!}
          alt={content.imageAlt || "Hero image"}
          fill
          className="object-cover"
        />
      </div>
    </div>
  ) : null;

  // Heading element
  const HeadingElement = (
    <h1
      style={{
        ...getHeadingStyles(theme, "h1"),
        color: textColor,
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
          {content.rotatingTitle!.afterText &&
            ` ${content.rotatingTitle!.afterText}`}
        </>
      ) : (
        content.heading
      )}
    </h1>
  );

  // Subheading element
  const SubheadingElement = content.subheading ? (
    <p
      className="mt-4"
      style={{
        ...getBodyStyles(theme),
        fontSize: theme.typography.scale.h4,
        color: hasBackgroundImage
          ? "rgba(255,255,255,0.9)"
          : "var(--color-muted-foreground)",
      }}
    >
      {content.subheading}
    </p>
  ) : null;

  // Buttons element
  const ButtonsElement = buttons.length > 0 ? (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
      {buttons.map((button) => (
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
  ) : null;

  // Text content
  const TextContent = (
    <div>
      {HeadingElement}
      {imagePosition === "after-title" && HeroImage && (
        <div className="my-6 flex justify-center">{HeroImage}</div>
      )}
      {SubheadingElement}
      {ButtonsElement}
    </div>
  );

  return (
    <section
      className="relative min-h-[400px] flex items-center justify-center py-20 px-6"
      style={{
        backgroundColor: hasBackgroundImage ? undefined : "var(--color-muted)",
        backgroundImage: hasBackgroundImage
          ? `url(${content.backgroundImage})`
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
        // Horizontal layout: Image on left or right, stacks on mobile
        <div
          className={`relative z-10 max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-12 ${
            imagePosition === "right" ? "md:flex-row-reverse" : ""
          }`}
        >
          {/* On mobile, use order classes to control stacking */}
          <div className={imageMobileStack === "below" ? "order-2 md:order-none" : ""}>
            {HeroImage}
          </div>
          <div className={`flex-1 text-center md:text-left ${imageMobileStack === "below" ? "order-1 md:order-none" : ""}`}>
            {TextContent}
          </div>
        </div>
      ) : (
        // Vertical layout: Image on top or bottom
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          {/* Top position: Image above text */}
          {imagePosition === "top" && HeroImage && (
            <div className="mb-6 flex justify-center">{HeroImage}</div>
          )}

          {/* Text content */}
          {TextContent}

          {/* Bottom position: Image below text */}
          {imagePosition === "bottom" && HeroImage && (
            <div className="mt-8 flex justify-center">{HeroImage}</div>
          )}
        </div>
      )}
    </section>
  );
}
