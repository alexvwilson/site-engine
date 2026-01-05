"use client";

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
} from "@/lib/section-types";
import { MAX_HERO_BUTTONS } from "@/lib/section-types";

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
