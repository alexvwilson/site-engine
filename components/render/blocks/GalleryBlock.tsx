import type { ThemeData } from "@/lib/drizzle/schema/theme-types";
import type { GalleryContent } from "@/lib/section-types";
import { getSmallStyles, getCardStyles } from "../utilities/theme-styles";

interface GalleryBlockProps {
  content: GalleryContent;
  theme: ThemeData;
}

export function GalleryBlock({
  content,
  theme,
}: GalleryBlockProps) {
  if (!content.images || content.images.length === 0) {
    return (
      <section
        className="py-12 px-6"
        style={{ backgroundColor: "var(--color-background)" }}
      >
        <div className="max-w-6xl mx-auto text-center">
          <p style={{ color: "var(--color-muted-foreground)" }}>
            No images in gallery
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      className="py-12 px-6"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      <div className="max-w-6xl mx-auto">
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "1.5rem",
            justifyContent: "center",
          }}
        >
          {content.images.map((image, index) => (
            <figure
              key={index}
              className="overflow-hidden"
              style={{
                ...getCardStyles(theme),
                padding: 0,
                flex: "1 1 280px",
                maxWidth: "400px",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-48 object-cover"
              />
              {image.caption && (
                <figcaption
                  className="p-3"
                  style={{
                    ...getSmallStyles(theme),
                    backgroundColor: "var(--color-muted)",
                  }}
                >
                  {image.caption}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
