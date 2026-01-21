"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { StylingControls } from "@/components/editor/StylingControls";
import type {
  RichTextContent,
  RichTextMode,
  TextBorderRadius,
} from "@/lib/section-types";
import type { EditorMode } from "../inspector/EditorModeToggle";
import { convertContent } from "@/lib/richtext-utils";
import { cn } from "@/lib/utils";

import "highlight.js/styles/github.css";

// Editor loading skeleton
function EditorSkeleton(): React.JSX.Element {
  return (
    <div className="border rounded-md bg-muted/50 min-h-[200px]">
      <div className="h-10 border-b bg-muted/30" />
      <div className="p-3 text-muted-foreground text-sm">Loading editor...</div>
    </div>
  );
}

// Dynamically import TiptapEditor to avoid SSR issues with ProseMirror
const TiptapEditor = dynamic(
  () =>
    import("@/components/editor/TiptapEditor").then((mod) => mod.TiptapEditor),
  { ssr: false, loading: () => <EditorSkeleton /> }
);

// Dynamically import ArticleTiptapEditor
const ArticleTiptapEditor = dynamic(
  () =>
    import("@/components/editor/ArticleTiptapEditor").then(
      (mod) => mod.ArticleTiptapEditor
    ),
  { ssr: false, loading: () => <EditorSkeleton /> }
);

interface RichTextEditorProps {
  content: RichTextContent;
  onChange: (content: RichTextContent) => void;
  disabled?: boolean;
  siteId: string;
  editorMode?: EditorMode;
}

export function RichTextEditor({
  content,
  onChange,
  disabled,
  siteId,
  editorMode = "all",
}: RichTextEditorProps): React.JSX.Element {
  const [pendingMode, setPendingMode] = useState<RichTextMode | null>(null);
  const showContent = editorMode === "all" || editorMode === "content";
  const showLayout = editorMode === "all" || editorMode === "layout";

  const mode = content.mode ?? "visual";

  const handleModeChange = (newMode: RichTextMode): void => {
    if (newMode === mode) return;

    // Check if there's content that would be converted
    const hasContent =
      mode === "markdown"
        ? Boolean(content.markdown?.trim())
        : Boolean(content.body?.trim() && content.body !== "<p></p>");

    if (hasContent) {
      setPendingMode(newMode);
    } else {
      // No content to convert, switch directly
      onChange({ ...content, mode: newMode });
    }
  };

  const confirmModeChange = (): void => {
    if (!pendingMode) return;
    const converted = convertContent(content, pendingMode);
    onChange(converted);
    setPendingMode(null);
  };

  const handleBodyChange = (html: string): void => {
    onChange({ ...content, body: html });
  };

  const handleMarkdownChange = (md: string): void => {
    onChange({ ...content, markdown: md });
  };

  return (
    <div className="space-y-6">
      {/* Mode Selector & Content Editor */}
      {showContent && (
        <>
          {/* Mode Tabs */}
          <div className="space-y-2">
            <Label>Editor Mode</Label>
            <Tabs
              value={mode}
              onValueChange={(v) => handleModeChange(v as RichTextMode)}
            >
              <TabsList className="w-full">
                <TabsTrigger
                  value="visual"
                  className={cn(
                    "flex-1",
                    mode === "visual" && "data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-400"
                  )}
                  disabled={disabled}
                >
                  Visual
                </TabsTrigger>
                <TabsTrigger
                  value="markdown"
                  className={cn(
                    "flex-1",
                    mode === "markdown" && "data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-400"
                  )}
                  disabled={disabled}
                >
                  Markdown
                </TabsTrigger>
                <TabsTrigger
                  value="article"
                  className={cn(
                    "flex-1",
                    mode === "article" && "data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-700 dark:data-[state=active]:text-purple-400"
                  )}
                  disabled={disabled}
                >
                  Article
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Mode-specific content editor */}
          <div className="space-y-2">
            <Label>Content</Label>

            {mode === "visual" && (
              <TiptapEditor
                value={content.body ?? ""}
                onChange={handleBodyChange}
                placeholder="Enter your text content..."
                disabled={disabled}
              />
            )}

            {mode === "markdown" && (
              <MarkdownInput
                value={content.markdown ?? ""}
                onChange={handleMarkdownChange}
                disabled={disabled}
              />
            )}

            {mode === "article" && (
              <>
                <p className="text-xs text-muted-foreground">
                  Use the image button in the toolbar to add inline images that
                  text will wrap around.
                </p>
                <ArticleTiptapEditor
                  value={content.body ?? ""}
                  onChange={handleBodyChange}
                  siteId={siteId}
                  placeholder="Write your article content here..."
                  disabled={disabled}
                  imageRounding={content.imageRounding ?? "medium"}
                />
              </>
            )}
          </div>
        </>
      )}

      {/* Styling Controls */}
      {showLayout && (
        <StylingControls
          content={content}
          onChange={onChange}
          disabled={disabled}
          siteId={siteId}
          showLayoutPanel
          textSizeDescription="Scales all text including headings proportionally."
        >
          {/* Article-only: Image Rounding Panel */}
          {mode === "article" && (
            <div className="space-y-4 rounded-lg border p-4">
              <Label className="text-xs uppercase text-muted-foreground tracking-wide">
                Images
              </Label>

              <div className="space-y-2">
                <Label>Image Corners</Label>
                <Select
                  value={content.imageRounding ?? "medium"}
                  onValueChange={(v) =>
                    onChange({
                      ...content,
                      imageRounding: v as TextBorderRadius,
                    })
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
          )}
        </StylingControls>
      )}

      {/* Mode Change Confirmation Dialog */}
      <AlertDialog open={!!pendingMode} onOpenChange={() => setPendingMode(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Editor Mode?</AlertDialogTitle>
            <AlertDialogDescription>
              Switching from <strong>{mode}</strong> to{" "}
              <strong>{pendingMode}</strong> will convert your content. Some
              formatting may be lost in the conversion.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmModeChange}>
              Convert & Switch
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// =============================================================================
// Markdown Input Component (extracted from MarkdownEditor)
// =============================================================================

interface MarkdownInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

function MarkdownInput({
  value,
  onChange,
  disabled,
}: MarkdownInputProps): React.JSX.Element {
  const preview = (
    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
      {value || "*No content yet*"}
    </ReactMarkdown>
  );

  return (
    <>
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
              value={value}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
              rows={20}
              className="font-mono text-sm"
              placeholder="Write your markdown here..."
            />
          </TabsContent>
          <TabsContent value="preview" className="mt-2">
            <div className="border rounded-md p-4 min-h-[300px] prose prose-sm dark:prose-invert max-w-none overflow-auto bg-background">
              {preview}
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
            value={value}
            onChange={(e) => onChange(e.target.value)}
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
            {preview}
          </div>
        </div>
      </div>
    </>
  );
}
