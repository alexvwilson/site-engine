"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import type { ThemeRequirements } from "@/lib/drizzle/schema/theme-types";

// Industry options for the dropdown
const INDUSTRIES = [
  { value: "technology", label: "Technology" },
  { value: "healthcare", label: "Healthcare" },
  { value: "finance", label: "Finance" },
  { value: "education", label: "Education" },
  { value: "e-commerce", label: "E-commerce" },
  { value: "real-estate", label: "Real Estate" },
  { value: "food-beverage", label: "Food & Beverage" },
  { value: "travel", label: "Travel & Hospitality" },
  { value: "creative", label: "Creative & Design" },
  { value: "non-profit", label: "Non-Profit" },
  { value: "professional-services", label: "Professional Services" },
  { value: "entertainment", label: "Entertainment" },
  { value: "other", label: "Other" },
];

// Style keyword suggestions
const STYLE_KEYWORDS = [
  "modern",
  "minimal",
  "professional",
  "playful",
  "bold",
  "elegant",
  "clean",
  "vibrant",
  "corporate",
  "friendly",
  "luxurious",
  "tech-forward",
  "natural",
  "warm",
  "cool",
];

// Color mood categories with preset colors
const COLOR_MOODS = [
  {
    mood: "Trust & Professional",
    colors: [
      { name: "Navy Blue", hex: "#1e3a5f" },
      { name: "Royal Blue", hex: "#3b82f6" },
      { name: "Slate", hex: "#64748b" },
    ],
  },
  {
    mood: "Energy & Action",
    colors: [
      { name: "Coral Red", hex: "#ef4444" },
      { name: "Orange", hex: "#f97316" },
      { name: "Amber", hex: "#f59e0b" },
    ],
  },
  {
    mood: "Growth & Nature",
    colors: [
      { name: "Emerald", hex: "#10b981" },
      { name: "Teal", hex: "#14b8a6" },
      { name: "Forest", hex: "#166534" },
    ],
  },
  {
    mood: "Luxury & Elegance",
    colors: [
      { name: "Purple", hex: "#8b5cf6" },
      { name: "Deep Violet", hex: "#6d28d9" },
      { name: "Gold", hex: "#ca8a04" },
    ],
  },
  {
    mood: "Calm & Friendly",
    colors: [
      { name: "Sky Blue", hex: "#0ea5e9" },
      { name: "Lavender", hex: "#a78bfa" },
      { name: "Rose", hex: "#f472b6" },
    ],
  },
  {
    mood: "Neutral & Modern",
    colors: [
      { name: "Charcoal", hex: "#374151" },
      { name: "Stone", hex: "#78716c" },
      { name: "Zinc", hex: "#71717a" },
    ],
  },
];

interface RequirementsFormProps {
  siteName: string;
  onSubmit: (requirements: ThemeRequirements) => void;
  isLoading?: boolean;
}

