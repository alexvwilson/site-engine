"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ImageContent } from "@/lib/section-types";

interface ImageEditorProps {
  content: ImageContent;
  onChange: (content: ImageContent) => void;
  disabled?: boolean;
}

export function ImageEditor({ content, onChange, disabled }: ImageEditorProps) {
  const handleChange = (field: keyof ImageContent, value: string): void => {
    onChange({ ...content, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="image-src">Image URL</Label>
        <Input
          id="image-src"
          value={content.src}
          onChange={(e) => handleChange("src", e.target.value)}
          placeholder="https://example.com/image.jpg"
          disabled={disabled}
        />
        <p className="text-xs text-muted-foreground">
          Image upload will be available in a future update
        </p>
      </div>

      {content.src && (
        <div className="border rounded-lg p-2 bg-muted/50">
          <img
            src={content.src}
            alt={content.alt || "Preview"}
            className="max-h-48 mx-auto object-contain rounded"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="image-alt">Alt Text</Label>
        <Input
          id="image-alt"
          value={content.alt}
          onChange={(e) => handleChange("alt", e.target.value)}
          placeholder="Describe the image for accessibility"
          disabled={disabled}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="image-caption">Caption (optional)</Label>
        <Input
          id="image-caption"
          value={content.caption ?? ""}
          onChange={(e) => handleChange("caption", e.target.value)}
          placeholder="Add a caption"
          disabled={disabled}
        />
      </div>
    </div>
  );
}
