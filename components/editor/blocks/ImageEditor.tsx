"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/editor/ImageUpload";
import type { ImageContent } from "@/lib/section-types";

interface ImageEditorProps {
  content: ImageContent;
  onChange: (content: ImageContent) => void;
  disabled?: boolean;
  siteId: string;
}

export function ImageEditor({
  content,
  onChange,
  disabled,
  siteId,
}: ImageEditorProps) {
  const handleChange = (field: keyof ImageContent, value: string): void => {
    onChange({ ...content, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Image</Label>
        <ImageUpload
          value={content.src}
          onChange={(url) => handleChange("src", url)}
          siteId={siteId}
          disabled={disabled}
        />
      </div>

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
