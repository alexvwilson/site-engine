"use client";

import { Plus, Trash2 } from "lucide-react";
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
import { IconPicker } from "@/components/editor/IconPicker";
import {
  StylingControls,
  CardBackgroundPanel,
} from "@/components/editor/StylingControls";
import type {
  FeaturesContent,
  Feature,
  FeatureButtonVariant,
} from "@/lib/section-types";
import type { EditorMode } from "../inspector/EditorModeToggle";

interface FeaturesEditorProps {
  content: FeaturesContent;
  onChange: (content: FeaturesContent) => void;
  disabled?: boolean;
  siteId: string;
  editorMode?: EditorMode;
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
  editorMode = "all",
}: FeaturesEditorProps) {
  const showContent = editorMode === "all" || editorMode === "content";
  const showLayout = editorMode === "all" || editorMode === "layout";
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
      {/* Content Section */}
      {showContent && (
        <>
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
              <div className="space-y-3">
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
                <div className="space-y-2">
                  <Label htmlFor={`feature-${index}-button-variant`}>Button Style</Label>
                  <Select
                    value={feature.buttonVariant ?? "secondary"}
                    onValueChange={(v) => {
                      const newFeatures = [...content.features];
                      newFeatures[index] = { ...newFeatures[index], buttonVariant: v as FeatureButtonVariant };
                      onChange({ ...content, features: newFeatures });
                    }}
                    disabled={disabled}
                  >
                    <SelectTrigger id={`feature-${index}-button-variant`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="primary">Filled</SelectItem>
                      <SelectItem value="secondary">Outline</SelectItem>
                    </SelectContent>
                  </Select>
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
        </>
      )}

      {/* Styling Section */}
      {showLayout && (
        <StylingControls
          content={content}
          onChange={onChange}
          disabled={disabled}
          siteId={siteId}
          textSizeDescription="Scales feature titles and descriptions proportionally."
        >
          {/* Card Background Panel */}
          <CardBackgroundPanel
            title="Feature Cards"
            showCardBackground={content.showCardBackground ?? true}
            cardBackgroundColor={content.cardBackgroundColor}
            onShowCardBackgroundChange={(checked) =>
              updateField("showCardBackground", checked)
            }
            onCardBackgroundColorChange={(color) =>
              updateField("cardBackgroundColor", color)
            }
            onCardBackgroundColorReset={() => updateField("cardBackgroundColor", "")}
            disabled={disabled}
            showDescription="Cards have solid backgrounds (text uses theme colors)"
            hideDescription="Cards are transparent (text adapts to section background)"
          />
        </StylingControls>
      )}
    </div>
  );
}
