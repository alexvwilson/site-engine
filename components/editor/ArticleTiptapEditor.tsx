"use client";

import { useEditor, EditorContent, ReactNodeViewRenderer } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { ArticleImageNodeView } from "./ArticleImageNodeView";
import { useState, useCallback, useEffect, useRef } from "react";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Undo,
  Redo,
  Unlink,
  ImageIcon,
  AlertCircle,
  X,
  Code,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { detectMarkdown, convertMarkdownToHtml } from "@/lib/markdown-utils";
import { ImageInsertModal } from "./ImageInsertModal";
import type { ArticleImageAlignment, ArticleImageWidth } from "@/lib/section-types";

interface ArticleTiptapEditorProps {
  value: string;
  onChange: (html: string) => void;
  siteId: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  imageRounding?: string;
}

/**
 * Normalize content to proper HTML paragraphs.
 */
function normalizeContent(content: string): string {
  if (!content || content.trim() === "") {
    return "";
  }

  const hasHtmlBlocks = /<(p|h[1-6]|ul|ol|li|blockquote|div|img)[\s>]/i.test(content);

  if (hasHtmlBlocks) {
    return content.replace(
      /<p>([^<]*(?:<(?!\/p>)[^<]*)*)<\/p>/gi,
      (match, inner) => {
        if (/<br\s*\/?>/i.test(inner)) {
          const parts = inner.split(/<br\s*\/?>/i);
          return parts
            .map((part: string) => part.trim())
            .filter((part: string) => part.length > 0)
            .map((part: string) => `<p>${part}</p>`)
            .join("");
        }
        return match;
      }
    );
  }

  const paragraphs = content
    .split(/\n+/)
    .map((para) => {
      const trimmed = para.trim();
      if (!trimmed) return "";
      return `<p>${trimmed}</p>`;
    })
    .filter(Boolean);

  return paragraphs.join("");
}

// Custom Image extension with alignment and width attributes
const ArticleImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      alignment: {
        default: "center",
        parseHTML: (element) => element.getAttribute("data-alignment") || "center",
        renderHTML: (attributes) => ({
          "data-alignment": attributes.alignment,
        }),
      },
      width: {
        default: 50,
        parseHTML: (element) => parseInt(element.getAttribute("data-width") || "50"),
        renderHTML: (attributes) => ({
          "data-width": attributes.width,
          style: `width: ${attributes.width}%`,
        }),
      },
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(ArticleImageNodeView);
  },
});

// Border radius mappings (matching ArticleBlock.tsx)
const BORDER_RADII: Record<string, string> = {
  none: "0",
  small: "4px",
  medium: "8px",
  large: "16px",
  full: "9999px",
};

