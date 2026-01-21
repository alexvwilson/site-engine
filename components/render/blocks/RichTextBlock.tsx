/**
 * RichTextBlock - Unified renderer for visual, markdown, and article modes
 * Consolidates TextBlock, MarkdownBlock, and ArticleBlock
 */

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSanitize from "rehype-sanitize";
import type { ThemeData } from "@/lib/drizzle/schema/theme-types";
import type { RichTextContent } from "@/lib/section-types";
import {
  getRichTextColors,
  getBoxBackgroundColor,
  buildRichTextStyles,
} from "@/lib/richtext-utils";
import {
  hexToRgba,
  BORDER_WIDTHS,
  BORDER_RADII,
  CONTENT_WIDTHS,
} from "@/lib/styling-utils";

// Import highlight.js theme for syntax highlighting (markdown mode)
import "highlight.js/styles/github.css";

interface RichTextBlockProps {
  content: RichTextContent;
  theme: ThemeData;
}

export function RichTextBlock({
  content,
  theme,
}: RichTextBlockProps): React.JSX.Element | null {
  const mode = content.mode ?? "visual";

  // Get the actual content to render
  const htmlContent = mode === "markdown" ? null : (content.body ?? "");
  const markdownContent = mode === "markdown" ? (content.markdown ?? "") : "";

  // Handle empty content
  const isEmpty =
    mode === "markdown"
      ? !markdownContent.trim()
      : !htmlContent || htmlContent.trim() === "" || htmlContent === "<p></p>";

  if (isEmpty) return null;

  const enableStyling = content.enableStyling ?? false;
  const textSize = content.textSize ?? "normal";
  const prefix = `richtext-${mode}`;

  // ============================================================================
  // PLAIN MODE (styling disabled)
  // ============================================================================
  if (!enableStyling) {
    const colors = getRichTextColors("auto", false);
    const styles = buildRichTextStyles({
      mode,
      prefix,
      textSize,
      colors,
      lineHeight: theme.typography.lineHeights.relaxed,
      imageRounding: content.imageRounding,
    });

    return (
      <section
        className="py-12 px-6"
        style={{ backgroundColor: "var(--color-background)" }}
      >
        <style dangerouslySetInnerHTML={{ __html: styles }} />
        <div className="max-w-3xl mx-auto">
          {mode === "markdown" ? (
            <div className={`${prefix} max-w-none`}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight, rehypeSanitize]}
              >
                {markdownContent}
              </ReactMarkdown>
            </div>
          ) : (
            <div
              className={`${prefix} max-w-none`}
              dangerouslySetInnerHTML={{ __html: htmlContent! }}
            />
          )}
        </div>
      </section>
    );
  }

  // ============================================================================
  // STYLED MODE (styling enabled)
  // ============================================================================

  // Styling values with defaults
  const showBorder = content.showBorder ?? false;
  const borderWidth = BORDER_WIDTHS[content.borderWidth ?? "medium"];
  const borderRadius = BORDER_RADII[content.borderRadius ?? "medium"];
  const borderColor = content.borderColor || "var(--color-primary)";
  const boxBgOpacity = (content.boxBackgroundOpacity ?? 100) / 100;
  const contentWidthClass = CONTENT_WIDTHS[content.contentWidth ?? "narrow"];

  const hasBackgroundImage = Boolean(
    content.backgroundImage && content.backgroundImage.trim() !== ""
  );

  // Overlay
  const overlayColor = content.overlayColor || "#000000";
  const overlayOpacity = (content.overlayOpacity ?? 0) / 100;
  const overlayRgba = hexToRgba(overlayColor, overlayOpacity);

  // Text colors based on textColorMode and background
  const colors = getRichTextColors(content.textColorMode, hasBackgroundImage);

  // Section background styles
  const sectionStyles: React.CSSProperties = {
    backgroundColor: hasBackgroundImage ? undefined : "var(--color-background)",
    backgroundImage: hasBackgroundImage
      ? `url(${content.backgroundImage})`
      : undefined,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

  // Box background color
  const boxBgColor = getBoxBackgroundColor(
    showBorder,
    content.useThemeBackground ?? true,
    content.boxBackgroundColor,
    boxBgOpacity
  );

  // Container/box styles
  const containerStyles: React.CSSProperties = showBorder
    ? {
        border: `${borderWidth} solid ${borderColor}`,
        borderRadius: borderRadius,
        padding: "1.5rem",
        backgroundColor: boxBgColor,
      }
    : {};

  // Generate CSS styles
  const styles = buildRichTextStyles({
    mode,
    prefix,
    textSize,
    colors,
    lineHeight: theme.typography.lineHeights.relaxed,
    imageRounding: content.imageRounding,
  });

  return (
    <section className="relative py-12 px-6" style={sectionStyles}>
      {/* Overlay layer */}
      <div className="absolute inset-0" style={{ backgroundColor: overlayRgba }} />

      <style dangerouslySetInnerHTML={{ __html: styles }} />

      {/* Content container */}
      <div
        className={`relative z-10 mx-auto ${contentWidthClass}`}
        style={containerStyles}
      >
        {mode === "markdown" ? (
          <div className={`${prefix} max-w-none`}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight, rehypeSanitize]}
            >
              {markdownContent}
            </ReactMarkdown>
          </div>
        ) : (
          <div
            className={`${prefix} max-w-none`}
            dangerouslySetInnerHTML={{ __html: htmlContent! }}
          />
        )}
      </div>
    </section>
  );
}
