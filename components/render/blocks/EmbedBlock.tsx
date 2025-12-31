import type { ThemeData } from "@/lib/drizzle/schema/theme-types";
import type { EmbedContent } from "@/lib/section-types";
import { getCardStyles } from "../utilities/theme-styles";

interface EmbedBlockProps {
  content: EmbedContent;
  theme: ThemeData;
}

export function EmbedBlock({ content, theme }: EmbedBlockProps) {
  if (!content.src) {
    return null;
  }

  const aspectRatioStyle =
    content.aspectRatio === "custom"
      ? { height: `${content.customHeight || 400}px` }
      : { aspectRatio: content.aspectRatio.replace(":", "/") };

  return (
    <section
      className="px-6 py-12"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      <div className="mx-auto max-w-4xl">
        <div
          className="relative w-full overflow-hidden"
          style={{
            ...getCardStyles(theme),
            padding: 0,
            ...aspectRatioStyle,
          }}
        >
          <iframe
            src={content.src}
            title={content.title || "Embedded content"}
            className="absolute inset-0 h-full w-full"
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
}
