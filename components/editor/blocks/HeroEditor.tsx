"use client";

import dynamic from "next/dynamic";
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
import { ImageUpload } from "@/components/editor/ImageUpload";
import { Plus, Trash2 } from "lucide-react";
import type {
  HeroContent,
  HeroButton,
  HeroButtonVariant,
  RotatingTitleConfig,
  HeroAnimationEffect,
  HeroAnimationMode,
  HeroImageRounding,
  HeroImagePosition,
  HeroImageBorderWidth,
  HeroImageShadow,
  HeroImageMobileStack,
  HeroBodyTextAlignment,
} from "@/lib/section-types";
import { MAX_HERO_BUTTONS } from "@/lib/section-types";
import { Slider } from "@/components/ui/slider";

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

interface HeroEditorProps {
  content: HeroContent;
  onChange: (content: HeroContent) => void;
  disabled?: boolean;
  siteId: string;
}

const DEFAULT_ROTATING_CONFIG: RotatingTitleConfig = {
  beforeText: "We specialize in",
  words: ["Design", "Development", "Marketing"],
  afterText: "",
  effect: "clip",
  displayTime: 2000,
  animationMode: "loop",
};

// Generate a unique ID for new buttons
function generateButtonId(): string {
  return `btn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Migrate legacy single button to new buttons array format
function getButtons(content: HeroContent): HeroButton[] {
  // If buttons array exists, use it
  if (content.buttons && content.buttons.length > 0) {
    return content.buttons;
  }

  // Migrate from legacy showCta/ctaText/ctaUrl format
  if (content.showCta !== false && content.ctaText && content.ctaUrl) {
    return [
      {
        id: generateButtonId(),
        text: content.ctaText,
        url: content.ctaUrl,
        variant: "primary",
      },
    ];
  }

  // No buttons
  return [];
}

export function HeroEditor({
  content,
  onChange,
  disabled,
  siteId,
}: HeroEditorProps) {
  const isRotating = content.titleMode === "rotating";
  const rotatingConfig = content.rotatingTitle || DEFAULT_ROTATING_CONFIG;

  const handleChange = (field: keyof HeroContent, value: string): void => {
    onChange({ ...content, [field]: value });
  };

  const handleTitleModeToggle = (rotating: boolean): void => {
    onChange({
      ...content,
      titleMode: rotating ? "rotating" : "static",
      rotatingTitle: rotating
        ? content.rotatingTitle || DEFAULT_ROTATING_CONFIG
        : content.rotatingTitle,
    });
  };

  const handleRotatingChange = <K extends keyof RotatingTitleConfig>(
    field: K,
    value: RotatingTitleConfig[K]
  ): void => {
    onChange({
      ...content,
      rotatingTitle: {
        ...rotatingConfig,
        [field]: value,
      },
    });
  };

  const handleWordChange = (index: number, value: string): void => {
    const newWords = [...rotatingConfig.words];
    newWords[index] = value;
    handleRotatingChange("words", newWords);
  };

  const handleAddWord = (): void => {
    handleRotatingChange("words", [...rotatingConfig.words, ""]);
  };

  const handleRemoveWord = (index: number): void => {
    const newWords = rotatingConfig.words.filter((_, i) => i !== index);
    handleRotatingChange("words", newWords);
  };

  // Button management handlers
  const buttons = getButtons(content);

  const handleButtonsChange = (newButtons: HeroButton[]): void => {
    onChange({
      ...content,
      buttons: newButtons,
      // Clear legacy fields when using new buttons array
      showCta: undefined,
      ctaText: undefined,
      ctaUrl: undefined,
    });
  };

  const handleAddButton = (): void => {
    if (buttons.length >= MAX_HERO_BUTTONS) return;
    const newButton: HeroButton = {
      id: generateButtonId(),
      text: "",
      url: "#",
      variant: buttons.length === 0 ? "primary" : "secondary",
    };
    handleButtonsChange([...buttons, newButton]);
  };

  const handleRemoveButton = (id: string): void => {
    handleButtonsChange(buttons.filter((btn) => btn.id !== id));
  };

  const handleButtonChange = (
    id: string,
    field: keyof Omit<HeroButton, "id">,
    value: string
  ): void => {
    handleButtonsChange(
      buttons.map((btn) =>
        btn.id === id ? { ...btn, [field]: value } : btn
      )
    );
  };

  return (
    <div className="space-y-4">
      {/* Title Mode Toggle */}
      <div className="flex items-center justify-between rounded-lg border p-3">
        <div className="space-y-0.5">
          <Label>Rotating Title</Label>
          <p className="text-xs text-muted-foreground">
            Animate through multiple words with effects
          </p>
        </div>
        <Switch
          checked={isRotating}
          onCheckedChange={handleTitleModeToggle}
          disabled={disabled}
        />
      </div>

      {/* Static Heading - shown when not rotating */}
      {!isRotating && (
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
      )}

      {/* Rotating Title Config - shown when rotating */}
      {isRotating && (
        <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
          {/* Before Text */}
          <div className="space-y-2">
            <Label htmlFor="rotating-before">Before Text</Label>
            <Input
              id="rotating-before"
              value={rotatingConfig.beforeText}
              onChange={(e) =>
                handleRotatingChange("beforeText", e.target.value)
              }
              placeholder="Specialists in"
              disabled={disabled}
            />
          </div>

          {/* Rotation Words */}
          <div className="space-y-2">
            <Label>Rotation Words</Label>
            <div className="space-y-2">
              {rotatingConfig.words.map((word, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={word}
                    onChange={(e) => handleWordChange(index, e.target.value)}
                    placeholder={`Word ${index + 1}`}
                    disabled={disabled}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveWord(index)}
                    disabled={disabled || rotatingConfig.words.length <= 1}
                    className="shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddWord}
              disabled={disabled}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Word
            </Button>
          </div>

          {/* After Text */}
          <div className="space-y-2">
            <Label htmlFor="rotating-after">After Text (optional)</Label>
            <Input
              id="rotating-after"
              value={rotatingConfig.afterText || ""}
              onChange={(e) =>
                handleRotatingChange("afterText", e.target.value)
              }
              placeholder="services"
              disabled={disabled}
            />
          </div>

          {/* Effect & Display Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Effect</Label>
              <Select
                value={rotatingConfig.effect}
                onValueChange={(value: HeroAnimationEffect) =>
                  handleRotatingChange("effect", value)
                }
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clip">Clip (Reveal)</SelectItem>
                  <SelectItem value="typing">Typing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="display-time">Display Time (ms)</Label>
              <Input
                id="display-time"
                type="number"
                min={500}
                max={10000}
                step={100}
                value={rotatingConfig.displayTime}
                onChange={(e) =>
                  handleRotatingChange(
                    "displayTime",
                    Math.max(500, Math.min(10000, parseInt(e.target.value) || 2000))
                  )
                }
                disabled={disabled}
              />
            </div>
          </div>

          {/* Animation Mode */}
          <div className="space-y-2">
            <Label>Animation Mode</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={
                  rotatingConfig.animationMode === "loop" ? "default" : "outline"
                }
                size="sm"
                onClick={() =>
                  handleRotatingChange("animationMode", "loop" as HeroAnimationMode)
                }
                disabled={disabled}
              >
                Loop
              </Button>
              <Button
                type="button"
                variant={
                  rotatingConfig.animationMode === "once" ? "default" : "outline"
                }
                size="sm"
                onClick={() =>
                  handleRotatingChange("animationMode", "once" as HeroAnimationMode)
                }
                disabled={disabled}
              >
                Once
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Subheading */}
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

      {/* Hero Image (Profile/Feature Image) */}
      <div className="space-y-4 rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label>Profile / Feature Image</Label>
          <p className="text-xs text-muted-foreground">
            Add an image that appears alongside your hero content
          </p>
        </div>

        <ImageUpload
          value={content.image ?? ""}
          onChange={(url) => handleChange("image", url)}
          siteId={siteId}
          disabled={disabled}
          placeholder="Drag & drop a profile or feature image"
        />

        {content.image && (
          <div className="space-y-4">
            {/* Image Alt Text */}
            <div className="space-y-2">
              <Label htmlFor="hero-image-alt">Alt Text</Label>
              <Input
                id="hero-image-alt"
                value={content.imageAlt ?? ""}
                onChange={(e) => handleChange("imageAlt", e.target.value)}
                placeholder="Describe the image for accessibility"
                disabled={disabled}
              />
            </div>

            {/* Image Position */}
            <div className="space-y-2">
              <Label>Position</Label>
              <Select
                value={content.imagePosition ?? "top"}
                onValueChange={(value: HeroImagePosition) =>
                  onChange({ ...content, imagePosition: value })
                }
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="top">Above Text</SelectItem>
                  <SelectItem value="after-title">After Title</SelectItem>
                  <SelectItem value="bottom">Below Text</SelectItem>
                  <SelectItem value="left">Left of Text</SelectItem>
                  <SelectItem value="right">Right of Text</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Mobile Stacking - only for left/right positions */}
            {(content.imagePosition === "left" || content.imagePosition === "right") && (
              <div className="space-y-2">
                <Label>On Mobile</Label>
                <Select
                  value={content.imageMobileStack ?? "above"}
                  onValueChange={(value: HeroImageMobileStack) =>
                    onChange({ ...content, imageMobileStack: value })
                  }
                  disabled={disabled}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="above">Image Above Text</SelectItem>
                    <SelectItem value="below">Image Below Text</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  How the image stacks on small screens
                </p>
              </div>
            )}

            {/* Image Size */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Size</Label>
                <span className="text-xs text-muted-foreground">
                  {content.imageSize ?? 200}px
                </span>
              </div>
              <Slider
                value={[content.imageSize ?? 200]}
                onValueChange={([value]) =>
                  onChange({ ...content, imageSize: value })
                }
                min={80}
                max={400}
                step={10}
                disabled={disabled}
              />
            </div>

            {/* Image Rounding */}
            <div className="space-y-2">
              <Label>Rounding</Label>
              <Select
                value={content.imageRounding ?? "none"}
                onValueChange={(value: HeroImageRounding) =>
                  onChange({ ...content, imageRounding: value })
                }
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (Square)</SelectItem>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                  <SelectItem value="full">Full (Circle/Pill)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Image Border */}
            <div className="space-y-3">
              <Label>Border</Label>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Width</Label>
                  <Select
                    value={content.imageBorderWidth ?? "none"}
                    onValueChange={(value: HeroImageBorderWidth) =>
                      onChange({ ...content, imageBorderWidth: value })
                    }
                    disabled={disabled}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="thin">Thin (1px)</SelectItem>
                      <SelectItem value="medium">Medium (2px)</SelectItem>
                      <SelectItem value="thick">Thick (4px)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {content.imageBorderWidth && content.imageBorderWidth !== "none" && (
                  <div className="space-y-1.5">
                    <Label className="text-xs">Color</Label>
                    <Select
                      value={content.imageBorderColor ? "custom" : "theme"}
                      onValueChange={(value) =>
                        onChange({
                          ...content,
                          imageBorderColor: value === "theme" ? "" : "#3b82f6",
                        })
                      }
                      disabled={disabled}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="theme">Theme Primary</SelectItem>
                        <SelectItem value="custom">Custom Color</SelectItem>
                      </SelectContent>
                    </Select>

                    {content.imageBorderColor && (
                      <div className="flex gap-2 mt-2">
                        <Input
                          type="color"
                          value={content.imageBorderColor}
                          onChange={(e) =>
                            onChange({ ...content, imageBorderColor: e.target.value })
                          }
                          disabled={disabled}
                          className="w-12 h-9 p-1 cursor-pointer"
                        />
                        <Input
                          value={content.imageBorderColor}
                          onChange={(e) =>
                            onChange({ ...content, imageBorderColor: e.target.value })
                          }
                          placeholder="#3b82f6"
                          disabled={disabled}
                          className="flex-1"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Image Shadow */}
            <div className="space-y-2">
              <Label>Shadow</Label>
              <Select
                value={content.imageShadow ?? "none"}
                onValueChange={(value: HeroImageShadow) =>
                  onChange({ ...content, imageShadow: value })
                }
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                  <SelectItem value="xl">Extra Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* Body Text Section */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Body Text</Label>
          <p className="text-xs text-muted-foreground">
            Add formatted content below your heading and subheading
          </p>
          <TiptapEditor
            value={content.bodyText ?? ""}
            onChange={(html) => handleChange("bodyText", html)}
            placeholder="Add detailed content to your hero section..."
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <Label>Text Alignment</Label>
          <Select
            value={content.bodyTextAlignment ?? "center"}
            onValueChange={(value: HeroBodyTextAlignment) =>
              onChange({ ...content, bodyTextAlignment: value })
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
      </div>

      {/* Buttons Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Buttons</Label>
          <span className="text-xs text-muted-foreground">
            {buttons.length} / {MAX_HERO_BUTTONS}
          </span>
        </div>

        {/* Button List */}
        {buttons.length > 0 && (
          <div className="space-y-3">
            {buttons.map((button, index) => (
              <div
                key={button.id}
                className="rounded-lg border bg-muted/30 p-3 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Button {index + 1}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveButton(button.id)}
                    disabled={disabled}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Text</Label>
                    <Input
                      value={button.text}
                      onChange={(e) =>
                        handleButtonChange(button.id, "text", e.target.value)
                      }
                      placeholder="Get Started"
                      disabled={disabled}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">URL</Label>
                    <Input
                      value={button.url}
                      onChange={(e) =>
                        handleButtonChange(button.id, "url", e.target.value)
                      }
                      placeholder="#"
                      disabled={disabled}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Style</Label>
                  <Select
                    value={button.variant}
                    onValueChange={(value: HeroButtonVariant) =>
                      handleButtonChange(button.id, "variant", value)
                    }
                    disabled={disabled}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="primary">Primary (Filled)</SelectItem>
                      <SelectItem value="secondary">Secondary (Outline)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddButton}
          disabled={disabled || buttons.length >= MAX_HERO_BUTTONS}
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Button
        </Button>

        {buttons.length === 0 && (
          <p className="text-xs text-muted-foreground text-center">
            No buttons added. Click above to add a call-to-action button.
          </p>
        )}
      </div>

      {/* Background Image */}
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
