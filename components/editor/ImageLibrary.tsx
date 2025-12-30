"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Loader2, ImageIcon } from "lucide-react";
import { listSiteImages, type ImageFile } from "@/app/actions/storage";
import { cn } from "@/lib/utils";

interface ImageLibraryProps {
  siteId: string;
  onSelect: (url: string) => void;
}

export function ImageLibrary({ siteId, onSelect }: ImageLibraryProps) {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    listSiteImages(siteId).then((result) => {
      if (result.success) {
        setImages(result.images ?? []);
      } else {
        setError(result.error ?? "Failed to load images");
      }
      setLoading(false);
    });
  }, [siteId]);

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

  if (images.length === 0) {
    return (
      <div className="text-center py-8">
        <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">No images uploaded yet</p>
        <p className="text-xs text-muted-foreground mt-1">
          Upload images using the Upload tab to see them here
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto p-1">
      {images.map((image) => (
        <button
          key={image.name}
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
            alt={image.name}
            fill
            sizes="(max-width: 768px) 33vw, 100px"
            className="object-cover"
          />
        </button>
      ))}
    </div>
  );
}
