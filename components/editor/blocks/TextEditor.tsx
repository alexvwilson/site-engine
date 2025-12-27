"use client";

import dynamic from "next/dynamic";
import { Label } from "@/components/ui/label";
import type { TextContent } from "@/lib/section-types";

// Dynamically import TiptapEditor to avoid SSR issues with ProseMirror
const TiptapEditor = dynamic(
  () => import("@/components/editor/TiptapEditor").then((mod) => mod.TiptapEditor),
  {
    ssr: false,
    loading: () => (
      <div className="border rounded-md bg-muted/50 min-h-[200px]">
        <div className="h-10 border-b bg-muted/30" />
        <div className="p-3 text-muted-foreground text-sm">Loading editor...</div>
      </div>
    ),
  }
);

interface TextEditorProps {
  content: TextContent;
  onChange: (content: TextContent) => void;
  disabled?: boolean;
}

export function TextEditor({ content, onChange, disabled }: TextEditorProps) {
  const handleChange = (html: string): void => {
    onChange({ ...content, body: html });
  };

  return (
    <div className="space-y-2">
      <Label>Content</Label>
      <TiptapEditor
        value={content.body}
        onChange={handleChange}
        placeholder="Enter your text content..."
        disabled={disabled}
      />
    </div>
  );
}
