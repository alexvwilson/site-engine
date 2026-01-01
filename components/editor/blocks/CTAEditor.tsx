"use client";

import { useState, useEffect } from "react";
import { ChevronDown, Palette } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ImageUpload } from "@/components/editor/ImageUpload";
import type {
  CTAContent,
  TextBorderWidth,
  TextBorderRadius,
  TextSize,
  TextColorMode,
} from "@/lib/section-types";

interface CTAEditorProps {
  content: CTAContent;
  onChange: (content: CTAContent) => void;
  disabled?: boolean;
  siteId: string;
}

export function CTAEditor({
  content,
  onChange,
  disabled,
  siteId,
}: CTAEditorProps) {
  const [stylingOpen, setStylingOpen] = useState(false);
  const [themePrimaryColor, setThemePrimaryColor] = useState("#3B82F6");

  useEffect(() => {
    const root = document.documentElement;
    const primaryColor = getComputedStyle(root)
      .getPropertyValue("--color-primary")
      .trim();
    if (primaryColor) {
      setThemePrimaryColor(primaryColor);
    }
  }, []);

  const handleChange = (field: keyof CTAContent, value: string): void => {
    onChange({ ...content, [field]: value });
  };

  const updateField = <K extends keyof CTAContent>(
    field: K,
    value: CTAContent[K]
  ): void => {
    onChange({ ...content, [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Content Section */}
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

      {/* Styling Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Collapsible
            open={stylingOpen}
            onOpenChange={setStylingOpen}
            className="flex-1"
          >
            <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
              <Palette className="h-4 w-4" />
              Styling
              <ChevronDown
                className={`h-4 w-4 transition-transform ${stylingOpen ? "rotate-180" : ""}`}
              />
            </CollapsibleTrigger>
          </Collapsible>
          <div className="flex items-center gap-2">
            <Label
              htmlFor="enable-styling"
              className="text-sm text-muted-foreground"
            >
              {content.enableStyling ?? false ? "On" : "Off"}
            </Label>
            <Switch
              id="enable-styling"
              checked={content.enableStyling ?? false}
              onCheckedChange={(checked) => {
                updateField("enableStyling", checked);
                if (checked && !stylingOpen) {
                  setStylingOpen(true);
                }
              }}
              disabled={disabled}
            />
          </div>
        </div>

        <Collapsible open={stylingOpen} onOpenChange={setStylingOpen}>
          <CollapsibleContent className="space-y-6">
            {/* Border Controls */}
            <div className="space-y-4 rounded-lg border p-4">
              <Label className="text-xs uppercase text-muted-foreground tracking-wide">
                Border
              </Label>

              <div className="flex items-center justify-between">
                <Label htmlFor="show-border">Show Border</Label>
                <Switch
                  id="show-border"
                  checked={content.showBorder ?? false}
                  onCheckedChange={(checked) =>
                    updateField("showBorder", checked)
                  }
                  disabled={disabled}
                />
              </div>

              {content.showBorder && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Width</Label>
                      <Select
                        value={content.borderWidth ?? "medium"}
                        onValueChange={(v) =>
                          updateField("borderWidth", v as TextBorderWidth)
                        }
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
                      <Label>Corners</Label>
                      <Select
                        value={content.borderRadius ?? "medium"}
                        onValueChange={(v) =>
                          updateField("borderRadius", v as TextBorderRadius)
                        }
                        disabled={disabled}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Square</SelectItem>
                          <SelectItem value="small">Small</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="large">Large</SelectItem>
                          <SelectItem value="full">Pill</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Border Color</Label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={content.borderColor || themePrimaryColor}
                        onChange={(e) =>
                          updateField("borderColor", e.target.value)
                        }
                        disabled={disabled}
                        className="h-10 w-14 rounded border cursor-pointer disabled:opacity-50"
                      />
                      <span className="text-sm text-muted-foreground">
                        {content.borderColor || "Using theme primary"}
                      </span>
                      {content.borderColor && (
                        <button
                          type="button"
                          onClick={() => updateField("borderColor", "")}
                          className="text-xs text-muted-foreground hover:text-foreground underline"
                          disabled={disabled}
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label>Box Background</Label>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="use-theme-bg" className="font-normal">
                        Use Theme Background
                      </Label>
                      <Switch
                        id="use-theme-bg"
                        checked={content.useThemeBackground ?? true}
                        onCheckedChange={(checked) => {
                          updateField("useThemeBackground", checked);
                          if (checked) {
                            updateField("boxBackgroundColor", "");
                          }
                        }}
                        disabled={disabled}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {content.useThemeBackground ?? true
                        ? "Automatically adapts to light/dark mode"
                        : "Use a custom fixed color"}
                    </p>

                    {!(content.useThemeBackground ?? true) && (
                      <div className="space-y-2">
                        <Label>Custom Color</Label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={content.boxBackgroundColor || "#FFFFFF"}
                            onChange={(e) =>
                              updateField("boxBackgroundColor", e.target.value)
                            }
                            disabled={disabled}
                            className="h-10 w-14 rounded border cursor-pointer disabled:opacity-50"
                          />
                          <span className="text-sm text-muted-foreground">
                            {content.boxBackgroundColor || "#FFFFFF"}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Background Opacity</Label>
                        <span className="text-sm text-muted-foreground">
                          {content.boxBackgroundOpacity ?? 100}%
                        </span>
                      </div>
                      <Slider
                        value={[content.boxBackgroundOpacity ?? 100]}
                        onValueChange={([v]) =>
                          updateField("boxBackgroundOpacity", v)
                        }
                        min={0}
                        max={100}
                        step={5}
                        disabled={
                          disabled || (content.useThemeBackground ?? true)
                        }
                      />
                      {(content.useThemeBackground ?? true) && (
                        <p className="text-xs text-muted-foreground">
                          Opacity requires a custom color (theme backgrounds
                          don&apos;t support transparency)
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Background & Overlay Controls */}
            <div className="space-y-4 rounded-lg border p-4">
              <Label className="text-xs uppercase text-muted-foreground tracking-wide">
                Background
              </Label>

              <div className="space-y-2">
                <Label>Background Image</Label>
                <ImageUpload
                  value={content.backgroundImage || ""}
                  onChange={(url) => updateField("backgroundImage", url)}
                  siteId={siteId}
                  disabled={disabled}
                />
              </div>

              <div className="space-y-2">
                <Label>Overlay Color</Label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={content.overlayColor || "#000000"}
                    onChange={(e) =>
                      updateField("overlayColor", e.target.value)
                    }
                    disabled={disabled}
                    className="h-10 w-14 rounded border cursor-pointer disabled:opacity-50"
                  />
                  <span className="text-sm text-muted-foreground">
                    {content.overlayColor || "#000000"}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Overlay Opacity</Label>
                  <span className="text-sm text-muted-foreground">
                    {content.overlayOpacity ?? 0}%
                  </span>
                </div>
                <Slider
                  value={[content.overlayOpacity ?? 0]}
                  onValueChange={([v]) => updateField("overlayOpacity", v)}
                  min={0}
                  max={100}
                  step={5}
                  disabled={disabled}
                />
                <p className="text-xs text-muted-foreground">
                  {content.backgroundImage
                    ? "Overlay tints the background image"
                    : "Acts as a solid background color when no image is set"}
                </p>
              </div>
            </div>

            {/* Typography Controls */}
            <div className="space-y-4 rounded-lg border p-4">
              <Label className="text-xs uppercase text-muted-foreground tracking-wide">
                Typography
              </Label>

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
                <p className="text-xs text-muted-foreground">
                  Scales heading and description proportionally.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Text Color</Label>
                <Select
                  value={content.textColorMode ?? "auto"}
                  onValueChange={(v) =>
                    updateField("textColorMode", v as TextColorMode)
                  }
                  disabled={disabled}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">
                      Auto (detect from background)
                    </SelectItem>
                    <SelectItem value="light">Light (white text)</SelectItem>
                    <SelectItem value="dark">Dark (black text)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Auto uses light text when a background image is set.
                </p>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}
