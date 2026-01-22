"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "@/components/editor/ImageUpload";
import type {
  GalleryContent,
  GalleryImage,
  GalleryAspectRatio,
  GalleryLayout,
  GalleryColumns,
  GalleryGap,
  GalleryBorderWidth,
  GalleryBorderRadius,
  GalleryAutoRotateInterval,
} from "@/lib/section-types";
import type { EditorMode } from "../inspector/EditorModeToggle";

interface GalleryEditorProps {
  content: GalleryContent;
  onChange: (content: GalleryContent) => void;
  disabled?: boolean;
  siteId: string;
  editorMode?: EditorMode;
}

const DEFAULT_IMAGE: GalleryImage = {
  src: "",
  alt: "Image description",
  caption: "",
};

export function GalleryEditor({
  content,
  onChange,
  disabled,
  siteId,
  editorMode = "all",
}: GalleryEditorProps) {
  const showContent = editorMode === "all" || editorMode === "content";
  const showLayout = editorMode === "all" || editorMode === "layout";

  // Defensive check: ensure images array exists
  const images = content.images ?? [];

  // Read the theme primary color from CSS variables
  const [themePrimaryColor, setThemePrimaryColor] = useState("#3B82F6");

  useEffect(() => {
    const root = document.documentElement;
    const primaryColor = getComputedStyle(root).getPropertyValue("--color-primary").trim();
    if (primaryColor) {
      setThemePrimaryColor(primaryColor);
    }
  }, []);

  const handleImageChange = (
    index: number,
    field: keyof GalleryImage,
    value: string
  ): void => {
    const newImages = [...images];
    newImages[index] = { ...newImages[index], [field]: value };
    onChange({ ...content, images: newImages });
  };

  const handleAddImage = (): void => {
    onChange({
      ...content,
      images: [...images, { ...DEFAULT_IMAGE }],
    });
  };

  const handleRemoveImage = (index: number): void => {
    const newImages = images.filter((_, i) => i !== index);
    onChange({ ...content, images: newImages });
  };

  const layout = content.layout ?? "grid";
  const aspectRatio = content.aspectRatio ?? "1:1";
  const columns = content.columns ?? "auto";
  const gap = content.gap ?? "medium";
  const lightbox = content.lightbox ?? false;
  const autoRotate = content.autoRotate ?? false;
  const autoRotateInterval = content.autoRotateInterval ?? 5;
  const showBorder = content.showBorder ?? true;
  const borderWidth = content.borderWidth ?? "thin";
  const borderRadius = content.borderRadius ?? "medium";
  const borderColor = content.borderColor ?? "";

  return (
    <div className="space-y-6">
      {/* Gallery Settings Panel - Layout */}
      {showLayout && (
        <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
          <h4 className="font-medium text-sm">Gallery Settings</h4>

          <div className="grid grid-cols-2 gap-4">
            {/* Layout */}
            <div className="space-y-2">
              <Label>Layout</Label>
              <Select
                value={layout}
                onValueChange={(value: GalleryLayout) =>
                  onChange({ ...content, layout: value })
                }
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">Grid</SelectItem>
                  <SelectItem value="masonry">Masonry</SelectItem>
                  <SelectItem value="carousel">Carousel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Aspect Ratio */}
            <div className="space-y-2">
              <Label>Aspect Ratio</Label>
              <Select
                value={aspectRatio}
                onValueChange={(value: GalleryAspectRatio) =>
                  onChange({ ...content, aspectRatio: value })
                }
                disabled={disabled || layout === "masonry"}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1:1">Square (1:1)</SelectItem>
                  <SelectItem value="16:9">Landscape (16:9)</SelectItem>
                  <SelectItem value="4:3">Landscape (4:3)</SelectItem>
                  <SelectItem value="3:4">Portrait (3:4)</SelectItem>
                  <SelectItem value="original">Original</SelectItem>
                </SelectContent>
              </Select>
              {layout === "masonry" && (
                <p className="text-xs text-muted-foreground">
                  Masonry uses original aspect ratios
                </p>
              )}
            </div>

            {/* Columns */}
            <div className="space-y-2">
              <Label>{layout === "carousel" ? "Visible Images" : "Columns"}</Label>
              <Select
                value={String(columns)}
                onValueChange={(value) =>
                  onChange({
                    ...content,
                    columns:
                      value === "auto" ? "auto" : (parseInt(value) as GalleryColumns),
                  })
                }
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                </SelectContent>
              </Select>
              {layout === "carousel" && (
                <p className="text-xs text-muted-foreground">
                  Images visible at once
                </p>
              )}
            </div>

            {/* Gap */}
            <div className="space-y-2">
              <Label>Spacing</Label>
              <Select
                value={gap}
                onValueChange={(value: GalleryGap) =>
                  onChange({ ...content, gap: value })
                }
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Border Settings */}
          <div className="space-y-3 pt-2 border-t">
            <div className="flex items-center gap-3 pt-2">
              <Switch
                id="border-toggle"
                checked={showBorder}
                onCheckedChange={(checked) =>
                  onChange({ ...content, showBorder: checked })
                }
                disabled={disabled}
              />
              <Label htmlFor="border-toggle" className="cursor-pointer">
                Show image borders
              </Label>
            </div>

            {/* Border Radius - Always visible */}
            <div className="space-y-2 pl-10">
              <Label>Corner Rounding</Label>
              <Select
                value={borderRadius}
                onValueChange={(value: GalleryBorderRadius) =>
                  onChange({ ...content, borderRadius: value })
                }
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                  <SelectItem value="pill">Pill</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {showBorder && (
              <div className="grid grid-cols-2 gap-4 pl-10">
                {/* Border Width */}
                <div className="space-y-2">
                  <Label>Border Width</Label>
                  <Select
                    value={borderWidth}
                    onValueChange={(value: GalleryBorderWidth) =>
                      onChange({ ...content, borderWidth: value })
                    }
                    disabled={disabled}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="thin">Thin</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="thick">Thick</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Border Color */}
                <div className="space-y-2">
                  <Label>Border Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={borderColor || themePrimaryColor}
                      onChange={(e) =>
                        onChange({ ...content, borderColor: e.target.value })
                      }
                      disabled={disabled}
                      className="h-9 w-14 rounded border cursor-pointer disabled:opacity-50"
                    />
                    {borderColor && (
                      <button
                        type="button"
                        onClick={() => onChange({ ...content, borderColor: "" })}
                        className="text-xs text-muted-foreground hover:text-foreground underline"
                        disabled={disabled}
                      >
                        Reset
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {borderColor ? borderColor : "Using theme primary"}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Lightbox Toggle */}
          <div className="flex items-center gap-3 pt-2">
            <Switch
              id="lightbox-toggle"
              checked={lightbox}
              onCheckedChange={(checked) =>
                onChange({ ...content, lightbox: checked })
              }
              disabled={disabled}
            />
            <Label htmlFor="lightbox-toggle" className="cursor-pointer">
              Enable lightbox (fullscreen on click)
            </Label>
          </div>

          {/* Auto-Rotate (Carousel only) */}
          {layout === "carousel" && (
            <div className="space-y-3 pt-2 border-t">
              <div className="flex items-center gap-3 pt-2">
                <Switch
                  id="auto-rotate-toggle"
                  checked={autoRotate}
                  onCheckedChange={(checked) =>
                    onChange({ ...content, autoRotate: checked })
                  }
                  disabled={disabled}
                />
                <Label htmlFor="auto-rotate-toggle" className="cursor-pointer">
                  Auto-rotate carousel
                </Label>
              </div>

              {autoRotate && (
                <div className="space-y-2 pl-10">
                  <Label>Interval</Label>
                  <Select
                    value={String(autoRotateInterval)}
                    onValueChange={(value) =>
                      onChange({
                        ...content,
                        autoRotateInterval: parseInt(value) as GalleryAutoRotateInterval,
                      })
                    }
                    disabled={disabled}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 seconds</SelectItem>
                      <SelectItem value="5">5 seconds</SelectItem>
                      <SelectItem value="7">7 seconds</SelectItem>
                      <SelectItem value="10">10 seconds</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Pauses on hover
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Image List - Content */}
      {showContent && (
        <>
          {images.length === 0 && (
            <div className="text-center text-muted-foreground py-8 border-2 border-dashed rounded-lg">
              No images yet. Add your first image below.
            </div>
          )}

          {images.map((image, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Image {index + 1}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => handleRemoveImage(index)}
                  disabled={disabled}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Remove image</span>
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Image</Label>
                <ImageUpload
                  value={image.src}
                  onChange={(url) => handleImageChange(index, "src", url)}
                  siteId={siteId}
                  disabled={disabled}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor={`gallery-${index}-alt`}>Alt Text</Label>
                  <Input
                    id={`gallery-${index}-alt`}
                    value={image.alt}
                    onChange={(e) => handleImageChange(index, "alt", e.target.value)}
                    placeholder="Image description"
                    disabled={disabled}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`gallery-${index}-caption`}>Caption (optional)</Label>
                  <Input
                    id={`gallery-${index}-caption`}
                    value={image.caption ?? ""}
                    onChange={(e) => handleImageChange(index, "caption", e.target.value)}
                    placeholder="Add a caption"
                    disabled={disabled}
                  />
                </div>
              </div>
            </div>
          ))}

          <Button
            variant="outline"
            className="w-full"
            onClick={handleAddImage}
            disabled={disabled}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Image
          </Button>
        </>
      )}
    </div>
  );
}
