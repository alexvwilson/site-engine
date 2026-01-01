"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  HeadingContent,
  HeadingLevel,
  HeadingAlignment,
  TextColorMode,
} from "@/lib/section-types";

interface HeadingEditorProps {
  content: HeadingContent;
  onChange: (content: HeadingContent) => void;
  disabled?: boolean;
  siteId: string;
}

export function HeadingEditor({
  content,
  onChange,
  disabled,
}: HeadingEditorProps) {
  const updateField = <K extends keyof HeadingContent>(
    field: K,
    value: HeadingContent[K]
  ): void => {
    onChange({ ...content, [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="heading-title">Title</Label>
        <Input
          id="heading-title"
          value={content.title}
          onChange={(e) => updateField("title", e.target.value)}
          placeholder="Enter your heading"
          disabled={disabled}
        />
      </div>

      {/* Subtitle */}
      <div className="space-y-2">
        <Label htmlFor="heading-subtitle">
          Subtitle <span className="text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id="heading-subtitle"
          value={content.subtitle || ""}
          onChange={(e) => updateField("subtitle", e.target.value)}
          placeholder="Supporting text below the heading"
          disabled={disabled}
        />
      </div>

      {/* Level and Alignment Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Heading Level */}
        <div className="space-y-2">
          <Label>Heading Level</Label>
          <Select
            value={String(content.level)}
            onValueChange={(v) =>
              updateField("level", Number(v) as HeadingLevel)
            }
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">H1 - Page Title</SelectItem>
              <SelectItem value="2">H2 - Section</SelectItem>
              <SelectItem value="3">H3 - Subsection</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Use H1 once per page for SEO
          </p>
        </div>

        {/* Alignment */}
        <div className="space-y-2">
          <Label>Alignment</Label>
          <Select
            value={content.alignment}
            onValueChange={(v: HeadingAlignment) =>
              updateField("alignment", v)
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

      {/* Text Color Mode */}
      <div className="space-y-2">
        <Label>Text Color</Label>
        <Select
          value={content.textColorMode ?? "auto"}
          onValueChange={(v) => updateField("textColorMode", v as TextColorMode)}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="auto">Auto (from theme)</SelectItem>
            <SelectItem value="light">Light (white text)</SelectItem>
            <SelectItem value="dark">Dark (black text)</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Use light/dark when placing over colored backgrounds
        </p>
      </div>
    </div>
  );
}
