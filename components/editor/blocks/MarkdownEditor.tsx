"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StylingControls } from "@/components/editor/StylingControls";
import type { MarkdownContent } from "@/lib/section-types";

import "highlight.js/styles/github.css";

interface MarkdownEditorProps {
  content: MarkdownContent;
  onChange: (content: MarkdownContent) => void;
  disabled?: boolean;
  siteId: string;
}

export function MarkdownEditor({
  content,
  onChange,
  disabled,
  siteId,
}: MarkdownEditorProps) {
  const updateField = <K extends keyof MarkdownContent>(
    field: K,
    value: MarkdownContent[K]
  ): void => {
    onChange({ ...content, [field]: value });
  };

  const markdownPreview = (
    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
      {content.markdown || "*No content yet*"}
    </ReactMarkdown>
  );

  return (
    <div className="space-y-6">
      {/* Content Editor */}
      <div className="space-y-2">
        <Label>Content</Label>

        {/* Mobile view: Tabs */}
        <div className="md:hidden">
          <Tabs defaultValue="edit">
            <TabsList className="w-full">
              <TabsTrigger value="edit" className="flex-1">
                Edit
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex-1">
                Preview
              </TabsTrigger>
            </TabsList>
            <TabsContent value="edit" className="mt-2">
              <Textarea
                value={content.markdown || ""}
                onChange={(e) => updateField("markdown", e.target.value)}
                disabled={disabled}
                rows={20}
                className="font-mono text-sm"
                placeholder="Write your markdown here..."
              />
            </TabsContent>
            <TabsContent value="preview" className="mt-2">
              <div className="border rounded-md p-4 min-h-[300px] prose prose-sm dark:prose-invert max-w-none overflow-auto bg-background">
                {markdownPreview}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Desktop view: Split */}
        <div className="hidden md:grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">
              Edit
            </span>
            <Textarea
              value={content.markdown || ""}
              onChange={(e) => updateField("markdown", e.target.value)}
              disabled={disabled}
              rows={20}
              className="font-mono text-sm resize-none"
              placeholder="Write your markdown here..."
            />
          </div>
          <div className="space-y-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">
              Preview
            </span>
            <div className="border rounded-md p-4 h-[calc(100%-1.5rem)] min-h-[300px] overflow-auto prose prose-sm dark:prose-invert max-w-none bg-background">
              {markdownPreview}
            </div>
          </div>
        </div>
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
