"use client";

import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/editor/ImageUpload";
import type { GalleryContent, GalleryImage } from "@/lib/section-types";

interface GalleryEditorProps {
  content: GalleryContent;
  onChange: (content: GalleryContent) => void;
  disabled?: boolean;
  siteId: string;
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
}: GalleryEditorProps) {
  const handleImageChange = (
    index: number,
    field: keyof GalleryImage,
    value: string
  ): void => {
    const newImages = [...content.images];
    newImages[index] = { ...newImages[index], [field]: value };
    onChange({ ...content, images: newImages });
  };

  const handleAddImage = (): void => {
    onChange({
      ...content,
      images: [...content.images, { ...DEFAULT_IMAGE }],
    });
  };

  const handleRemoveImage = (index: number): void => {
    const newImages = content.images.filter((_, i) => i !== index);
    onChange({ ...content, images: newImages });
  };

  return (
    <div className="space-y-6">
      {content.images.length === 0 && (
        <div className="text-center text-muted-foreground py-8 border-2 border-dashed rounded-lg">
          No images yet. Add your first image below.
        </div>
      )}

      {content.images.map((image, index) => (
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
    </div>
  );
}
