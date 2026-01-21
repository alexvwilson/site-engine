"use client";

import React, { useState, useEffect, type ReactNode } from "react";
import { ChevronDown, Palette } from "lucide-react";
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
import type {
  SectionStyling,
  TextBorderWidth,
  TextBorderRadius,
  TextContentWidth,
  TextSize,
  TextColorMode,
} from "@/lib/section-types";

// ============================================================================
// Types
// ============================================================================

type UpdateFieldFn<T> = <K extends keyof T>(field: K, value: T[K]) => void;

interface StylingControlsProps<T extends SectionStyling> {
  content: T;
  onChange: (content: T) => void;
  disabled?: boolean;
  siteId: string;
  /** Custom panels to insert before Typography (e.g., Card controls, Form controls) */
  children?: ReactNode;
  /** Whether to show the Layout panel with content width control */
  showLayoutPanel?: boolean;
  /** Custom description for text size in Typography panel */
  textSizeDescription?: string;
}

// ============================================================================
// Hook for theme primary color
// ============================================================================

export function useThemePrimaryColor(): string {
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

  return themePrimaryColor;
}

// ============================================================================
// Panel Components (for composition)
// ============================================================================

interface PanelWrapperProps {
  title: string;
  children: ReactNode;
}

function PanelWrapper({ title, children }: PanelWrapperProps): React.ReactElement {
  return (
    <div className="space-y-4 rounded-lg border p-4">
      <Label className="text-xs uppercase text-muted-foreground tracking-wide">
        {title}
      </Label>
      {children}
    </div>
  );
}

// ============================================================================
// Border Panel
// ============================================================================

interface BorderPanelProps<T extends SectionStyling> {
  content: T;
  updateField: UpdateFieldFn<T>;
  disabled?: boolean;
  themePrimaryColor: string;
}

