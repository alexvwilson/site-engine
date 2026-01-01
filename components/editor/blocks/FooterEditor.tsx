"use client";

import { useState } from "react";
import { Plus, Trash2, ChevronDown, Palette } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { OverrideField } from "@/components/editor/OverrideField";
import { ImageUpload } from "@/components/editor/ImageUpload";
import { cn } from "@/lib/utils";
import type {
  FooterContent,
  FooterLayout,
  FooterLink,
  HeaderFooterBorderWidth,
  TextColorMode,
  TextSize,
} from "@/lib/section-types";

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
  siteId,
  mode = "site",
}: FooterEditorProps) {
  const [stylingOpen, setStylingOpen] = useState(false);

  const handleCopyrightChange = (value: string): void => {
    onChange({ ...content, copyright: value });
  };

  const updateField = <K extends keyof FooterContent>(
    field: K,
    value: FooterContent[K]
  ): void => {
    onChange({ ...content, [field]: value });
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

        {/* Override: Styling */}
        <OverrideField
          id="override-footer-styling"
          label="Footer Styling"
          description="Use different styling on this page"
          enabled={content.overrideStyling ?? false}
          onEnabledChange={(enabled) =>
            onChange({ ...content, overrideStyling: enabled })
          }
          disabled={disabled}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Enable Styling</Label>
              <Switch
                checked={content.enableStyling ?? false}
                onCheckedChange={(checked) => updateField("enableStyling", checked)}
                disabled={disabled}
              />
            </div>

            {content.enableStyling && (
              <>
                {/* Background Image */}
                <div className="space-y-2">
                  <Label className="text-xs">Background Image</Label>
                  <ImageUpload
                    value={content.backgroundImage || ""}
                    onChange={(url) => updateField("backgroundImage", url)}
                    siteId={siteId}
                    disabled={disabled}
                  />
                </div>

                {/* Overlay Controls */}
                {content.backgroundImage && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Overlay Color</Label>
                      <Input
                        type="color"
                        value={content.overlayColor || "#000000"}
                        onChange={(e) => updateField("overlayColor", e.target.value)}
                        disabled={disabled}
                        className="h-10 p-1"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Overlay ({content.overlayOpacity ?? 50}%)</Label>
                      <Slider
                        min={0}
                        max={100}
                        value={[content.overlayOpacity ?? 50]}
                        onValueChange={([v]) => updateField("overlayOpacity", v)}
                        disabled={disabled}
                      />
                    </div>
                  </div>
                )}

                {/* Border Controls */}
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Show Top Border</Label>
                  <Switch
                    checked={content.showBorder ?? false}
                    onCheckedChange={(checked) => updateField("showBorder", checked)}
                    disabled={disabled}
                  />
                </div>

                {content.showBorder && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Border Width</Label>
                      <Select
                        value={content.borderWidth ?? "thin"}
                        onValueChange={(v) => updateField("borderWidth", v as HeaderFooterBorderWidth)}
                        disabled={disabled}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="thin">Thin (1px)</SelectItem>
                          <SelectItem value="medium">Medium (2px)</SelectItem>
                          <SelectItem value="thick">Thick (4px)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Border Color</Label>
                      <Input
                        type="color"
                        value={content.borderColor || "#e5e7eb"}
                        onChange={(e) => updateField("borderColor", e.target.value)}
                        disabled={disabled}
                        className="h-10 p-1"
                      />
                    </div>
                  </div>
                )}

                {/* Text Color Mode */}
                <div className="space-y-2">
                  <Label className="text-xs">Text Color Mode</Label>
                  <Select
                    value={content.textColorMode ?? "auto"}
                    onValueChange={(v) => updateField("textColorMode", v as TextColorMode)}
                    disabled={disabled}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto (from theme)</SelectItem>
                      <SelectItem value="light">Light text</SelectItem>
                      <SelectItem value="dark">Dark text</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
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

      {/* Styling Section */}
      <Collapsible open={stylingOpen} onOpenChange={setStylingOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between p-0 h-auto hover:bg-transparent"
          >
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              <span className="font-medium">Styling</span>
            </div>
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                stylingOpen && "rotate-180"
              )}
            />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4 space-y-4">
          {/* Border Controls - Always visible */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Top Border</Label>
              <p className="text-xs text-muted-foreground">
                Full-width border at top of footer
              </p>
            </div>
            <Switch
              checked={content.showBorder ?? false}
              onCheckedChange={(checked) => updateField("showBorder", checked)}
              disabled={disabled}
            />
          </div>

          {content.showBorder && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Border Width</Label>
                <Select
                  value={content.borderWidth ?? "thin"}
                  onValueChange={(v) => updateField("borderWidth", v as HeaderFooterBorderWidth)}
                  disabled={disabled}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="thin">Thin (1px)</SelectItem>
                    <SelectItem value="medium">Medium (2px)</SelectItem>
                    <SelectItem value="thick">Thick (4px)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Border Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={content.borderColor || "#8b5cf6"}
                    onChange={(e) => updateField("borderColor", e.target.value)}
                    disabled={disabled}
                    className="h-10 w-16 p-1"
                  />
                  <Input
                    type="text"
                    value={content.borderColor || ""}
                    onChange={(e) => updateField("borderColor", e.target.value)}
                    placeholder="Theme primary"
                    disabled={disabled}
                    className="flex-1"
                  />
                  {content.borderColor && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateField("borderColor", "")}
                      disabled={disabled}
                    >
                      Reset
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Leave empty to use theme primary color
                </p>
              </div>
            </div>
          )}

          {/* Enable Advanced Styling Toggle */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="space-y-0.5">
              <Label>Enable Advanced Styling</Label>
              <p className="text-xs text-muted-foreground">
                Background color, images, and text customization
              </p>
            </div>
            <Switch
              checked={content.enableStyling ?? false}
              onCheckedChange={(checked) => updateField("enableStyling", checked)}
              disabled={disabled}
            />
          </div>

          {content.enableStyling && (
            <>
              {/* Background Color */}
              <div className="space-y-2">
                <Label>Background Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={content.backgroundColor || "#1a1a1a"}
                    onChange={(e) => updateField("backgroundColor", e.target.value)}
                    disabled={disabled}
                    className="h-10 w-16 p-1"
                  />
                  <Input
                    type="text"
                    value={content.backgroundColor || ""}
                    onChange={(e) => updateField("backgroundColor", e.target.value)}
                    placeholder="Default (dark)"
                    disabled={disabled}
                    className="flex-1"
                  />
                  {content.backgroundColor && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateField("backgroundColor", "")}
                      disabled={disabled}
                    >
                      Reset
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Leave empty to use default dark background
                </p>
              </div>

              {/* Background Image */}
              <div className="space-y-2">
                <Label>Background Image</Label>
                <ImageUpload
                  value={content.backgroundImage || ""}
                  onChange={(url) => updateField("backgroundImage", url)}
                  siteId={siteId}
                  disabled={disabled}
                />
              </div>

              {/* Overlay Color & Opacity - show when background color or image is set */}
              {(content.backgroundColor || content.backgroundImage) && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Overlay Color</Label>
                    <Input
                      type="color"
                      value={content.overlayColor || "#000000"}
                      onChange={(e) => updateField("overlayColor", e.target.value)}
                      disabled={disabled}
                      className="h-10 p-1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Overlay Opacity ({content.overlayOpacity ?? 50}%)</Label>
                    <Slider
                      min={0}
                      max={100}
                      value={[content.overlayOpacity ?? 50]}
                      onValueChange={([v]) => updateField("overlayOpacity", v)}
                      disabled={disabled}
                    />
                  </div>
                </div>
              )}

              {/* Text Color Mode */}
              <div className="space-y-2">
                <Label>Text Color Mode</Label>
                <Select
                  value={content.textColorMode ?? "auto"}
                  onValueChange={(v) => updateField("textColorMode", v as TextColorMode)}
                  disabled={disabled}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto (from theme)</SelectItem>
                    <SelectItem value="light">Light text</SelectItem>
                    <SelectItem value="dark">Dark text</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Text Size */}
              <div className="space-y-2">
                <Label>Text Size</Label>
                <Select
                  value={content.textSize ?? "normal"}
                  onValueChange={(v) => updateField("textSize", v as TextSize)}
                  disabled={disabled}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
