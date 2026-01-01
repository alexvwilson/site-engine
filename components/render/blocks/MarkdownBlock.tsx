import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSanitize from "rehype-sanitize";
import type { ThemeData } from "@/lib/drizzle/schema/theme-types";
import type { MarkdownContent } from "@/lib/section-types";

// Import highlight.js theme for syntax highlighting
import "highlight.js/styles/github.css";

interface MarkdownBlockProps {
  content: MarkdownContent;
  theme: ThemeData;
}

function hexToRgba(hex: string, opacity: number): string {
  const cleanHex = hex.replace("#", "");
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

const BORDER_WIDTHS: Record<string, string> = {
  thin: "1px",
  medium: "2px",
  thick: "4px",
};

const BORDER_RADII: Record<string, string> = {
  none: "0",
  small: "4px",
  medium: "8px",
  large: "16px",
  full: "9999px",
};

const CONTENT_WIDTHS: Record<string, string> = {
  narrow: "max-w-3xl",
  medium: "max-w-5xl",
  full: "max-w-7xl",
};

const TEXT_SIZES: Record<string, { body: string; h1: string; h2: string; h3: string }> = {
  small: { body: "0.875rem", h1: "1.75rem", h2: "1.5rem", h3: "1.25rem" },
  normal: { body: "1rem", h1: "2.25rem", h2: "1.875rem", h3: "1.5rem" },
  large: { body: "1.125rem", h1: "2.75rem", h2: "2.25rem", h3: "1.875rem" },
};

export function MarkdownBlock({ content, theme }: MarkdownBlockProps) {
  if (!content.markdown?.trim()) {
    return null;
  }

  const enableStyling = content.enableStyling ?? false;
  const textSizes = TEXT_SIZES[content.textSize ?? "normal"];

  // Highlight.js styles for code blocks
  const codeStyles = `
    .markdown-block pre {
      background: var(--color-muted);
      border-radius: 8px;
      padding: 1rem;
      overflow-x: auto;
      margin: 1rem 0;
    }
    .markdown-block code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 0.875em;
    }
    .markdown-block :not(pre) > code {
      background: var(--color-muted);
      padding: 0.2em 0.4em;
      border-radius: 4px;
    }
    .markdown-block table {
      width: 100%;
      border-collapse: collapse;
      margin: 1rem 0;
    }
    .markdown-block th,
    .markdown-block td {
      border: 1px solid var(--color-border);
      padding: 0.5rem 1rem;
      text-align: left;
    }
    .markdown-block th {
      background: var(--color-muted);
      font-weight: 600;
    }
    .markdown-block input[type="checkbox"] {
      margin-right: 0.5rem;
    }
  `;

  // ============================================================================
  // PLAIN MODE (styling disabled)
  // ============================================================================
  if (!enableStyling) {
    const plainProseStyles = `
      .markdown-block-plain {
        font-family: var(--font-body);
        font-size: ${textSizes.body};
        color: var(--color-foreground);
        line-height: ${theme.typography.lineHeights.relaxed};
      }
      .markdown-block-plain > *:first-child {
        margin-top: 0;
      }
      .markdown-block-plain h1 {
        font-family: var(--font-heading);
        font-size: ${textSizes.h1};
        font-weight: 700;
        margin-top: 1.5em;
        margin-bottom: 0.5em;
        color: var(--color-foreground);
      }
      .markdown-block-plain h1:first-child {
        margin-top: 0;
      }
      .markdown-block-plain h2 {
        font-family: var(--font-heading);
        font-size: ${textSizes.h2};
        font-weight: 600;
        margin-top: 1.5em;
        margin-bottom: 0.5em;
        color: var(--color-foreground);
      }
      .markdown-block-plain h2:first-child {
        margin-top: 0;
      }
      .markdown-block-plain h3 {
        font-family: var(--font-heading);
        font-size: ${textSizes.h3};
        font-weight: 600;
        margin-top: 1.25em;
        margin-bottom: 0.5em;
        color: var(--color-foreground);
      }
      .markdown-block-plain h3:first-child {
        margin-top: 0;
      }
      .markdown-block-plain p {
        margin-top: 1em;
        margin-bottom: 1em;
      }
      .markdown-block-plain p:first-child {
        margin-top: 0;
      }
      .markdown-block-plain a {
        color: var(--color-primary);
        text-decoration: underline;
      }
      .markdown-block-plain blockquote {
        border-left: 2px solid var(--color-primary);
        padding-left: 1rem;
        font-style: italic;
        color: var(--color-muted-foreground);
        margin: 1rem 0;
      }
      .markdown-block-plain ul, .markdown-block-plain ol {
        padding-left: 1.5rem;
        margin: 1rem 0;
      }
      .markdown-block-plain li {
        margin: 0.25rem 0;
      }
      .markdown-block-plain hr {
        border: 0;
        border-top: 1px solid var(--color-border);
        margin: 2rem 0;
      }
      .markdown-block-plain img {
        max-width: 100%;
        height: auto;
        border-radius: 8px;
      }
    `;

    return (
      <section
        className="py-12 px-6"
        style={{ backgroundColor: "var(--color-background)" }}
      >
        <style dangerouslySetInnerHTML={{ __html: plainProseStyles + codeStyles }} />
        <div className="max-w-3xl mx-auto">
          <div className="markdown-block markdown-block-plain max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight, rehypeSanitize]}
            >
              {content.markdown}
            </ReactMarkdown>
          </div>
        </div>
      </section>
    );
  }

  // ============================================================================
  // STYLED MODE (styling enabled)
  // ============================================================================

  const showBorder = content.showBorder ?? false;
  const borderWidth = BORDER_WIDTHS[content.borderWidth ?? "medium"];
  const borderRadius = BORDER_RADII[content.borderRadius ?? "medium"];
  const borderColor = content.borderColor || "var(--color-primary)";
  const useThemeBackground = content.useThemeBackground ?? true;
  const boxBgOpacity = (content.boxBackgroundOpacity ?? 100) / 100;
  const contentWidthClass = CONTENT_WIDTHS[content.contentWidth ?? "narrow"];

  const hasBackgroundImage = Boolean(
    content.backgroundImage && content.backgroundImage.trim() !== ""
  );

  const overlayColor = content.overlayColor || "#000000";
  const overlayOpacity = (content.overlayOpacity ?? 0) / 100;
  const overlayRgba = hexToRgba(overlayColor, overlayOpacity);

  const textColorMode = content.textColorMode ?? "auto";

  const sectionStyles: React.CSSProperties = {
    backgroundColor: hasBackgroundImage ? undefined : "var(--color-background)",
    backgroundImage: hasBackgroundImage
      ? `url(${content.backgroundImage})`
      : undefined,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

  const getBoxBackgroundColor = (): string | undefined => {
    if (!showBorder) return undefined;

    if (useThemeBackground && !content.boxBackgroundColor) {
      return boxBgOpacity < 1 ? undefined : "var(--color-background)";
    }

    if (content.boxBackgroundColor) {
      return hexToRgba(content.boxBackgroundColor, boxBgOpacity);
    }

    return undefined;
  };

  const containerStyles: React.CSSProperties = showBorder
    ? {
        border: `${borderWidth} solid ${borderColor}`,
        borderRadius: borderRadius,
        padding: "1.5rem",
        backgroundColor: getBoxBackgroundColor(),
      }
    : {};

  const getTextColors = (): { text: string; link: string; muted: string } => {
    if (textColorMode === "light") {
      return {
        text: "#FFFFFF",
        link: "#FFFFFF",
        muted: "rgba(255, 255, 255, 0.9)",
      };
    } else if (textColorMode === "dark") {
      return {
        text: "#1F2937",
        link: "#2563EB",
        muted: "#6B7280",
      };
    } else {
      if (hasBackgroundImage) {
        return {
          text: "#FFFFFF",
          link: "#FFFFFF",
          muted: "rgba(255, 255, 255, 0.9)",
        };
      }
      return {
        text: "var(--color-foreground)",
        link: "var(--color-primary)",
        muted: "var(--color-muted-foreground)",
      };
    }
  };

  const colors = getTextColors();
  const textColor = colors.text;
  const linkColor = colors.link;
  const mutedColor = colors.muted;

  const styledProseStyles = `
    .markdown-block-styled {
      font-family: var(--font-body);
      font-size: ${textSizes.body};
      color: ${textColor};
      line-height: ${theme.typography.lineHeights.relaxed};
    }
    .markdown-block-styled > *:first-child {
      margin-top: 0;
    }
    .markdown-block-styled h1 {
      font-family: var(--font-heading);
      font-size: ${textSizes.h1};
      font-weight: 700;
      margin-top: 1.5em;
      margin-bottom: 0.5em;
      color: ${textColor};
    }
    .markdown-block-styled h1:first-child {
      margin-top: 0;
    }
    .markdown-block-styled h2 {
      font-family: var(--font-heading);
      font-size: ${textSizes.h2};
      font-weight: 600;
      margin-top: 1.5em;
      margin-bottom: 0.5em;
      color: ${textColor};
    }
    .markdown-block-styled h2:first-child {
      margin-top: 0;
    }
    .markdown-block-styled h3 {
      font-family: var(--font-heading);
      font-size: ${textSizes.h3};
      font-weight: 600;
      margin-top: 1.25em;
      margin-bottom: 0.5em;
      color: ${textColor};
    }
    .markdown-block-styled h3:first-child {
      margin-top: 0;
    }
    .markdown-block-styled p {
      margin-top: 1em;
      margin-bottom: 1em;
    }
    .markdown-block-styled p:first-child {
      margin-top: 0;
    }
    .markdown-block-styled a {
      color: ${linkColor};
      text-decoration: underline;
    }
    .markdown-block-styled blockquote {
      border-left: 2px solid ${linkColor};
      padding-left: 1rem;
      font-style: italic;
      color: ${mutedColor};
      margin: 1rem 0;
    }
    .markdown-block-styled ul, .markdown-block-styled ol {
      padding-left: 1.5rem;
      margin: 1rem 0;
    }
    .markdown-block-styled li {
      margin: 0.25rem 0;
    }
    .markdown-block-styled hr {
      border: 0;
      border-top: 1px solid var(--color-border);
      margin: 2rem 0;
    }
    .markdown-block-styled img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
    }
  `;

  return (
    <section className="relative py-12 px-6" style={sectionStyles}>
      {/* Overlay layer */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: overlayRgba }}
      />

      <style dangerouslySetInnerHTML={{ __html: styledProseStyles + codeStyles }} />

      {/* Content container */}
      <div
        className={`relative z-10 mx-auto ${contentWidthClass}`}
        style={containerStyles}
      >
        <div className="markdown-block markdown-block-styled max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight, rehypeSanitize]}
          >
            {content.markdown}
          </ReactMarkdown>
        </div>
      </div>
    </section>
  );
}
