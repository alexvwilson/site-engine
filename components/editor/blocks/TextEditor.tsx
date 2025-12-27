"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { TextContent } from "@/lib/section-types";

interface TextEditorProps {
  content: TextContent;
  onChange: (content: TextContent) => void;
  disabled?: boolean;
}

export function TextEditor({ content, onChange, disabled }: TextEditorProps) {
  const handleChange = (value: string): void => {
    onChange({ ...content, body: value });
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="text-body">Content</Label>
      <Textarea
        id="text-body"
        value={content.body}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Enter your text content..."
        rows={8}
        disabled={disabled}
        className="font-mono text-sm"
      />
      <p className="text-xs text-muted-foreground">
        You can use basic HTML tags for formatting. Rich text editor coming soon.
      </p>
    </div>
  );
}
