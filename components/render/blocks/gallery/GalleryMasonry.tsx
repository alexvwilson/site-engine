import type { CSSProperties } from "react";
import type { ThemeData } from "@/lib/drizzle/schema/theme-types";
import type { GalleryContent } from "@/lib/section-types";
import { getSmallStyles } from "../../utilities/theme-styles";
import { cn } from "@/lib/utils";

interface GalleryMasonryProps {
  content: GalleryContent;
  theme: ThemeData;
  onImageClick?: (index: number) => void;
}

const GAP_VALUES = {
  none: "0",
  small: "0.5rem",
  medium: "1rem",
  large: "1.5rem",
} as const;

const BORDER_WIDTH_VALUES = {
  thin: "1px",
  medium: "2px",
  thick: "4px",
} as const;

const BORDER_RADIUS_VALUES = {
  none: "0",
  small: "0.25rem",
  medium: "0.5rem",
  large: "1rem",
  pill: "9999px",
} as const;

const COLUMN_COUNTS = {
  2: 2,
  3: 3,
  4: 4,
  auto: 3,
} as const;

export function GalleryMasonry({
  content,
  theme,
  onImageClick,
}: GalleryMasonryProps): React.ReactElement {
  const columns = content.columns ?? "auto";
  const gap = content.gap ?? "medium";
  const showBorder = content.showBorder ?? true;
  const borderWidth = content.borderWidth ?? "thin";
  const borderRadius = content.borderRadius ?? "medium";
  const borderColor = content.borderColor || "var(--color-primary)";
  const columnCount = COLUMN_COUNTS[columns];
  const gapValue = GAP_VALUES[gap];

  const getImageStyles = (): CSSProperties => {
    const styles: CSSProperties = {
      backgroundColor: "var(--color-background)",
      borderRadius: BORDER_RADIUS_VALUES[borderRadius],
      marginBottom: gapValue,
    };

    if (showBorder) {
      styles.border = `${BORDER_WIDTH_VALUES[borderWidth]} solid ${borderColor}`;
      styles.boxShadow = theme.components.card.shadow;
    }

    return styles;
  };

  return (
    <div
      className="[column-count:1] sm:[column-count:2]"
      style={
        {
          "--masonry-columns": columnCount,
          columnGap: gapValue,
        } as React.CSSProperties
      }
    >
      <style>{`
        @media (min-width: 1024px) {
          [style*="--masonry-columns"] {
            column-count: var(--masonry-columns);
          }
        }
      `}</style>
      {content.images.map((image, index) => (
        <figure
          key={index}
          className={cn(
            "overflow-hidden break-inside-avoid",
            onImageClick && "cursor-pointer"
          )}
          style={getImageStyles()}
          onClick={() => onImageClick?.(index)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image.src}
            alt={image.alt}
            className="w-full h-auto object-cover"
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
  );
}
