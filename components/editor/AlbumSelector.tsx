"use client";

import { useState, useEffect, useCallback } from "react";
import { Folder, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAlbumsForSite } from "@/app/actions/albums";
import type { ImageAlbum } from "@/lib/drizzle/schema/image-albums";

// Value used for "Uncategorized" / no album selection
export const UNCATEGORIZED_VALUE = "__uncategorized__";
// Value used for "All Images" filter option
export const ALL_IMAGES_VALUE = "__all__";

/**
 * Convert AlbumSelector value to listSiteImages albumId parameter.
 * - ALL_IMAGES_VALUE → undefined (all images)
 * - UNCATEGORIZED_VALUE → null (uncategorized only)
 * - string → string (specific album)
 */
export function toListImagesAlbumId(value: string): string | null | undefined {
  if (value === ALL_IMAGES_VALUE) return undefined;
  if (value === UNCATEGORIZED_VALUE) return null;
  return value;
}

type AlbumWithCount = ImageAlbum & { imageCount: number };

interface AlbumSelectorProps {
  siteId: string;
  /** The selected value - use the constants or an album ID */
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  /** Show "All Images" option for filtering (vs upload where you pick one album) */
  showAllOption?: boolean;
  /** Placeholder text */
  placeholder?: string;
  className?: string;
}

export function AlbumSelector({
  siteId,
  value,
  onChange,
  disabled,
  showAllOption = false,
  placeholder = "Select album",
  className,
}: AlbumSelectorProps): React.ReactElement {
  const [albums, setAlbums] = useState<AlbumWithCount[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAlbums = useCallback(async () => {
    const result = await getAlbumsForSite(siteId);
    if (result.success && result.albums) {
      setAlbums(result.albums);
    }
    setLoading(false);
  }, [siteId]);

  useEffect(() => {
    loadAlbums();
  }, [loadAlbums]);

  const handleChange = (newValue: string): void => {
    onChange(newValue);
  };

  if (loading) {
    return (
      <div className={className}>
        <div className="flex items-center gap-2 h-9 px-3 border rounded-md bg-muted/30">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Loading albums...</span>
        </div>
      </div>
    );
  }

  return (
    <Select
      value={value}
      onValueChange={handleChange}
      disabled={disabled}
    >
      <SelectTrigger className={className}>
        <div className="flex items-center gap-2">
          <Folder className="h-4 w-4 text-muted-foreground shrink-0" />
          <SelectValue placeholder={placeholder} />
        </div>
      </SelectTrigger>
      <SelectContent>
        {showAllOption && (
          <SelectItem value={ALL_IMAGES_VALUE}>
            <span className="flex items-center gap-2">
              All Images
            </span>
          </SelectItem>
        )}
        <SelectItem value={UNCATEGORIZED_VALUE}>
          <span className="flex items-center gap-2">
            Uncategorized
          </span>
        </SelectItem>
        {albums.map((album) => (
          <SelectItem key={album.id} value={album.id}>
            <span className="flex items-center gap-2">
              {album.name}
              <span className="text-muted-foreground text-xs">
                ({album.imageCount})
              </span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
