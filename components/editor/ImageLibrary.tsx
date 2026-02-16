"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Loader2, ImageIcon } from "lucide-react";
import { listSiteImages, type ImageFile } from "@/app/actions/storage";
import { cn } from "@/lib/utils";
import { AlbumSelector, ALL_IMAGES_VALUE, toListImagesAlbumId } from "./AlbumSelector";

interface ImageLibraryProps {
  siteId: string;
  onSelect: (url: string) => void;
}

export function ImageLibrary({ siteId, onSelect }: ImageLibraryProps): React.ReactElement {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [albumFilter, setAlbumFilter] = useState<string>(ALL_IMAGES_VALUE);

  const loadImages = useCallback(async () => {
    setLoading(true);
    setError(null);

    const result = await listSiteImages(siteId, toListImagesAlbumId(albumFilter));
    if (result.success) {
      setImages(result.images ?? []);
    } else {
      setError(result.error ?? "Failed to load images");
    }
    setLoading(false);
  }, [siteId, albumFilter]);

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-sm text-destructive">{error}</div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Album filter */}
      <AlbumSelector
        siteId={siteId}
        value={albumFilter}
        onChange={setAlbumFilter}
        showAllOption
        placeholder="Filter by album..."
      />

      {/* Image grid or empty state */}
      {images.length === 0 ? (
        <div className="text-center py-8">
          <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            {albumFilter === ALL_IMAGES_VALUE ? "No images uploaded yet" : "No images in this album"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {albumFilter === ALL_IMAGES_VALUE
              ? "Upload images using the Upload tab to see them here"
              : "Try selecting a different album or upload new images"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto p-1">
          {images.map((image) => (
            <button
              key={image.id}
              type="button"
              onClick={() => onSelect(image.url)}
              className={cn(
                "relative aspect-square rounded-md overflow-hidden border-2 border-transparent",
                "hover:border-primary focus:border-primary focus:outline-none",
                "transition-colors bg-muted"
              )}
            >
              <Image
                src={image.url}
                alt={image.altText || image.name}
                fill
                sizes="(max-width: 768px) 33vw, 100px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
