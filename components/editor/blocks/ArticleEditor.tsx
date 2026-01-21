"use client";

import dynamic from "next/dynamic";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StylingControls } from "@/components/editor/StylingControls";
import type {
  ArticleContent,
  TextBorderRadius,
} from "@/lib/section-types";

// Dynamically import ArticleTiptapEditor to avoid SSR issues with ProseMirror
const ArticleTiptapEditor = dynamic(
  () =>
    import("@/components/editor/ArticleTiptapEditor").then(
      (mod) => mod.ArticleTiptapEditor
    ),
  {
    ssr: false,
    loading: () => (
      <div className="border rounded-md bg-muted/50 min-h-[250px]">
        <div className="h-10 border-b bg-muted/30" />
        <div className="p-3 text-muted-foreground text-sm">
          Loading editor...
        </div>
      </div>
    ),
  }
);

interface ArticleEditorProps {
  content: ArticleContent;
  onChange: (content: ArticleContent) => void;
  disabled?: boolean;
  siteId: string;
}

export function ArticleEditor({
  content,
  onChange,
  disabled,
  siteId,
}: ArticleEditorProps): React.JSX.Element {
  const handleBodyChange = (html: string): void => {
    onChange({ ...content, body: html });
  };

  const updateField = <K extends keyof ArticleContent>(
    field: K,
    value: ArticleContent[K]
  ): void => {
    onChange({ ...content, [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Content Editor */}
      <div className="space-y-2">
        <Label>Article Content</Label>
        <p className="text-xs text-muted-foreground mb-2">
          Use the image button in the toolbar to add inline images that text
          will wrap around.
        </p>
        <ArticleTiptapEditor
          value={content.body}
          onChange={handleBodyChange}
          siteId={siteId}
          placeholder="Write your article content here..."
          disabled={disabled}
          imageRounding={content.imageRounding ?? "medium"}
        />
      </div>

      {/* Styling Section */}
      <StylingControls
        content={content}
        onChange={onChange}
        disabled={disabled}
        siteId={siteId}
        showLayoutPanel
        textSizeDescription="Scales all text including headings proportionally."
      >
        {/* Custom Images Panel */}
        <div className="space-y-4 rounded-lg border p-4">
          <Label className="text-xs uppercase text-muted-foreground tracking-wide">
            Images
          </Label>

          <div className="space-y-2">
            <Label>Image Corners</Label>
            <Select
              value={content.imageRounding ?? "medium"}
              onValueChange={(v) =>
                updateField("imageRounding", v as TextBorderRadius)
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
            <p className="text-xs text-muted-foreground">
              Applies to all inline images in this article.
            </p>
          </div>
        </div>
      </StylingControls>
    </div>
  );
}
