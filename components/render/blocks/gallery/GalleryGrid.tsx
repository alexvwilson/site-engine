import type { CSSProperties } from "react";
import type { ThemeData } from "@/lib/drizzle/schema/theme-types";
import type { GalleryContent } from "@/lib/section-types";
import { getSmallStyles } from "../../utilities/theme-styles";
import { cn } from "@/lib/utils";

interface GalleryGridProps {
  content: GalleryContent;
  theme: ThemeData;
  onImageClick?: (index: number) => void;
}

const GAP_CLASSES = {
  none: "gap-0",
  small: "gap-2",
  medium: "gap-4",
  large: "gap-6",
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

const ASPECT_RATIO_CLASSES = {
  "1:1": "aspect-square",
  "16:9": "aspect-video",
  "4:3": "aspect-[4/3]",
  "3:4": "aspect-[3/4]",
  original: "",
} as const;

const COLUMN_CLASSES = {
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  auto: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
} as const;

export function GalleryGrid({
  content,
  theme,
  onImageClick,
}: GalleryGridProps): React.ReactElement {
  const aspectRatio = content.aspectRatio ?? "1:1";
  const columns = content.columns ?? "auto";
  const gap = content.gap ?? "medium";
  const showBorder = content.showBorder ?? true;
  const borderWidth = content.borderWidth ?? "thin";
  const borderRadius = content.borderRadius ?? "medium";
  const borderColor = content.borderColor || "var(--color-primary)";

  const getImageStyles = (): CSSProperties => {
    const styles: CSSProperties = {
      backgroundColor: "var(--color-background)",
      borderRadius: BORDER_RADIUS_VALUES[borderRadius],
    };

    if (showBorder) {
      styles.border = `${BORDER_WIDTH_VALUES[borderWidth]} solid ${borderColor}`;
      styles.boxShadow = theme.components.card.shadow;
    }

    return styles;
  };

  return (
    <div className={cn("grid", COLUMN_CLASSES[columns], GAP_CLASSES[gap])}>
      {content.images.map((image, index) => (
        <figure
          key={index}
          className={cn("overflow-hidden", onImageClick && "cursor-pointer")}
          style={getImageStyles()}
          onClick={() => onImageClick?.(index)}
        >
          <div
            className={cn(
              "relative w-full overflow-hidden",
              ASPECT_RATIO_CLASSES[aspectRatio]
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.src}
              alt={image.alt}
              className={cn(
                "w-full h-full",
                aspectRatio === "original"
                  ? "object-contain"
                  : "object-cover absolute inset-0"
              )}
            />
          </div>
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
