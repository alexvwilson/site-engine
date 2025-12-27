import type { ThemeData } from "@/lib/drizzle/schema/theme-types";
import type { CTAContent } from "@/lib/section-types";
import {
  getHeadingStyles,
  getBodyStyles,
  getButtonStyles,
} from "../utilities/theme-styles";

interface CTABlockProps {
  content: CTAContent;
  theme: ThemeData;
}

export function CTABlock({ content, theme }: CTABlockProps) {
  return (
    <section
      className="py-20 px-6"
      style={{ backgroundColor: theme.colors.primary }}
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
            href={content.buttonUrl}
            className="inline-block mt-8 hover:opacity-90 transition-opacity"
            style={{
              ...getButtonStyles(theme),
              backgroundColor: "#FFFFFF",
              color: theme.colors.primary,
            }}
          >
            {content.buttonText}
          </a>
        )}
      </div>
    </section>
  );
}
