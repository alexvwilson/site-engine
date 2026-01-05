"use client";

import { useState, useEffect } from "react";
import { ChevronDown, Palette, Link as LinkIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
  SocialLinksContent,
  SocialIconStyle,
  SocialIconSize,
  TextBorderWidth,
  TextBorderRadius,
  TextColorMode,
} from "@/lib/section-types";

interface SocialLinksEditorProps {
  content: SocialLinksContent;
  onChange: (content: SocialLinksContent) => void;
  disabled?: boolean;
  siteId: string;
}

export function SocialLinksEditor({
  content: rawContent,
  onChange,
  disabled,
  siteId,
}: SocialLinksEditorProps) {
  // Ensure content has all required fields with defaults
  const content: SocialLinksContent = {
    title: "",
    subtitle: "",
    alignment: "center",
    size: "medium",
    enableStyling: false,
    textColorMode: "auto",
    showBorder: false,
    borderWidth: "medium",
    borderRadius: "medium",
    borderColor: "",
    boxBackgroundColor: "",
    boxBackgroundOpacity: 100,
    useThemeBackground: true,
    backgroundImage: "",
    overlayColor: "#000000",
    overlayOpacity: 0,
    ...rawContent,
  };

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

  const updateField = <K extends keyof SocialLinksContent>(
    field: K,
    value: SocialLinksContent[K]
  ): void => {
    onChange({ ...content, [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Info Section */}
      <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
        <LinkIcon className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
        <div className="text-sm text-muted-foreground">
          <p>
            This block displays your site&apos;s social links. Configure your social
            profiles in <strong>Site Settings</strong> to add or edit links.
          </p>
        </div>
      </div>

      {/* Title & Subtitle Section */}
      <div className="space-y-4">
        <Label className="text-xs uppercase text-muted-foreground tracking-wide">
          Content
        </Label>

        <div className="space-y-2">
          <Label htmlFor="title">Section Title</Label>
          <Input
            id="title"
            value={content.title ?? ""}
            onChange={(e) => updateField("title", e.target.value)}
            placeholder="e.g., Connect With Us"
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="subtitle">Subtitle</Label>
          <Textarea
            id="subtitle"
            value={content.subtitle ?? ""}
            onChange={(e) => updateField("subtitle", e.target.value)}
            placeholder="e.g., Follow us on social media for updates and news"
            rows={2}
            disabled={disabled}
          />
        </div>
      </div>

      {/* Layout Section */}
      <div className="space-y-4">
        <Label className="text-xs uppercase text-muted-foreground tracking-wide">
          Layout
        </Label>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Alignment</Label>
            <Select
              value={content.alignment ?? "center"}
              onValueChange={(v) =>
                updateField("alignment", v as "left" | "center" | "right")
              }
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Icon Size</Label>
            <Select
              value={content.size ?? "medium"}
              onValueChange={(v) => updateField("size", v as SocialIconSize)}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small (20px)</SelectItem>
                <SelectItem value="medium">Medium (24px)</SelectItem>
                <SelectItem value="large">Large (32px)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Icon Style</Label>
          <Select
            value={content.iconStyle ?? "site-default"}
            onValueChange={(v) =>
              updateField("iconStyle", v === "site-default" ? undefined : v as SocialIconStyle)
            }
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder="Use Site Default" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="site-default">Use Site Default</SelectItem>
              <SelectItem value="brand">Brand Colors</SelectItem>
              <SelectItem value="monochrome">Monochrome</SelectItem>
              <SelectItem value="primary">Theme Primary</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Override the site-level icon style for this block only.
          </p>
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

            {/* Text/Icon Color Mode */}
            <div className="space-y-4 rounded-lg border p-4">
              <Label className="text-xs uppercase text-muted-foreground tracking-wide">
                Icon Color
              </Label>

              <div className="space-y-2">
                <Label>Color Mode</Label>
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
                    <SelectItem value="light">Light (white icons)</SelectItem>
                    <SelectItem value="dark">Dark (dark icons)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  When set to light or dark, icons use monochrome style for consistency.
                </p>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}
