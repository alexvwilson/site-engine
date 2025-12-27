"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/editor/ImageUpload";
import type { HeroContent } from "@/lib/section-types";

interface HeroEditorProps {
  content: HeroContent;
  onChange: (content: HeroContent) => void;
  disabled?: boolean;
  siteId: string;
}

export function HeroEditor({
  content,
  onChange,
  disabled,
  siteId,
}: HeroEditorProps) {
  const handleChange = (field: keyof HeroContent, value: string): void => {
    onChange({ ...content, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="hero-heading">Heading</Label>
        <Input
          id="hero-heading"
          value={content.heading}
          onChange={(e) => handleChange("heading", e.target.value)}
          placeholder="Enter your main heading"
          disabled={disabled}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="hero-subheading">Subheading</Label>
        <Textarea
          id="hero-subheading"
          value={content.subheading}
          onChange={(e) => handleChange("subheading", e.target.value)}
          placeholder="Enter a supporting subheading"
          rows={2}
          disabled={disabled}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="hero-cta-text">Button Text</Label>
          <Input
            id="hero-cta-text"
            value={content.ctaText}
            onChange={(e) => handleChange("ctaText", e.target.value)}
            placeholder="Get Started"
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="hero-cta-url">Button URL</Label>
          <Input
            id="hero-cta-url"
            value={content.ctaUrl}
            onChange={(e) => handleChange("ctaUrl", e.target.value)}
            placeholder="#"
            disabled={disabled}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Background Image (optional)</Label>
        <ImageUpload
          value={content.backgroundImage ?? ""}
          onChange={(url) => handleChange("backgroundImage", url)}
          siteId={siteId}
          disabled={disabled}
          placeholder="Drag & drop a background image"
        />
      </div>
    </div>
  );
}
