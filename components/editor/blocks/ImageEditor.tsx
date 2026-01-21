"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { ChevronDown, Palette } from "lucide-react";
import type {
  ImageContent,
  ImageWidth,
  ImageLayout,
  TextBorderWidth,
  TextBorderRadius,
  TextColorMode,
} from "@/lib/section-types";
import type { EditorMode } from "../inspector/EditorModeToggle";

// Dynamically import TiptapEditor to avoid SSR issues with ProseMirror
const TiptapEditor = dynamic(
  () =>
    import("@/components/editor/TiptapEditor").then((mod) => mod.TiptapEditor),
  {
    ssr: false,
    loading: () => (
      <div className="border rounded-md bg-muted/50 min-h-[150px]">
        <div className="h-10 border-b bg-muted/30" />
        <div className="p-3 text-muted-foreground text-sm">
          Loading editor...
        </div>
      </div>
    ),
  }
);

interface ImageEditorProps {
  content: ImageContent;
  onChange: (content: ImageContent) => void;
  disabled?: boolean;
  siteId: string;
  editorMode?: EditorMode;
}

export function ImageEditor({
  content,
  onChange,
  disabled,
  siteId,
  editorMode = "all",
}: ImageEditorProps) {
  const showContent = editorMode === "all" || editorMode === "content";
  const showLayout = editorMode === "all" || editorMode === "layout";

  const [stylingOpen, setStylingOpen] = useState(false);
  const [themePrimaryColor, setThemePrimaryColor] = useState("#3B82F6");

  // Read the theme primary color from CSS variables
  useEffect(() => {
    const root = document.documentElement;
    const primaryColor = getComputedStyle(root)
      .getPropertyValue("--color-primary")
      .trim();
    if (primaryColor) {
      setThemePrimaryColor(primaryColor);
    }
  }, []);

  // Check if current layout shows text
  const showsText = content.layout && content.layout !== "image-only";

  // Check if current layout is side-by-side (needs text width control)
  const isSideBySide = content.layout === "image-left" || content.layout === "image-right";

  // Calculate total width for side-by-side layouts
  const totalWidth = isSideBySide
    ? (content.imageWidth ?? 50) + (content.textWidth ?? 50)
    : 0;
  const exceedsMaxWidth = totalWidth > 100;

  const updateField = <K extends keyof ImageContent>(
    field: K,
    value: ImageContent[K]
  ): void => {
    onChange({ ...content, [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Content Section */}
      {showContent && (
        <>
          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Image</Label>
            <ImageUpload
              value={content.src}
              onChange={(url) => updateField("src", url)}
              siteId={siteId}
              disabled={disabled}
            />
          </div>

          {/* Alt Text */}
          <div className="space-y-2">
            <Label htmlFor="image-alt">Alt Text</Label>
            <Input
              id="image-alt"
              value={content.alt}
              onChange={(e) => updateField("alt", e.target.value)}
              placeholder="Describe the image for accessibility"
              disabled={disabled}
            />
          </div>

          {/* Caption */}
          <div className="space-y-2">
            <Label htmlFor="image-caption">Caption (optional)</Label>
            <Input
              id="image-caption"
              value={content.caption ?? ""}
              onChange={(e) => updateField("caption", e.target.value)}
              placeholder="Brief caption below the image"
              disabled={disabled}
            />
          </div>

          {/* Description - Only shown when layout includes text */}
          {showsText && (
            <div className="space-y-2">
              <Label>Description</Label>
              <TiptapEditor
                value={content.description ?? ""}
                onChange={(html) => updateField("description", html)}
                placeholder="Add a detailed description..."
                disabled={disabled}
              />
            </div>
          )}
        </>
      )}

      {/* Layout Section */}
      {showLayout && (
        <>
          {/* Image Width */}
          <div className="space-y-2">
            <Label>Image Width</Label>
            <Select
              value={String(content.imageWidth ?? 50)}
              onValueChange={(v) => updateField("imageWidth", Number(v) as ImageWidth)}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10% - Very Small</SelectItem>
                <SelectItem value="25">25% - Small</SelectItem>
                <SelectItem value="50">50% - Medium</SelectItem>
                <SelectItem value="75">75% - Large</SelectItem>
                <SelectItem value="100">100% - Full Width</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Controls the width of the image section relative to the page.
            </p>
          </div>

          {/* Layout */}
          <div className="space-y-2">
            <Label>Layout</Label>
            <Select
              value={content.layout ?? "image-only"}
              onValueChange={(v) => updateField("layout", v as ImageLayout)}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="image-only">Image Only</SelectItem>
                <SelectItem value="image-left">Image Left + Text Right</SelectItem>
                <SelectItem value="image-right">Image Right + Text Left</SelectItem>
                <SelectItem value="image-top">Image Top + Text Below</SelectItem>
                <SelectItem value="image-bottom">Text Top + Image Below</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Text Width - Only for side-by-side layouts */}
          {isSideBySide && (
            <div className="space-y-2">
              <Label>Text Width</Label>
              <Select
                value={String(content.textWidth ?? 50)}
                onValueChange={(v) => updateField("textWidth", Number(v) as ImageWidth)}
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10% - Very Small</SelectItem>
                  <SelectItem value="25">25% - Small</SelectItem>
                  <SelectItem value="50">50% - Medium</SelectItem>
                  <SelectItem value="75">75% - Large</SelectItem>
                  <SelectItem value="100">100% - Full Width</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Image ({content.imageWidth ?? 50}%) + Text ({content.textWidth ?? 50}%) = {totalWidth}%
              </p>
              {exceedsMaxWidth && (
                <p className="text-xs text-destructive">
                  Warning: Total exceeds 100%. Content may wrap or overflow.
                </p>
              )}
            </div>
          )}
        </>
      )}

      {/* Styling Section (Collapsible with Enable Toggle) - Layout */}
      {showLayout && (
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
                  onCheckedChange={(checked) => updateField("showBorder", checked)}
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
                        onChange={(e) => updateField("borderColor", e.target.value)}
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
                    onChange={(e) => updateField("overlayColor", e.target.value)}
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

            {/* Typography Controls (only when layout shows text) */}
            {showsText && (
              <div className="space-y-4 rounded-lg border p-4">
                <Label className="text-xs uppercase text-muted-foreground tracking-wide">
                  Typography
                </Label>

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
            )}
          </CollapsibleContent>
        </Collapsible>
      </div>
      )}
    </div>
  );
}
