/**
 * Utilities for detecting and converting markdown content.
 * Used by the TiptapEditor to help users who paste markdown content.
 */

import { marked, type MarkedOptions } from "marked";

/**
 * Patterns that indicate markdown formatting.
 * We look for multiple patterns to avoid false positives.
 */
const MARKDOWN_PATTERNS = {
  // Headers: # Header, ## Header, ### Header
  header: /^#{1,6}\s+.+$/m,
  // Bold: **text** or __text__
  bold: /\*\*[^*]+\*\*|__[^_]+__/,
  // Italic: *text* or _text_ (not matching single chars or underscores in words)
  italic: /(?<!\*)\*(?!\*)[^*\n]+\*(?!\*)|(?<![a-zA-Z])_(?!_)[^_\n]+_(?![a-zA-Z_])/,
  // Unordered list: - item or * item (at start of line)
  unorderedList: /^[\s]*[-*]\s+.+$/m,
  // Ordered list: 1. item (at start of line)
  orderedList: /^[\s]*\d+\.\s+.+$/m,
  // Links: [text](url)
  link: /\[([^\]]+)\]\(([^)]+)\)/,
  // Blockquote: > text
  blockquote: /^>\s+.+$/m,
  // Code block: ```
  codeBlock: /```[\s\S]*?```/,
  // Inline code: `code`
  inlineCode: /`[^`]+`/,
  // Horizontal rule: --- or ***
  horizontalRule: /^(---|\*\*\*|___)$/m,
};

/**
 * Detects if content appears to contain markdown formatting.
 * Returns true if multiple markdown patterns are found, reducing false positives.
 */
export function detectMarkdown(content: string): boolean {
  if (!content || content.trim() === "") {
    return false;
  }

  // Strip any existing HTML tags to check raw content
  // This handles cases where content is already partially HTML
  const textContent = content.replace(/<[^>]*>/g, " ").trim();

  if (!textContent) {
    return false;
  }

  let matchCount = 0;
  const matchedPatterns: string[] = [];

  // Check each pattern
  for (const [name, pattern] of Object.entries(MARKDOWN_PATTERNS)) {
    if (pattern.test(textContent)) {
      matchCount++;
      matchedPatterns.push(name);
    }
  }

  // Strong indicators that almost certainly mean markdown
  const strongIndicators = ["header", "codeBlock", "link", "blockquote"];
  const hasStrongIndicator = matchedPatterns.some((p) =>
    strongIndicators.includes(p)
  );

  // If we have a strong indicator, one match is enough
  if (hasStrongIndicator) {
    return true;
  }

  // For weaker patterns (like bold/italic), require at least 2 different patterns
  // This reduces false positives from things like "*emphasis*" in normal text
  return matchCount >= 2;
}

/**
 * Configuration for the marked parser.
 * We want clean HTML output suitable for TipTap.
 */
const markedOptions: MarkedOptions = {
  gfm: true, // GitHub Flavored Markdown
  breaks: false, // Don't convert \n to <br> (TipTap handles this)
};

/**
 * Converts markdown content to clean HTML suitable for TipTap editor.
 *
 * Transformations:
 * - # Header → <h2> (TipTap only supports h2, h3)
 * - ## Header → <h2>
 * - ### Header → <h3>
 * - #### and below → <h3>
 * - Standard markdown → HTML (bold, italic, lists, links, etc.)
 */
export function convertMarkdownToHtml(markdown: string): string {
  if (!markdown || markdown.trim() === "") {
    return "";
  }

  // Configure marked
  marked.setOptions(markedOptions);

  // Parse markdown to HTML
  let html = marked.parse(markdown, { async: false }) as string;

  // TipTap only supports h2 and h3, so convert h1 to h2 and h4+ to h3
  html = html
    .replace(/<h1([^>]*)>/g, "<h2$1>")
    .replace(/<\/h1>/g, "</h2>")
    .replace(/<h4([^>]*)>/g, "<h3$1>")
    .replace(/<\/h4>/g, "</h3>")
    .replace(/<h5([^>]*)>/g, "<h3$1>")
    .replace(/<\/h5>/g, "</h3>")
    .replace(/<h6([^>]*)>/g, "<h3$1>")
    .replace(/<\/h6>/g, "</h3>");

  // Remove any trailing/leading whitespace
  html = html.trim();

  return html;
}

/**
 * Extracts plain text from HTML or markdown content.
 * Useful for previewing content without formatting.
 */
export function extractPlainText(content: string): string {
  // Remove HTML tags
  let text = content.replace(/<[^>]*>/g, " ");
  // Remove markdown formatting
  text = text
    .replace(/#{1,6}\s+/g, "") // Headers
    .replace(/\*\*([^*]+)\*\*/g, "$1") // Bold
    .replace(/__([^_]+)__/g, "$1") // Bold alt
    .replace(/\*([^*]+)\*/g, "$1") // Italic
    .replace(/_([^_]+)_/g, "$1") // Italic alt
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Links
    .replace(/`([^`]+)`/g, "$1") // Inline code
    .replace(/```[\s\S]*?```/g, "") // Code blocks
    .replace(/^>\s+/gm, "") // Blockquotes
    .replace(/^[-*]\s+/gm, "") // List items
    .replace(/^\d+\.\s+/gm, ""); // Numbered list items

  // Normalize whitespace
  text = text.replace(/\s+/g, " ").trim();

  return text;
}
