"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { HeroContent } from "@/lib/section-types";

interface HeroEditorProps {
  content: HeroContent;
  onChange: (content: HeroContent) => void;
  disabled?: boolean;
}

export function HeroEditor({ content, onChange, disabled }: HeroEditorProps) {
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
        <Label htmlFor="hero-bg-image">Background Image URL (optional)</Label>
        <Input
          id="hero-bg-image"
          value={content.backgroundImage ?? ""}
          onChange={(e) => handleChange("backgroundImage", e.target.value)}
          placeholder="https://example.com/image.jpg"
          disabled={disabled}
        />
        <p className="text-xs text-muted-foreground">
          Image upload will be available in a future update
        </p>
      </div>
    </div>
  );
}
