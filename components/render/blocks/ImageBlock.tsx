import type { ThemeData } from "@/lib/drizzle/schema/theme-types";
import type { ImageContent } from "@/lib/section-types";
import { getSmallStyles, getCardStyles } from "../utilities/theme-styles";

interface ImageBlockProps {
  content: ImageContent;
  theme: ThemeData;
}

export function ImageBlock({ content, theme }: ImageBlockProps) {
  return (
    <section
      className="py-12 px-6"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      <div className="max-w-4xl mx-auto">
        <figure
          className="overflow-hidden"
          style={{
            ...getCardStyles(theme),
            padding: 0,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={content.src}
            alt={content.alt}
            className="w-full h-auto object-cover"
          />
          {content.caption && (
            <figcaption
              className="p-4"
              style={{
                ...getSmallStyles(theme),
                backgroundColor: "var(--color-muted)",
              }}
            >
              {content.caption}
            </figcaption>
          )}
        </figure>
      </div>
    </section>
  );
}
