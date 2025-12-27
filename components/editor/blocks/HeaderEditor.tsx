"use client";

import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/editor/ImageUpload";
import type { HeaderContent, NavLink } from "@/lib/section-types";

interface HeaderEditorProps {
  content: HeaderContent;
  onChange: (content: HeaderContent) => void;
  disabled?: boolean;
  siteId: string;
}

const DEFAULT_LINK: NavLink = {
  label: "New Link",
  url: "#",
};

export function HeaderEditor({
  content,
  onChange,
  disabled,
  siteId,
}: HeaderEditorProps) {
  const handleFieldChange = (field: keyof HeaderContent, value: string): void => {
    onChange({ ...content, [field]: value });
  };

  const handleLinkChange = (
    index: number,
    field: keyof NavLink,
    value: string
  ): void => {
    const newLinks = [...content.links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    onChange({ ...content, links: newLinks });
  };

  const handleAddLink = (): void => {
    onChange({
      ...content,
      links: [...content.links, { ...DEFAULT_LINK }],
    });
  };

  const handleRemoveLink = (index: number): void => {
    const newLinks = content.links.filter((_, i) => i !== index);
    onChange({ ...content, links: newLinks });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="header-siteName">Site Name</Label>
        <Input
          id="header-siteName"
          value={content.siteName}
          onChange={(e) => handleFieldChange("siteName", e.target.value)}
          placeholder="Your Site Name"
          disabled={disabled}
        />
      </div>

      <div className="space-y-2">
        <Label>Logo (optional)</Label>
        <ImageUpload
          value={content.logoUrl || ""}
          onChange={(url) => handleFieldChange("logoUrl", url)}
          siteId={siteId}
          disabled={disabled}
          placeholder="Drag & drop your logo"
        />
      </div>

      <div className="space-y-4">
        <Label>Navigation Links</Label>
        {content.links.map((link, index) => (
          <div key={index} className="flex items-end gap-3">
            <div className="flex-1 space-y-2">
              <Label htmlFor={`nav-${index}-label`} className="text-xs text-muted-foreground">
                Label
              </Label>
              <Input
                id={`nav-${index}-label`}
                value={link.label}
                onChange={(e) => handleLinkChange(index, "label", e.target.value)}
                placeholder="Link text"
                disabled={disabled}
              />
            </div>

            <div className="flex-1 space-y-2">
              <Label htmlFor={`nav-${index}-url`} className="text-xs text-muted-foreground">
                URL
              </Label>
              <Input
                id={`nav-${index}-url`}
                value={link.url}
                onChange={(e) => handleLinkChange(index, "url", e.target.value)}
                placeholder="/about"
                disabled={disabled}
              />
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-muted-foreground hover:text-destructive flex-shrink-0"
              onClick={() => handleRemoveLink(index)}
              disabled={disabled}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Remove link</span>
            </Button>
          </div>
        ))}

        <Button
          variant="outline"
          className="w-full"
          onClick={handleAddLink}
          disabled={disabled}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Navigation Link
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="header-ctaText">CTA Button Text (optional)</Label>
          <Input
            id="header-ctaText"
            value={content.ctaText || ""}
            onChange={(e) => handleFieldChange("ctaText", e.target.value)}
            placeholder="Get Started"
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="header-ctaUrl">CTA Button URL</Label>
          <Input
            id="header-ctaUrl"
            value={content.ctaUrl || ""}
            onChange={(e) => handleFieldChange("ctaUrl", e.target.value)}
            placeholder="/signup"
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
}
