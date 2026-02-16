"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
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

interface TiptapEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Pretty-print HTML with proper indentation for readability.
 */
function formatHtml(html: string): string {
  if (!html || html.trim() === "") return "";

  // Block-level tags that should have line breaks
  const blockTags = ["p", "h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "li", "blockquote", "pre", "div", "hr", "br"];

  let formatted = html;
  let indent = 0;
  const indentStr = "  "; // 2 spaces

  // Add newlines before and after block tags
  blockTags.forEach((tag) => {
    // Opening tags (not self-closing)
    formatted = formatted.replace(
      new RegExp(`<${tag}([^>]*)>`, "gi"),
      (_match) => `\n${indentStr.repeat(indent)}<${tag}$1>`
    );
    // Closing tags
    formatted = formatted.replace(
      new RegExp(`</${tag}>`, "gi"),
      `</${tag}>\n`
    );
  });

  // Handle self-closing tags like <br> and <hr>
  formatted = formatted.replace(/<(br|hr)\s*\/?>/gi, "<$1>\n");

  // Clean up multiple newlines
  formatted = formatted.replace(/\n{3,}/g, "\n\n");

  // Proper indentation for nested structures
  const lines = formatted.split("\n");
  const result: string[] = [];
  indent = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Check for closing tags to decrease indent first
    const closingMatch = trimmed.match(/^<\/(ul|ol|li|blockquote|div)>/i);
    if (closingMatch) {
      indent = Math.max(0, indent - 1);
    }

    result.push(indentStr.repeat(indent) + trimmed);

    // Check for opening tags to increase indent for next line
    const openingMatch = trimmed.match(/^<(ul|ol|blockquote|div)(\s|>)/i);
    const selfClosingOrWithClose = /<\/(ul|ol|blockquote|div)>$/i.test(trimmed);
    if (openingMatch && !selfClosingOrWithClose) {
      indent++;
    }
  }

  return result.join("\n").trim();
}

/**
 * Normalize content to proper HTML paragraphs.
 * - Plain text with newlines becomes separate <p> tags
 * - HTML content with <br> tags gets split into separate paragraphs
 * - Already properly structured HTML is returned as-is
 */
