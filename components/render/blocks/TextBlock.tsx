import type { ThemeData } from "@/lib/drizzle/schema/theme-types";
import type { TextContent } from "@/lib/section-types";
import { getBodyStyles } from "../utilities/theme-styles";

interface TextBlockProps {
  content: TextContent;
  theme: ThemeData;
}

export function TextBlock({ content, theme }: TextBlockProps) {
  return (
    <section
      className="py-12 px-6"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      <div className="max-w-3xl mx-auto">
        <div
          className="prose prose-lg max-w-none"
          style={{
            ...getBodyStyles(theme),
            lineHeight: theme.typography.lineHeights.relaxed,
          }}
        >
          {content.body.split("\n").map((paragraph, index) => (
            <p key={index} className="mb-4 last:mb-0">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