export function ArticleTiptapEditor({
  value,
  onChange,
  siteId,
  placeholder = "Write your article content...",
  disabled = false,
  className,
  imageRounding = "medium",
}: ArticleTiptapEditorProps): React.JSX.Element {
  const [linkUrl, setLinkUrl] = useState("");
  const [linkPopoverOpen, setLinkPopoverOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [showMarkdownBanner, setShowMarkdownBanner] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [htmlMode, setHtmlMode] = useState(false);
  const [htmlSource, setHtmlSource] = useState("");
  const lastCheckedContent = useRef<string>("");

  const normalizedValue = normalizeContent(value);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline",
        },
      }),
      ArticleImage.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: {
          class: "article-inline-image",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: normalizedValue,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);

      if (!bannerDismissed && html !== lastCheckedContent.current) {
        lastCheckedContent.current = html;
        const text = editor.getText();
        const hasMarkdown = detectMarkdown(text);
        setShowMarkdownBanner(hasMarkdown);
      }
    },
  });

  useEffect(() => {
    if (editor && normalizedValue !== editor.getHTML()) {
      editor.commands.setContent(normalizedValue);
    }
  }, [normalizedValue, editor]);

  // Sync HTML source when switching to HTML mode
  useEffect(() => {
    if (htmlMode && editor) {
      setHtmlSource(editor.getHTML());
    }
  }, [htmlMode, editor]);

  const setLink = useCallback(() => {
    if (!editor || !linkUrl) return;

    if (linkUrl === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: linkUrl })
        .run();
    }

    setLinkUrl("");
    setLinkPopoverOpen(false);
  }, [editor, linkUrl]);

  const openLinkPopover = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href || "";
    setLinkUrl(previousUrl);
    setLinkPopoverOpen(true);
  }, [editor]);

  const handleImageInsert = useCallback(
    (src: string, alt: string, alignment: ArticleImageAlignment, width: ArticleImageWidth) => {
      if (!editor) return;
      // Use insertContent to properly insert at cursor position without replacing
      editor
        .chain()
        .focus()
        .insertContent({
          type: "image",
          attrs: {
            src,
            alt,
            alignment,
            width,
          },
        })
        .run();
      setImageModalOpen(false);
    },
    [editor]
  );

  const handleConvertMarkdown = useCallback(() => {
    if (!editor) return;
    const text = editor.getText();
    const html = convertMarkdownToHtml(text);
    editor.commands.setContent(html);
    onChange(html);
    setShowMarkdownBanner(false);
    setBannerDismissed(true);
  }, [editor, onChange]);

  const handleDismissBanner = useCallback(() => {
    setShowMarkdownBanner(false);
    setBannerDismissed(true);
  }, []);

  // Toggle HTML mode
  const toggleHtmlMode = useCallback(() => {
    if (htmlMode && editor) {
      // Switching from HTML to visual - apply changes
      editor.commands.setContent(htmlSource);
      onChange(htmlSource);
    }
    setHtmlMode(!htmlMode);
  }, [htmlMode, htmlSource, editor, onChange]);

  // Handle HTML source changes
  const handleHtmlSourceChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setHtmlSource(e.target.value);
  }, []);

  // Apply HTML changes without leaving HTML mode
  const applyHtmlChanges = useCallback(() => {
    if (editor) {
      editor.commands.setContent(htmlSource);
      onChange(htmlSource);
    }
  }, [editor, htmlSource, onChange]);

  if (!editor) {
    return (
      <div className={cn("border rounded-md bg-muted/50 min-h-[250px]", className)}>
        <div className="h-10 border-b bg-muted/30" />
        <div className="p-3 text-muted-foreground text-sm">Loading editor...</div>
      </div>
    );
  }

  const roundingValue = BORDER_RADII[imageRounding] || BORDER_RADII.medium;

  return (
    <div
      className={cn("border rounded-md overflow-hidden", className)}
      style={{ "--article-image-rounding": roundingValue } as React.CSSProperties}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-1 border-b bg-muted/30">
        {/* Text Formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          disabled={disabled || htmlMode}
          title="Bold (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          disabled={disabled || htmlMode}
          title="Italic (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Headings */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
          disabled={disabled || htmlMode}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive("heading", { level: 3 })}
          disabled={disabled || htmlMode}
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Lists */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          disabled={disabled || htmlMode}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          disabled={disabled || htmlMode}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Blockquote */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          disabled={disabled || htmlMode}
          title="Quote"
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>

        {/* Link */}
        <Popover open={linkPopoverOpen} onOpenChange={setLinkPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={openLinkPopover}
              disabled={disabled || htmlMode}
              className={cn(
                "h-8 w-8 p-0",
                editor.isActive("link") && "bg-muted"
              )}
              title="Add Link"
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="start">
            <div className="space-y-3">
              <Label htmlFor="link-url">Link URL</Label>
              <Input
                id="link-url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    setLink();
                  }
                }}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={setLink}>
                  {editor.isActive("link") ? "Update" : "Add"} Link
                </Button>
                {editor.isActive("link") && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      editor.chain().focus().unsetLink().run();
                      setLinkPopoverOpen(false);
                    }}
                  >
                    <Unlink className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Image Button */}
        <ToolbarButton
          onClick={() => setImageModalOpen(true)}
          disabled={disabled || htmlMode}
          title="Insert Image"
        >
          <ImageIcon className="h-4 w-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Undo/Redo */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={disabled || htmlMode || !editor.can().undo()}
          title="Undo (Ctrl+Z)"
        >
          <Undo className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={disabled || htmlMode || !editor.can().redo()}
          title="Redo (Ctrl+Shift+Z)"
        >
          <Redo className="h-4 w-4" />
        </ToolbarButton>

        {/* Spacer */}
        <div className="flex-1" />

        {/* HTML Mode Toggle */}
        <ToolbarButton
          onClick={toggleHtmlMode}
          active={htmlMode}
          disabled={disabled}
          title={htmlMode ? "Switch to Visual Editor" : "Edit HTML Source"}
        >
          {htmlMode ? <Eye className="h-4 w-4" /> : <Code className="h-4 w-4" />}
        </ToolbarButton>
      </div>

      {/* Markdown Detection Banner */}
      {showMarkdownBanner && !htmlMode && (
        <div className="flex items-center justify-between gap-3 px-3 py-2 bg-amber-500/10 border-b border-amber-500/20">
          <div className="flex items-center gap-2 text-sm">
            <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
            <span className="text-amber-700 dark:text-amber-400">
              This content has special formatting.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleConvertMarkdown}
              className="h-7 text-xs border-amber-500/30 hover:bg-amber-500/10"
            >
              Convert to Text
            </Button>
            <button
              onClick={handleDismissBanner}
              className="p-1 rounded hover:bg-amber-500/20 text-amber-700 dark:text-amber-400"
              title="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* WYSIWYG Editor Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* Base prose styling */
        .ProseMirror {
          padding: 0.75rem;
          min-height: 200px;
          outline: none;
          font-size: 0.9375rem;
          line-height: 1.6;
        }

        /* Headings - WYSIWYG styling */
        .ProseMirror h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 1.25rem 0 0.5rem 0;
          color: var(--foreground);
          border-bottom: 1px solid var(--border);
          padding-bottom: 0.25rem;
        }
        .ProseMirror h2:first-child {
          margin-top: 0;
        }
        .ProseMirror h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 1rem 0 0.5rem 0;
          color: var(--foreground);
        }
        .ProseMirror h3:first-child {
          margin-top: 0;
        }

        /* Paragraphs */
        .ProseMirror p {
          margin: 0.75rem 0;
        }
        .ProseMirror p:first-child {
          margin-top: 0;
        }
        .ProseMirror p:last-child {
          margin-bottom: 0;
        }

        /* Blockquotes - WYSIWYG styling */
        .ProseMirror blockquote {
          border-left: 4px solid hsl(var(--primary));
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          color: hsl(var(--muted-foreground));
          background: hsl(var(--muted) / 0.3);
          padding: 0.75rem 1rem;
          border-radius: 0 0.375rem 0.375rem 0;
        }
        .ProseMirror blockquote p {
          margin: 0;
        }

        /* Lists */
        .ProseMirror ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin: 0.75rem 0;
        }
        .ProseMirror ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin: 0.75rem 0;
        }
        .ProseMirror li {
          display: list-item;
          margin: 0.25rem 0;
        }
        .ProseMirror li p {
          margin: 0;
        }

        /* Bold and Italic */
        .ProseMirror strong {
          font-weight: 600;
        }
        .ProseMirror em {
          font-style: italic;
        }

        /* Links */
        .ProseMirror a {
          color: hsl(var(--primary));
          text-decoration: underline;
        }

        /* Images - Float support */
        .ProseMirror .article-inline-image-wrapper[data-alignment="left"] {
          float: left;
          margin: 0 1rem 0.5rem 0;
        }
        .ProseMirror .article-inline-image-wrapper[data-alignment="right"] {
          float: right;
          margin: 0 0 0.5rem 1rem;
        }
        .ProseMirror .article-inline-image-wrapper[data-alignment="center"] {
          display: block;
          margin: 1rem auto;
          clear: both;
        }
        .ProseMirror .article-inline-image-wrapper[data-alignment="full"] {
          display: block;
          width: 100%;
          margin: 1rem 0;
          clear: both;
        }
        /* Image rounding - uses CSS variable from container */
        .ProseMirror .article-inline-image-wrapper img {
          border-radius: var(--article-image-rounding, 8px);
        }

        /* Ensure container clears all floats at the end */
        .ProseMirror::after {
          content: "";
          display: table;
          clear: both;
        }

        /* Placeholder styling */
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: hsl(var(--muted-foreground));
          pointer-events: none;
          height: 0;
        }
      `}} />

      {/* Editor Content or HTML Source */}
      {htmlMode ? (
        <div className="p-2 space-y-2">
          <Textarea
            value={htmlSource}
            onChange={handleHtmlSourceChange}
            className="min-h-[300px] font-mono text-sm"
            placeholder="<p>Enter HTML here...</p>"
            disabled={disabled}
          />
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                if (editor) {
                  setHtmlSource(editor.getHTML());
                }
              }}
            >
              Reset
            </Button>
            <Button size="sm" onClick={applyHtmlChanges}>
              Apply Changes
            </Button>
          </div>
        </div>
      ) : (
        <EditorContent editor={editor} />
      )}

      {/* Image Insert Modal */}
      <ImageInsertModal
        open={imageModalOpen}
        onOpenChange={setImageModalOpen}
        siteId={siteId}
        onInsert={handleImageInsert}
      />
    </div>
  );
}

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title?: string;
  children: React.ReactNode;
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: ToolbarButtonProps): React.JSX.Element {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className={cn("h-8 w-8 p-0", active && "bg-muted")}
      title={title}
      type="button"
    >
      {children}
    </Button>
  );
}
