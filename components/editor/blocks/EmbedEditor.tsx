"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Code } from "lucide-react";
import type { EmbedContent, EmbedAspectRatio } from "@/lib/section-types";
import { validateEmbedCode, getEmbedServiceName } from "@/lib/embed-utils";

interface EmbedEditorProps {
  content: EmbedContent;
  onChange: (content: EmbedContent) => void;
  disabled?: boolean;
  siteId: string;
}

const ASPECT_RATIOS: { value: EmbedAspectRatio; label: string }[] = [
  { value: "16:9", label: "16:9 (Video)" },
  { value: "4:3", label: "4:3 (Standard)" },
  { value: "1:1", label: "1:1 (Square)" },
  { value: "custom", label: "Custom Height" },
];

export function EmbedEditor({
  content,
  onChange,
  disabled,
}: EmbedEditorProps) {
  const [error, setError] = useState<string | null>(null);

  const handleEmbedCodeChange = (value: string): void => {
    if (!value.trim()) {
      setError(null);
      onChange({ ...content, embedCode: value, src: "" });
      return;
    }

    const result = validateEmbedCode(value);

    if (result.valid && result.parsed) {
      setError(null);
      onChange({
        ...content,
        embedCode: value,
        src: result.parsed.src,
        title: result.parsed.title || content.title,
      });
    } else {
      setError(result.error || "Invalid embed code");
      onChange({ ...content, embedCode: value, src: "" });
    }
  };

  const handleAspectRatioChange = (value: EmbedAspectRatio): void => {
    onChange({ ...content, aspectRatio: value });
  };

  const handleCustomHeightChange = (value: string): void => {
    const height = parseInt(value, 10);
    if (!isNaN(height) && height > 0) {
      onChange({ ...content, customHeight: height });
    }
  };

  const handleTitleChange = (value: string): void => {
    onChange({ ...content, title: value });
  };

  const isValid = !!content.src;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="embed-code">Embed Code</Label>
        <Textarea
          id="embed-code"
          value={content.embedCode}
          onChange={(e) => handleEmbedCodeChange(e.target.value)}
          placeholder='Paste iframe embed code here (e.g., <iframe src="https://youtube.com/embed/...")'
          disabled={disabled}
          rows={4}
          className="font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">
          Supported: YouTube, Vimeo, Google Maps, Spotify, SoundCloud
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isValid && content.src && (
        <Alert>
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription>
            {getEmbedServiceName(content.src)} embed detected
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="aspect-ratio">Aspect Ratio</Label>
        <Select
          value={content.aspectRatio}
          onValueChange={handleAspectRatioChange}
          disabled={disabled}
        >
          <SelectTrigger id="aspect-ratio">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ASPECT_RATIOS.map((ratio) => (
              <SelectItem key={ratio.value} value={ratio.value}>
                {ratio.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {content.aspectRatio === "custom" && (
        <div className="space-y-2">
          <Label htmlFor="custom-height">Height (pixels)</Label>
          <Input
            id="custom-height"
            type="number"
            value={content.customHeight || 400}
            onChange={(e) => handleCustomHeightChange(e.target.value)}
            min={100}
            max={1000}
            disabled={disabled}
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="embed-title">Title (optional)</Label>
        <Input
          id="embed-title"
          value={content.title || ""}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Descriptive title for accessibility"
          disabled={disabled}
        />
      </div>

      {isValid && content.src && (
        <div className="space-y-2">
          <Label>Preview</Label>
          <div
            className="relative w-full overflow-hidden rounded-md border bg-muted"
            style={{
              aspectRatio:
                content.aspectRatio === "custom"
                  ? undefined
                  : content.aspectRatio.replace(":", "/"),
              height:
                content.aspectRatio === "custom"
                  ? `${content.customHeight || 400}px`
                  : undefined,
            }}
          >
            <iframe
              src={content.src}
              title={content.title || "Embedded content"}
              className="absolute inset-0 h-full w-full"
              loading="lazy"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {!content.src && !error && (
        <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
          <Code className="mb-2 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Paste an embed code above to preview
          </p>
        </div>
      )}
    </div>
  );
}
