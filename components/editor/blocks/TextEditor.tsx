"use client";

import dynamic from "next/dynamic";
import { Label } from "@/components/ui/label";
import { StylingControls } from "@/components/editor/StylingControls";
import type { TextContent } from "@/lib/section-types";

// Dynamically import TiptapEditor to avoid SSR issues with ProseMirror
const TiptapEditor = dynamic(
  () =>
    import("@/components/editor/TiptapEditor").then((mod) => mod.TiptapEditor),
  {
    ssr: false,
    loading: () => (
      <div className="border rounded-md bg-muted/50 min-h-[200px]">
        <div className="h-10 border-b bg-muted/30" />
        <div className="p-3 text-muted-foreground text-sm">
          Loading editor...
        </div>
      </div>
    ),
  }
);

interface TextEditorProps {
  content: TextContent;
  onChange: (content: TextContent) => void;
  disabled?: boolean;
  siteId: string;
}

export function TextEditor({
  content,
  onChange,
  disabled,
  siteId,
}: TextEditorProps) {
  const handleBodyChange = (html: string): void => {
    onChange({ ...content, body: html });
  };

  return (
    <div className="space-y-6">
      {/* Content Editor */}
      <div className="space-y-2">
        <Label>Content</Label>
        <TiptapEditor
          value={content.body}
          onChange={handleBodyChange}
          placeholder="Enter your text content..."
          disabled={disabled}
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
      />
    </div>
  );
}
