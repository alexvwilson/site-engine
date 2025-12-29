"use client";

import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OverrideField } from "@/components/editor/OverrideField";
import type { FooterContent, FooterLayout, FooterLink } from "@/lib/section-types";

interface FooterEditorProps {
  content: FooterContent;
  onChange: (content: FooterContent) => void;
  disabled?: boolean;
  siteId: string;
  /** Mode determines which controls are shown:
   * - "site": Full editing (for SettingsTab)
   * - "page": Override-only controls (for page sections)
   */
  mode?: "site" | "page";
}

const DEFAULT_LINK: FooterLink = {
  label: "New Link",
  url: "#",
};

export function FooterEditor({
  content,
  onChange,
  disabled,
  mode = "site",
}: FooterEditorProps) {
  const handleCopyrightChange = (value: string): void => {
    onChange({ ...content, copyright: value });
  };

  const handleLinkChange = (
    index: number,
    field: keyof FooterLink,
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

  // Page mode: Show override controls only
  if (mode === "page") {
    return (
      <div className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Footer content (copyright, links) is managed in Site Settings.
          Enable overrides below to customize styling for this page only.
        </p>

        {/* Override: Layout */}
        <OverrideField
          id="override-footer-layout"
          label="Layout"
          description="Use a different footer layout on this page"
          enabled={content.overrideLayout ?? false}
          onEnabledChange={(enabled) =>
            onChange({ ...content, overrideLayout: enabled })
          }
          disabled={disabled}
        >
          <Select
            value={content.layout ?? "simple"}
            onValueChange={(value) =>
              onChange({ ...content, layout: value as FooterLayout })
            }
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="simple">Simple - Single row layout</SelectItem>
              <SelectItem value="columns">Columns - Multi-column links</SelectItem>
              <SelectItem value="minimal">Minimal - Copyright only</SelectItem>
            </SelectContent>
          </Select>
        </OverrideField>
      </div>
    );
  }

  // Site mode: Full editing interface
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="footer-copyright">Copyright Text</Label>
        <Input
          id="footer-copyright"
          value={content.copyright}
          onChange={(e) => handleCopyrightChange(e.target.value)}
          placeholder="© 2025 Your Company. All rights reserved."
          disabled={disabled}
        />
      </div>

      <div className="space-y-4">
        <Label>Footer Links</Label>
        {content.links.map((link, index) => (
          <div key={index} className="flex items-end gap-3">
            <div className="flex-1 space-y-2">
              <Label htmlFor={`link-${index}-label`} className="text-xs text-muted-foreground">
                Label
              </Label>
              <Input
                id={`link-${index}-label`}
                value={link.label}
                onChange={(e) => handleLinkChange(index, "label", e.target.value)}
                placeholder="Link text"
                disabled={disabled}
              />
            </div>

            <div className="flex-1 space-y-2">
              <Label htmlFor={`link-${index}-url`} className="text-xs text-muted-foreground">
                URL
              </Label>
              <Input
                id={`link-${index}-url`}
                value={link.url}
                onChange={(e) => handleLinkChange(index, "url", e.target.value)}
                placeholder="/privacy"
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
          Add Link
        </Button>
      </div>

      {/* Footer Styling Options */}
      <div className="space-y-4 pt-4 border-t">
        <Label className="text-sm font-medium">Footer Style</Label>

        <div className="space-y-2">
          <Label htmlFor="footer-layout">Layout</Label>
          <Select
            value={content.layout ?? "simple"}
            onValueChange={(value) => onChange({ ...content, layout: value as FooterLayout })}
            disabled={disabled}
          >
            <SelectTrigger id="footer-layout">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="simple">Simple - Single row layout</SelectItem>
              <SelectItem value="columns">Columns - Multi-column links</SelectItem>
              <SelectItem value="minimal">Minimal - Copyright only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
