import type { ThemeData } from "@/lib/drizzle/schema/theme-types";
import type { HeroContent, HeroButton } from "@/lib/section-types";
import {
  getHeadingStyles,
  getBodyStyles,
  getButtonStyles,
  getOutlineButtonStyles,
} from "../utilities/theme-styles";
import { transformUrl } from "@/lib/url-utils";
import { RotatingText } from "./RotatingText";

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

      <div className="relative z-10 max-w-3xl mx-auto text-center">
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

        {content.subheading && (
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
        )}

        {buttons.length > 0 && (
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
        )}
      </div>
    </section>
  );
}
