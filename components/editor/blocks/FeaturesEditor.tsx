"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, ChevronDown, Palette } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
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
import { IconPicker } from "@/components/editor/IconPicker";
import { ImageUpload } from "@/components/editor/ImageUpload";
import type {
  FeaturesContent,
  Feature,
  TextBorderWidth,
  TextBorderRadius,
  TextSize,
  TextColorMode,
} from "@/lib/section-types";

interface FeaturesEditorProps {
  content: FeaturesContent;
  onChange: (content: FeaturesContent) => void;
  disabled?: boolean;
  siteId: string;
}

const DEFAULT_FEATURE: Feature = {
  icon: "star",
  title: "New Feature",
  description: "Describe this feature",
};

export function FeaturesEditor({
  content,
  onChange,
  disabled,
  siteId,
}: FeaturesEditorProps) {
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

  const handleFeatureChange = (
    index: number,
    field: keyof Feature,
    value: string
  ): void => {
    const newFeatures = [...content.features];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    onChange({ ...content, features: newFeatures });
  };

  const handleAddFeature = (): void => {
    onChange({
      ...content,
      features: [...content.features, { ...DEFAULT_FEATURE }],
    });
  };

  const handleRemoveFeature = (index: number): void => {
    const newFeatures = content.features.filter((_, i) => i !== index);
    onChange({ ...content, features: newFeatures });
  };

  const updateField = <K extends keyof FeaturesContent>(
    field: K,
    value: FeaturesContent[K]
  ): void => {
    onChange({ ...content, [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="section-title">Section Title (optional)</Label>
          <Input
            id="section-title"
            value={content.sectionTitle || ""}
            onChange={(e) => updateField("sectionTitle", e.target.value)}
            placeholder="Our Features"
            disabled={disabled}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="section-subtitle">Section Subtitle (optional)</Label>
          <Textarea
            id="section-subtitle"
            value={content.sectionSubtitle || ""}
            onChange={(e) => updateField("sectionSubtitle", e.target.value)}
            placeholder="A brief description of what makes us special"
            rows={2}
            disabled={disabled}
          />
        </div>
      </div>

      {/* Feature List */}
      {content.features.map((feature, index) => (
        <div key={index} className="border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Feature {index + 1}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => handleRemoveFeature(index)}
              disabled={disabled || content.features.length <= 1}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Remove feature</span>
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Icon</Label>
              <IconPicker
                value={feature.icon}
                onChange={(icon) => handleFeatureChange(index, "icon", icon)}
                disabled={disabled}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`feature-${index}-title`}>Title</Label>
              <Input
                id={`feature-${index}-title`}
                value={feature.title}
                onChange={(e) =>
                  handleFeatureChange(index, "title", e.target.value)
                }
                placeholder="Feature title"
                disabled={disabled}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`feature-${index}-subtitle`}>Subtitle (optional)</Label>
            <Input
              id={`feature-${index}-subtitle`}
              value={feature.subtitle || ""}
              onChange={(e) =>
                handleFeatureChange(index, "subtitle", e.target.value)
              }
              placeholder="A short tagline"
              disabled={disabled}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`feature-${index}-description`}>Description</Label>
            <Textarea
              id={`feature-${index}-description`}
              value={feature.description}
              onChange={(e) =>
                handleFeatureChange(index, "description", e.target.value)
              }
              placeholder="Describe this feature"
              rows={2}
              disabled={disabled}
            />
          </div>

          {/* Optional Button */}
          <div className="space-y-3 pt-2 border-t">
            <div className="flex items-center justify-between">
              <Label htmlFor={`feature-${index}-show-button`}>Show Button</Label>
              <Switch
                id={`feature-${index}-show-button`}
                checked={feature.showButton ?? false}
                onCheckedChange={(checked) => {
                  const newFeatures = [...content.features];
                  newFeatures[index] = { ...newFeatures[index], showButton: checked };
                  onChange({ ...content, features: newFeatures });
                }}
                disabled={disabled}
              />
            </div>

            {feature.showButton && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor={`feature-${index}-button-text`}>Button Text</Label>
                  <Input
                    id={`feature-${index}-button-text`}
                    value={feature.buttonText || ""}
                    onChange={(e) =>
                      handleFeatureChange(index, "buttonText", e.target.value)
                    }
                    placeholder="Learn More"
                    disabled={disabled}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`feature-${index}-button-url`}>Button URL</Label>
                  <Input
                    id={`feature-${index}-button-url`}
                    value={feature.buttonUrl || ""}
                    onChange={(e) =>
                      handleFeatureChange(index, "buttonUrl", e.target.value)
                    }
                    placeholder="/blog/my-post"
                    disabled={disabled}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      ))}

      <Button
        variant="outline"
        className="w-full"
        onClick={handleAddFeature}
        disabled={disabled}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Feature
      </Button>

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

            {/* Card Background Controls */}
            <div className="space-y-4 rounded-lg border p-4">
              <Label className="text-xs uppercase text-muted-foreground tracking-wide">
                Feature Cards
              </Label>

              <div className="flex items-center justify-between">
                <Label htmlFor="show-card-bg">Show Card Background</Label>
                <Switch
                  id="show-card-bg"
                  checked={content.showCardBackground ?? true}
                  onCheckedChange={(checked) =>
                    updateField("showCardBackground", checked)
                  }
                  disabled={disabled}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {content.showCardBackground ?? true
                  ? "Cards have solid backgrounds (text uses theme colors)"
                  : "Cards are transparent (text adapts to section background)"}
              </p>

              {(content.showCardBackground ?? true) && (
                <div className="space-y-2">
                  <Label>Card Background Color</Label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={content.cardBackgroundColor || "#FFFFFF"}
                      onChange={(e) =>
                        updateField("cardBackgroundColor", e.target.value)
                      }
                      disabled={disabled}
                      className="h-10 w-14 rounded border cursor-pointer disabled:opacity-50"
                    />
                    <span className="text-sm text-muted-foreground">
                      {content.cardBackgroundColor || "Using theme card style"}
                    </span>
                    {content.cardBackgroundColor && (
                      <button
                        type="button"
                        onClick={() => updateField("cardBackgroundColor", "")}
                        className="text-xs text-muted-foreground hover:text-foreground underline"
                        disabled={disabled}
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              )}
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
                  Scales feature titles and descriptions proportionally.
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
