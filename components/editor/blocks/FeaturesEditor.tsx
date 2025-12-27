"use client";

import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { FeaturesContent, Feature } from "@/lib/section-types";

interface FeaturesEditorProps {
  content: FeaturesContent;
  onChange: (content: FeaturesContent) => void;
  disabled?: boolean;
}

const DEFAULT_FEATURE: Feature = {
  icon: "star",
  title: "New Feature",
  description: "Describe this feature",
};

export function FeaturesEditor({ content, onChange, disabled }: FeaturesEditorProps) {
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

  return (
    <div className="space-y-6">
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
              <Label htmlFor={`feature-${index}-icon`}>Icon Name</Label>
              <Input
                id={`feature-${index}-icon`}
                value={feature.icon}
                onChange={(e) => handleFeatureChange(index, "icon", e.target.value)}
                placeholder="star, zap, shield..."
                disabled={disabled}
              />
              <p className="text-xs text-muted-foreground">
                Lucide icon name
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`feature-${index}-title`}>Title</Label>
              <Input
                id={`feature-${index}-title`}
                value={feature.title}
                onChange={(e) => handleFeatureChange(index, "title", e.target.value)}
                placeholder="Feature title"
                disabled={disabled}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`feature-${index}-description`}>Description</Label>
            <Textarea
              id={`feature-${index}-description`}
              value={feature.description}
              onChange={(e) => handleFeatureChange(index, "description", e.target.value)}
              placeholder="Describe this feature"
              rows={2}
              disabled={disabled}
            />
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
    </div>
  );
}
