"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CTAContent } from "@/lib/section-types";

interface CTAEditorProps {
  content: CTAContent;
  onChange: (content: CTAContent) => void;
  disabled?: boolean;
}

export function CTAEditor({ content, onChange, disabled }: CTAEditorProps) {
  const handleChange = (field: keyof CTAContent, value: string): void => {
    onChange({ ...content, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="cta-heading">Heading</Label>
        <Input
          id="cta-heading"
          value={content.heading}
          onChange={(e) => handleChange("heading", e.target.value)}
          placeholder="Ready to get started?"
          disabled={disabled}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cta-description">Description</Label>
        <Textarea
          id="cta-description"
          value={content.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Compelling reason to take action"
          rows={3}
          disabled={disabled}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cta-button-text">Button Text</Label>
          <Input
            id="cta-button-text"
            value={content.buttonText}
            onChange={(e) => handleChange("buttonText", e.target.value)}
            placeholder="Sign Up Now"
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cta-button-url">Button URL</Label>
          <Input
            id="cta-button-url"
            value={content.buttonUrl}
            onChange={(e) => handleChange("buttonUrl", e.target.value)}
            placeholder="#"
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
}
