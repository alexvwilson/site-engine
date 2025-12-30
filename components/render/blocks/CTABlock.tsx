import type { ThemeData } from "@/lib/drizzle/schema/theme-types";
import type { CTAContent } from "@/lib/section-types";
import {
  getHeadingStyles,
  getBodyStyles,
  getButtonStyles,
} from "../utilities/theme-styles";
import { transformUrl } from "@/lib/url-utils";

interface CTABlockProps {
  content: CTAContent;
  theme: ThemeData;
  basePath?: string;
}

export function CTABlock({ content, theme, basePath = "" }: CTABlockProps) {
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
