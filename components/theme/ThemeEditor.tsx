"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ColorPickerField } from "./ColorPickerField";
import { FontSelect } from "./FontSelect";
import { ThemePreview } from "./ThemePreview";
import { updateThemeData } from "@/app/actions/theme";
import { regenerateThemeOutput } from "@/lib/theme-utils";
import type { ThemeData } from "@/lib/drizzle/schema/theme-types";
import { Loader2 } from "lucide-react";

interface ThemeEditorProps {
  themeId: string;
  initialData: ThemeData;
  onSave: () => void;
  onCancel: () => void;
}

export function ThemeEditor({
  themeId,
  initialData,
  onSave,
  onCancel,
}: ThemeEditorProps) {
  const [data, setData] = useState<ThemeData>(initialData);
  const [isPending, startTransition] = useTransition();

  const updateColor = (key: keyof ThemeData["colors"], value: string): void => {
    setData((prev) => ({
      ...prev,
      colors: { ...prev.colors, [key]: value },
    }));
  };

  const updateHeadingFont = (family: string): void => {
    setData((prev) => ({
      ...prev,
      typography: {
        ...prev.typography,
        headingFont: { ...prev.typography.headingFont, family },
      },
    }));
  };

  const updateBodyFont = (family: string): void => {
    setData((prev) => ({
      ...prev,
      typography: {
        ...prev.typography,
        bodyFont: { ...prev.typography.bodyFont, family },
      },
    }));
  };

  const updateBorderRadius = (value: number): void => {
    const radius = `${value / 16}rem`;
    setData((prev) => ({
      ...prev,
      components: {
        ...prev.components,
        button: { ...prev.components.button, borderRadius: radius },
        card: { ...prev.components.card, borderRadius: radius },
        input: { ...prev.components.input, borderRadius: radius },
        badge: { ...prev.components.badge, borderRadius: radius },
      },
    }));
  };

  const getCurrentBorderRadius = (): number => {
    const radiusStr = data.components.button.borderRadius;
    const match = radiusStr.match(/^([\d.]+)rem$/);
    if (match) {
      return parseFloat(match[1]) * 16;
    }
    // Fallback: try parsing as px
    const pxMatch = radiusStr.match(/^([\d.]+)px$/);
    if (pxMatch) {
      return parseFloat(pxMatch[1]);
    }
    return 8; // Default
  };

  const handleSave = (): void => {
    startTransition(async () => {
      const finalData = regenerateThemeOutput(data);
      const result = await updateThemeData(themeId, finalData);
      if (result.success) {
        onSave();
      }
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-2">
        {/* Colors Section */}
        <div>
          <h4 className="font-medium mb-3">Colors</h4>
          <div className="grid grid-cols-2 gap-3">
            <ColorPickerField
              label="Primary"
              value={data.colors.primary}
              onChange={(v) => updateColor("primary", v)}
            />
            <ColorPickerField
              label="Secondary"
              value={data.colors.secondary}
              onChange={(v) => updateColor("secondary", v)}
            />
            <ColorPickerField
              label="Accent"
              value={data.colors.accent}
              onChange={(v) => updateColor("accent", v)}
            />
            <ColorPickerField
              label="Background"
              value={data.colors.background}
              onChange={(v) => updateColor("background", v)}
            />
            <ColorPickerField
              label="Text"
              value={data.colors.foreground}
              onChange={(v) => updateColor("foreground", v)}
            />
            <ColorPickerField
              label="Muted"
              value={data.colors.muted}
              onChange={(v) => updateColor("muted", v)}
            />
            <ColorPickerField
              label="Muted Text"
              value={data.colors.mutedForeground}
              onChange={(v) => updateColor("mutedForeground", v)}
            />
            <ColorPickerField
              label="Border"
              value={data.colors.border}
              onChange={(v) => updateColor("border", v)}
            />
          </div>
        </div>

        <Separator />

        {/* Typography Section */}
        <div>
          <h4 className="font-medium mb-3">Typography</h4>
          <div className="grid grid-cols-2 gap-3">
            <FontSelect
              label="Heading Font"
              value={data.typography.headingFont.family}
              onChange={updateHeadingFont}
              type="heading"
            />
            <FontSelect
              label="Body Font"
              value={data.typography.bodyFont.family}
              onChange={updateBodyFont}
              type="body"
            />
          </div>
        </div>

        <Separator />

        {/* Border Radius Section */}
        <div>
          <h4 className="font-medium mb-3">Border Radius</h4>
          <div className="space-y-2">
            <Label className="text-xs">Component Roundness</Label>
            <Slider
              value={[getCurrentBorderRadius()]}
              max={24}
              min={0}
              step={1}
              onValueChange={(values: number[]) => updateBorderRadius(values[0])}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Square</span>
              <span>{getCurrentBorderRadius()}px</span>
              <span>Rounded</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Live Preview */}
        <div>
          <h4 className="font-medium mb-3">Preview</h4>
          <ThemePreview theme={data} />
        </div>
      </div>

      {/* Fixed footer with buttons */}
      <div className="flex gap-2 pt-4 border-t mt-4">
        <Button
          variant="outline"
          className="flex-1"
          onClick={onCancel}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button className="flex-1" onClick={handleSave} disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </div>
  );
}
