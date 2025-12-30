"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Loader2,
  ImageIcon,
  Search,
  Trash2,
  CheckSquare,
  Square,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  listSiteImages,
  deleteImages,
  type ImageFile,
} from "@/app/actions/storage";

interface ImageLibraryManagerProps {
  siteId: string;
  onClose?: () => void;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "Unknown";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "Unknown";
  return new Date(dateStr).toLocaleDateString();
}

export function ImageLibraryManager({
  siteId,
}: ImageLibraryManagerProps): React.ReactElement {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  const loadImages = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await listSiteImages(siteId);
    if (result.success) {
      setImages(result.images ?? []);
    } else {
      setError(result.error ?? "Failed to load images");
    }
    setLoading(false);
  }, [siteId]);

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  const filteredImages = images.filter((img) =>
    img.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (url: string): void => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(url)) {
        next.delete(url);
      } else {
        next.add(url);
      }
      return next;
    });
  };

  const selectAll = (): void => {
    setSelected(new Set(filteredImages.map((img) => img.url)));
  };

  const clearSelection = (): void => {
    setSelected(new Set());
  };

  const handleDelete = async (): Promise<void> => {
    if (selected.size === 0) return;

    setDeleting(true);
    const urls = Array.from(selected);
    const result = await deleteImages(urls);

    if (result.success) {
      toast.success(`Deleted ${urls.length} image${urls.length > 1 ? "s" : ""}`);
      setImages((prev) => prev.filter((img) => !selected.has(img.url)));
      setSelected(new Set());
    } else {
      toast.error(result.error ?? "Delete failed");
    }
    setDeleting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center text-sm text-destructive">{error}</div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Search and actions bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by filename..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        {images.length > 0 && (
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={selectAll}>
              <CheckSquare className="mr-1 h-4 w-4" />
              All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearSelection}
              disabled={selected.size === 0}
            >
              <Square className="mr-1 h-4 w-4" />
              Clear
            </Button>
          </div>
        )}
      </div>

      {/* Delete bar */}
      {selected.size > 0 && (
        <div className="flex items-center justify-between rounded-lg border bg-muted/50 px-3 py-2">
          <span className="text-sm text-muted-foreground">
            {selected.size} image{selected.size > 1 ? "s" : ""} selected
          </span>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" disabled={deleting}>
                {deleting ? (
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-1 h-4 w-4" />
                )}
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Delete {selected.size} image{selected.size > 1 ? "s" : ""}?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. The selected images will be
                  permanently deleted from storage.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      {/* Image grid */}
      {images.length === 0 ? (
        <div className="py-12 text-center">
          <ImageIcon className="mx-auto mb-2 h-12 w-12 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No images uploaded yet</p>
        </div>
      ) : filteredImages.length === 0 ? (
        <div className="py-12 text-center">
          <Search className="mx-auto mb-2 h-12 w-12 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No images match &quot;{search}&quot;
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {filteredImages.map((image) => (
            <div
              key={image.url}
              className={cn(
                "group relative overflow-hidden rounded-lg border bg-muted",
                selected.has(image.url) && "ring-2 ring-primary"
              )}
            >
              {/* Checkbox */}
              <div className="absolute left-2 top-2 z-10">
                <Checkbox
                  checked={selected.has(image.url)}
                  onCheckedChange={() => toggleSelect(image.url)}
                  className="bg-background"
                />
              </div>

              {/* Image */}
              <button
                type="button"
                onClick={() => toggleSelect(image.url)}
                className="relative aspect-square w-full"
              >
                <Image
                  src={image.url}
                  alt={image.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                  className="object-cover"
                />
              </button>

              {/* Info overlay */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 pt-6">
                <p className="truncate text-xs font-medium text-white">
                  {image.name}
                </p>
                <p className="text-xs text-white/70">
                  {formatFileSize(image.size)} · {formatDate(image.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image count */}
      {images.length > 0 && (
        <p className="text-center text-xs text-muted-foreground">
          {filteredImages.length} of {images.length} images
        </p>
      )}
    </div>
  );
}
