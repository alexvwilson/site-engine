"use client";

import { useState } from "react";
import type { ThemeData } from "@/lib/drizzle/schema/theme-types";
import type { GalleryContent } from "@/lib/section-types";
import { GalleryGrid } from "./gallery/GalleryGrid";
import { GalleryMasonry } from "./gallery/GalleryMasonry";
import { GalleryCarousel } from "./gallery/GalleryCarousel";
import { GalleryLightbox } from "./gallery/GalleryLightbox";

interface GalleryBlockProps {
  content: GalleryContent;
  theme: ThemeData;
}

export function GalleryBlock({
  content,
  theme,
}: GalleryBlockProps): React.ReactElement {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

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

  const layout = content.layout ?? "grid";
  const lightboxEnabled = content.lightbox ?? false;

  const handleImageClick = (index: number): void => {
    if (lightboxEnabled) {
      setLightboxIndex(index);
      setLightboxOpen(true);
    }
  };

  return (
    <section
      className="py-12 px-6"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      <div className="max-w-6xl mx-auto">
        {layout === "grid" && (
          <GalleryGrid
            content={content}
            theme={theme}
            onImageClick={lightboxEnabled ? handleImageClick : undefined}
          />
        )}
        {layout === "masonry" && (
          <GalleryMasonry
            content={content}
            theme={theme}
            onImageClick={lightboxEnabled ? handleImageClick : undefined}
          />
        )}
        {layout === "carousel" && (
          <GalleryCarousel
            content={content}
            theme={theme}
            onImageClick={lightboxEnabled ? handleImageClick : undefined}
          />
        )}
      </div>

      {lightboxEnabled && lightboxOpen && (
        <GalleryLightbox
          images={content.images}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
          onNavigate={setLightboxIndex}
        />
      )}
    </section>
  );
}
