import type { ThemeData } from "@/lib/drizzle/schema/theme-types";
import type { HeroContent } from "@/lib/section-types";
import {
  getHeadingStyles,
  getBodyStyles,
  getButtonStyles,
} from "../utilities/theme-styles";
import { transformUrl } from "@/lib/url-utils";

interface HeroBlockProps {
  content: HeroContent;
  theme: ThemeData;
  basePath?: string;
}

export function HeroBlock({ content, theme, basePath = "" }: HeroBlockProps) {
  const hasBackgroundImage =
    content.backgroundImage && content.backgroundImage.trim() !== "";

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
            color: hasBackgroundImage ? "#FFFFFF" : "var(--color-foreground)",
          }}
        >
          {content.heading}
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

        {content.ctaText && content.ctaUrl && (
          <a
            href={transformUrl(basePath, content.ctaUrl)}
            className="inline-block mt-8 hover:opacity-90 transition-opacity"
            style={getButtonStyles(theme)}
          >
            {content.ctaText}
          </a>
        )}
      </div>
    </section>
  );
}