function normalizeContent(content: string): string {
  if (!content || content.trim() === "") {
    return "";
  }

  // Check if content already has HTML block tags
  const hasHtmlBlocks = /<(p|h[1-6]|ul|ol|li|blockquote|div)[\s>]/i.test(content);

  if (hasHtmlBlocks) {
    // Content has HTML structure, but check if we need to split <br> into paragraphs
    // If a <p> tag contains multiple <br>, split them into separate paragraphs
    return content.replace(
      /<p>([^<]*(?:<(?!\/p>)[^<]*)*)<\/p>/gi,
      (match, inner) => {
        // Check if this paragraph has <br> tags
        if (/<br\s*\/?>/i.test(inner)) {
          // Split on <br> and create separate paragraphs
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

  // Convert plain text to paragraphs
  // Split on newlines for paragraph breaks
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

/**
 * TipTap extension that auto-converts pasted markdown to HTML.
 * Detects when plain-text markdown is pasted (e.g. from AI tools)
 * and converts it to proper HTML with headings, lists, etc.
 */
const MarkdownPaste = Extension.create({
  name: "markdownPaste",

  addProseMirrorPlugins() {
    const tiptapEditor = this.editor;
    return [
      new Plugin({
        key: new PluginKey("markdownPaste"),
        props: {
          handlePaste: (_view, event) => {
            const clipboardText = event.clipboardData?.getData("text/plain") || "";
            const clipboardHtml = event.clipboardData?.getData("text/html") || "";

            // Only auto-convert when pasted content is plain text (no rich HTML)
            // Rich HTML from browsers/apps will have formatting tags
            const hasRichFormatting = clipboardHtml &&
              /<(h[1-6]|strong|em|ul|ol|li|blockquote|pre|code|table)[>\s]/i.test(clipboardHtml);

            if (clipboardText && !hasRichFormatting && detectMarkdown(clipboardText)) {
              const html = convertMarkdownToHtml(clipboardText);

              // If editor is empty, replace all content; otherwise insert at cursor
              if (tiptapEditor.isEmpty || tiptapEditor.getText().trim() === "") {
                tiptapEditor.commands.setContent(html);
              } else {
                tiptapEditor.commands.insertContent(html);
              }
              return true;
            }
            return false;
          },
        },
      }),
    ];
  },
});

export function TiptapEditor({
  value,
  onChange,
  placeholder = "Enter your content...",
  disabled = false,
  className,
}: TiptapEditorProps) {
  const [linkUrl, setLinkUrl] = useState("");
  const [linkPopoverOpen, setLinkPopoverOpen] = useState(false);
  const [showMarkdownBanner, setShowMarkdownBanner] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [htmlMode, setHtmlMode] = useState(false);
  const [htmlSource, setHtmlSource] = useState("");
  const lastCheckedContent = useRef<string>("");

  // Normalize content on initial load
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
      Placeholder.configure({
        placeholder,
      }),
      MarkdownPaste,
    ],
    content: normalizedValue,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);

      // Check for markdown patterns if banner hasn't been dismissed
      // and content has meaningfully changed
      if (!bannerDismissed && html !== lastCheckedContent.current) {
        lastCheckedContent.current = html;
        // Get the plain text to check for markdown
        const text = editor.getText();
        const hasMarkdown = detectMarkdown(text);
        setShowMarkdownBanner(hasMarkdown);
      }
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm max-w-none focus:outline-none min-h-[150px] px-3 py-2",
          "prose-headings:font-semibold prose-h2:text-xl prose-h3:text-lg",
          "prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0",
          "prose-ul:list-disc prose-ul:pl-6 prose-ol:list-decimal prose-ol:pl-6",
          "prose-blockquote:border-l-2 prose-blockquote:border-muted-foreground prose-blockquote:pl-4 prose-blockquote:italic"
        ),
      },
    },
  });

  // Sync external value changes
  useEffect(() => {
    if (editor && normalizedValue !== editor.getHTML()) {
      editor.commands.setContent(normalizedValue);
    }
  }, [normalizedValue, editor]);

  // Sync HTML source when switching to HTML mode (formatted for readability)
  useEffect(() => {
    if (htmlMode && editor) {
      setHtmlSource(formatHtml(editor.getHTML()));
    }
  }, [htmlMode, editor]);

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
  const handleHtmlSourceChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setHtmlSource(e.target.value);
    },
    []
  );

  // Apply HTML changes without leaving HTML mode
  const applyHtmlChanges = useCallback(() => {
    if (editor) {
      editor.commands.setContent(htmlSource);
      onChange(htmlSource);
    }
  }, [editor, htmlSource, onChange]);

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

  // Handle markdown conversion
  const handleConvertMarkdown = useCallback(() => {
    if (!editor) return;

    // Get the plain text content
    const text = editor.getText();

    // Convert markdown to HTML
    const html = convertMarkdownToHtml(text);

    // Set the converted content
    editor.commands.setContent(html);

    // Update parent with new content
    onChange(html);

    // Hide the banner
    setShowMarkdownBanner(false);
    setBannerDismissed(true);
  }, [editor, onChange]);

  // Handle banner dismissal
  const handleDismissBanner = useCallback(() => {
    setShowMarkdownBanner(false);
    setBannerDismissed(true);
  }, []);

  if (!editor) {
    return (
      <div className={cn("border rounded-md bg-muted/50 min-h-[200px]", className)}>
        <div className="h-10 border-b bg-muted/30" />
        <div className="p-3 text-muted-foreground text-sm">Loading editor...</div>
      </div>
    );
  }

  return (
    <div className={cn("border rounded-md overflow-hidden", className)}>
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

      {/* Editor List Styles - ensures bullets/numbers show in editor */}
      <style dangerouslySetInnerHTML={{ __html: `
        .ProseMirror ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }
        .ProseMirror ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }
        .ProseMirror li {
          display: list-item;
        }
        .ProseMirror li p {
          margin: 0;
        }
      `}} />

      {/* Editor Content or HTML Source */}
      {htmlMode ? (
        <div className="p-2 space-y-2">
          <Textarea
            value={htmlSource}
            onChange={handleHtmlSourceChange}
            className="min-h-[200px] font-mono text-sm"
            placeholder="<p>Enter HTML here...</p>"
            disabled={disabled}
          />
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                if (editor) {
                  setHtmlSource(formatHtml(editor.getHTML()));
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
}: ToolbarButtonProps) {
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