export function BorderPanel<T extends SectionStyling>({
  content,
  updateField,
  disabled,
  themePrimaryColor,
}: BorderPanelProps<T>): React.ReactElement {
  return (
    <PanelWrapper title="Border">
      <div className="flex items-center justify-between">
        <Label htmlFor="show-border">Show Border</Label>
        <Switch
          id="show-border"
          checked={content.showBorder ?? false}
          onCheckedChange={(checked) =>
            updateField("showBorder" as keyof T, checked as T[keyof T])
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
                  updateField("borderWidth" as keyof T, v as T[keyof T])
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
                  updateField("borderRadius" as keyof T, v as T[keyof T])
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
                  updateField("borderColor" as keyof T, e.target.value as T[keyof T])
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
                  onClick={() =>
                    updateField("borderColor" as keyof T, "" as T[keyof T])
                  }
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
                  updateField("useThemeBackground" as keyof T, checked as T[keyof T]);
                  if (checked) {
                    updateField("boxBackgroundColor" as keyof T, "" as T[keyof T]);
                  }
                }}
                disabled={disabled}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {(content.useThemeBackground ?? true)
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
                      updateField(
                        "boxBackgroundColor" as keyof T,
                        e.target.value as T[keyof T]
                      )
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
                  updateField("boxBackgroundOpacity" as keyof T, v as T[keyof T])
                }
                min={0}
                max={100}
                step={5}
                disabled={disabled || (content.useThemeBackground ?? true)}
              />
              {(content.useThemeBackground ?? true) && (
                <p className="text-xs text-muted-foreground">
                  Opacity requires a custom color (theme backgrounds don&apos;t
                  support transparency)
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </PanelWrapper>
  );
}

// ============================================================================
// Background Panel
// ============================================================================

interface BackgroundPanelProps<T extends SectionStyling> {
  content: T;
  updateField: UpdateFieldFn<T>;
  disabled?: boolean;
  siteId: string;
}

export function BackgroundPanel<T extends SectionStyling>({
  content,
  updateField,
  disabled,
  siteId,
}: BackgroundPanelProps<T>): React.ReactElement {
  return (
    <PanelWrapper title="Background">
      <div className="space-y-2">
        <Label>Background Image</Label>
        <ImageUpload
          value={content.backgroundImage || ""}
          onChange={(url) =>
            updateField("backgroundImage" as keyof T, url as T[keyof T])
          }
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
              updateField("overlayColor" as keyof T, e.target.value as T[keyof T])
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
          onValueChange={([v]) =>
            updateField("overlayOpacity" as keyof T, v as T[keyof T])
          }
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
    </PanelWrapper>
  );
}

// ============================================================================
// Layout Panel
// ============================================================================

interface LayoutPanelProps<T extends SectionStyling> {
  content: T;
  updateField: UpdateFieldFn<T>;
  disabled?: boolean;
}

export function LayoutPanel<T extends SectionStyling>({
  content,
  updateField,
  disabled,
}: LayoutPanelProps<T>): React.ReactElement {
  return (
    <PanelWrapper title="Layout">
      <div className="space-y-2">
        <Label>Content Width</Label>
        <Select
          value={content.contentWidth ?? "narrow"}
          onValueChange={(v) =>
            updateField("contentWidth" as keyof T, v as T[keyof T])
          }
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="narrow">Narrow</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="full">Full Width</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Controls the width of the content. Background always spans full width.
        </p>
      </div>
    </PanelWrapper>
  );
}

// ============================================================================
// Typography Panel
// ============================================================================

interface TypographyPanelProps<T extends SectionStyling> {
  content: T;
  updateField: UpdateFieldFn<T>;
  disabled?: boolean;
  textSizeDescription?: string;
}

export function TypographyPanel<T extends SectionStyling>({
  content,
  updateField,
  disabled,
  textSizeDescription = "Scales all text including headings proportionally.",
}: TypographyPanelProps<T>): React.ReactElement {
  return (
    <PanelWrapper title="Typography">
      <div className="space-y-2">
        <Label>Text Size</Label>
        <Select
          value={content.textSize ?? "normal"}
          onValueChange={(v) =>
            updateField("textSize" as keyof T, v as T[keyof T])
          }
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
        <p className="text-xs text-muted-foreground">{textSizeDescription}</p>
      </div>

      <div className="space-y-2">
        <Label>Text Color</Label>
        <Select
          value={content.textColorMode ?? "auto"}
          onValueChange={(v) =>
            updateField("textColorMode" as keyof T, v as T[keyof T])
          }
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="auto">Auto (detect from background)</SelectItem>
            <SelectItem value="light">Light (white text)</SelectItem>
            <SelectItem value="dark">Dark (black text)</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Auto uses light text when a background image is set.
        </p>
      </div>
    </PanelWrapper>
  );
}

// ============================================================================
// Card Background Panel (for Features, Testimonials, BlogGrid, etc.)
// ============================================================================

interface CardBackgroundPanelProps {
  title?: string;
  showCardBackground: boolean;
  cardBackgroundColor?: string;
  onShowCardBackgroundChange: (checked: boolean) => void;
  onCardBackgroundColorChange: (color: string) => void;
  onCardBackgroundColorReset: () => void;
  disabled?: boolean;
  showDescription?: string;
  hideDescription?: string;
}

export function CardBackgroundPanel({
  title = "Cards",
  showCardBackground,
  cardBackgroundColor,
  onShowCardBackgroundChange,
  onCardBackgroundColorChange,
  onCardBackgroundColorReset,
  disabled,
  showDescription = "Cards have solid backgrounds (text uses theme colors)",
  hideDescription = "Cards are transparent (text adapts to section background)",
}: CardBackgroundPanelProps): React.ReactElement {
  return (
    <PanelWrapper title={title}>
      <div className="flex items-center justify-between">
        <Label htmlFor="show-card-bg">Show Card Background</Label>
        <Switch
          id="show-card-bg"
          checked={showCardBackground}
          onCheckedChange={onShowCardBackgroundChange}
          disabled={disabled}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {showCardBackground ? showDescription : hideDescription}
      </p>

      {showCardBackground && (
        <div className="space-y-2">
          <Label>Card Background Color</Label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={cardBackgroundColor || "#FFFFFF"}
              onChange={(e) => onCardBackgroundColorChange(e.target.value)}
              disabled={disabled}
              className="h-10 w-14 rounded border cursor-pointer disabled:opacity-50"
            />
            <span className="text-sm text-muted-foreground">
              {cardBackgroundColor || "Using theme card style"}
            </span>
            {cardBackgroundColor && (
              <button
                type="button"
                onClick={onCardBackgroundColorReset}
                className="text-xs text-muted-foreground hover:text-foreground underline"
                disabled={disabled}
              >
                Reset
              </button>
            )}
          </div>
        </div>
      )}
    </PanelWrapper>
  );
}

// ============================================================================
// Form Background Panel (for Contact)
// ============================================================================

interface FormBackgroundPanelProps {
  showFormBackground: boolean;
  formBackgroundColor?: string;
  onShowFormBackgroundChange: (checked: boolean) => void;
  onFormBackgroundColorChange: (color: string) => void;
  onFormBackgroundColorReset: () => void;
  disabled?: boolean;
}

export function FormBackgroundPanel({
  showFormBackground,
  formBackgroundColor,
  onShowFormBackgroundChange,
  onFormBackgroundColorChange,
  onFormBackgroundColorReset,
  disabled,
}: FormBackgroundPanelProps): React.ReactElement {
  return (
    <PanelWrapper title="Form Card">
      <div className="flex items-center justify-between">
        <Label htmlFor="show-form-bg">Show Form Background</Label>
        <Switch
          id="show-form-bg"
          checked={showFormBackground}
          onCheckedChange={onShowFormBackgroundChange}
          disabled={disabled}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {showFormBackground
          ? "Form has a solid background (labels use theme colors)"
          : "Form is transparent (labels adapt to section background)"}
      </p>

      {showFormBackground && (
        <div className="space-y-2">
          <Label>Form Background Color</Label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={formBackgroundColor || "#FFFFFF"}
              onChange={(e) => onFormBackgroundColorChange(e.target.value)}
              disabled={disabled}
              className="h-10 w-14 rounded border cursor-pointer disabled:opacity-50"
            />
            <span className="text-sm text-muted-foreground">
              {formBackgroundColor || "Using theme card style"}
            </span>
            {formBackgroundColor && (
              <button
                type="button"
                onClick={onFormBackgroundColorReset}
                className="text-xs text-muted-foreground hover:text-foreground underline"
                disabled={disabled}
              >
                Reset
              </button>
            )}
          </div>
        </div>
      )}
    </PanelWrapper>
  );
}

// ============================================================================
// Main StylingControls Component
// ============================================================================

export function StylingControls<T extends SectionStyling>({
  content,
  onChange,
  disabled,
  siteId,
  children,
  showLayoutPanel = false,
  textSizeDescription,
}: StylingControlsProps<T>): React.ReactElement {
  const [stylingOpen, setStylingOpen] = useState(false);
  const themePrimaryColor = useThemePrimaryColor();

  const updateField = <K extends keyof T>(field: K, value: T[K]): void => {
    onChange({ ...content, [field]: value });
  };

  return (
    <div className="space-y-4">
      {/* Styling Header with Toggle */}
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
              className={`h-4 w-4 transition-transform ${
                stylingOpen ? "rotate-180" : ""
              }`}
            />
          </CollapsibleTrigger>
        </Collapsible>
        <div className="flex items-center gap-2">
          <Label
            htmlFor="enable-styling"
            className="text-sm text-muted-foreground"
          >
            {(content.enableStyling ?? false) ? "On" : "Off"}
          </Label>
          <Switch
            id="enable-styling"
            checked={content.enableStyling ?? false}
            onCheckedChange={(checked) => {
              updateField("enableStyling" as keyof T, checked as T[keyof T]);
              if (checked && !stylingOpen) {
                setStylingOpen(true);
              }
            }}
            disabled={disabled}
          />
        </div>
      </div>

      {/* Collapsible Content */}
      <Collapsible open={stylingOpen} onOpenChange={setStylingOpen}>
        <CollapsibleContent className="space-y-6">
          {/* Border Panel */}
          <BorderPanel
            content={content}
            updateField={updateField}
            disabled={disabled}
            themePrimaryColor={themePrimaryColor}
          />

          {/* Background Panel */}
          <BackgroundPanel
            content={content}
            updateField={updateField}
            disabled={disabled}
            siteId={siteId}
          />

          {/* Layout Panel (optional) */}
          {showLayoutPanel && (
            <LayoutPanel
              content={content}
              updateField={updateField}
              disabled={disabled}
            />
          )}

          {/* Custom panels (Cards, Forms, etc.) */}
          {children}

          {/* Typography Panel (always last) */}
          <TypographyPanel
            content={content}
            updateField={updateField}
            disabled={disabled}
            textSizeDescription={textSizeDescription}
          />
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

// Re-export types for convenience
export type {
  SectionStyling,
  TextBorderWidth,
  TextBorderRadius,
  TextContentWidth,
  TextSize,
  TextColorMode,
};