export function RequirementsForm({
  siteName,
  onSubmit,
  isLoading = false,
}: RequirementsFormProps) {
  const [brandName, setBrandName] = useState(siteName);
  const [industry, setIndustry] = useState("");
  const [styleKeywords, setStyleKeywords] = useState<string[]>([]);
  const [targetAudience, setTargetAudience] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [customColors, setCustomColors] = useState("");
  const [avoidColors, setAvoidColors] = useState("");

  const handleAddKeyword = (keyword: string) => {
    if (!styleKeywords.includes(keyword) && styleKeywords.length < 5) {
      setStyleKeywords([...styleKeywords, keyword]);
    }
  };

  const handleToggleColor = (hex: string) => {
    if (selectedColors.includes(hex)) {
      setSelectedColors(selectedColors.filter((c) => c !== hex));
    } else if (selectedColors.length < 3) {
      setSelectedColors([...selectedColors, hex]);
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setStyleKeywords(styleKeywords.filter((k) => k !== keyword));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Combine selected preset colors with any custom colors
    const customColorList = customColors
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
    const allPreferredColors = [...selectedColors, ...customColorList];
    const avoidColorList = avoidColors
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);

    const requirements: ThemeRequirements = {
      brandName: brandName.trim(),
      industry,
      styleKeywords,
      targetAudience: targetAudience.trim() || undefined,
      additionalNotes: additionalNotes.trim() || undefined,
      colorPreferences:
        allPreferredColors.length > 0 || avoidColorList.length > 0
          ? {
              preferredColors: allPreferredColors,
              avoidColors: avoidColorList,
            }
          : undefined,
    };

    onSubmit(requirements);
  };

  const isValid = brandName.trim() && industry && styleKeywords.length > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Brand Name */}
      <div className="space-y-2">
        <Label htmlFor="brandName">Brand / Site Name *</Label>
        <Input
          id="brandName"
          value={brandName}
          onChange={(e) => setBrandName(e.target.value)}
          placeholder="Your brand name"
          required
        />
      </div>

      {/* Industry */}
      <div className="space-y-2">
        <Label htmlFor="industry">Industry *</Label>
        <Select value={industry} onValueChange={setIndustry} required>
          <SelectTrigger id="industry">
            <SelectValue placeholder="Select an industry" />
          </SelectTrigger>
          <SelectContent>
            {INDUSTRIES.map((ind) => (
              <SelectItem key={ind.value} value={ind.value}>
                {ind.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Style Keywords */}
      <div className="space-y-2">
        <Label>Style Keywords * (select up to 5)</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {styleKeywords.map((keyword) => (
            <Badge key={keyword} variant="secondary" className="gap-1">
              {keyword}
              <button
                type="button"
                onClick={() => handleRemoveKeyword(keyword)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex flex-wrap gap-1">
          {STYLE_KEYWORDS.filter((k) => !styleKeywords.includes(k)).map(
            (keyword) => (
              <Button
                key={keyword}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAddKeyword(keyword)}
                disabled={styleKeywords.length >= 5}
                className="text-xs h-7"
              >
                + {keyword}
              </Button>
            )
          )}
        </div>
        {styleKeywords.length === 0 && (
          <p className="text-xs text-muted-foreground">
            Select at least one style keyword
          </p>
        )}
      </div>

      {/* Target Audience */}
      <div className="space-y-2">
        <Label htmlFor="targetAudience">Target Audience (optional)</Label>
        <Input
          id="targetAudience"
          value={targetAudience}
          onChange={(e) => setTargetAudience(e.target.value)}
          placeholder="e.g., Young professionals, Enterprise clients"
        />
      </div>

      {/* Color Preferences */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Color Preferences (optional - select up to 3)</Label>
          <p className="text-xs text-muted-foreground mb-3">
            Click colors that match the feeling you want for your brand
          </p>

          {/* Selected colors preview */}
          {selectedColors.length > 0 && (
            <div className="flex items-center gap-2 mb-3 p-2 bg-muted/50 rounded-md">
              <span className="text-xs text-muted-foreground">Selected:</span>
              <div className="flex gap-1">
                {selectedColors.map((hex) => (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => handleToggleColor(hex)}
                    className="w-6 h-6 rounded border-2 border-primary shadow-sm"
                    style={{ backgroundColor: hex }}
                    title={`Remove ${hex}`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Color mood groups */}
          <div className="space-y-3">
            {COLOR_MOODS.map((group) => (
              <div key={group.mood} className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-32 shrink-0">
                  {group.mood}
                </span>
                <div className="flex gap-1">
                  {group.colors.map((color) => {
                    const isSelected = selectedColors.includes(color.hex);
                    return (
                      <button
                        key={color.hex}
                        type="button"
                        onClick={() => handleToggleColor(color.hex)}
                        disabled={!isSelected && selectedColors.length >= 3}
                        className={`w-8 h-8 rounded transition-all ${
                          isSelected
                            ? "ring-2 ring-primary ring-offset-2 scale-110"
                            : "hover:scale-105 disabled:opacity-40"
                        }`}
                        style={{ backgroundColor: color.hex }}
                        title={`${color.name} (${color.hex})`}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Custom colors and colors to avoid */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="customColors">Custom Colors</Label>
            <Input
              id="customColors"
              value={customColors}
              onChange={(e) => setCustomColors(e.target.value)}
              placeholder="#3B82F6, blue"
            />
            <p className="text-xs text-muted-foreground">
              Additional colors (comma-separated)
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="avoidColors">Colors to Avoid</Label>
            <Input
              id="avoidColors"
              value={avoidColors}
              onChange={(e) => setAvoidColors(e.target.value)}
              placeholder="#FF0000, red"
            />
            <p className="text-xs text-muted-foreground">
              Colors you don&apos;t want
            </p>
          </div>
        </div>
      </div>

      {/* Additional Notes */}
      <div className="space-y-2">
        <Label htmlFor="additionalNotes">Additional Notes (optional)</Label>
        <Textarea
          id="additionalNotes"
          value={additionalNotes}
          onChange={(e) => setAdditionalNotes(e.target.value)}
          placeholder="Any specific requirements or preferences..."
          rows={3}
        />
      </div>

      {/* Submit */}
      <Button type="submit" className="w-full" disabled={!isValid || isLoading}>
        {isLoading ? "Generating..." : "Generate Theme"}
      </Button>
    </form>
  );
}
