import { cn } from "@/lib/utils";

interface BlogPostExcerptProps {
  paragraphs: string[];
  truncated?: boolean;
  className?: string;
  light?: boolean;
}

/**
 * Shared blog post excerpt component with paragraph support
 * Renders truncated content with proper paragraph spacing
 * Used by BlogBlock (featured mode) and legacy BlogFeaturedBlock
 */
export function BlogPostExcerpt({
  paragraphs,
  truncated = false,
  className,
  light = false,
}: BlogPostExcerptProps): React.ReactElement {
  const textColor = light
    ? "rgba(255, 255, 255, 0.9)"
    : "var(--color-muted-foreground)";

  // Single paragraph rendering
  if (paragraphs.length <= 1) {
    return (
      <p
        className={cn("text-lg leading-relaxed", className)}
        style={{
          color: textColor,
          fontFamily: "var(--font-body)",
        }}
      >
        {paragraphs[0] || ""}
        {truncated && "..."}
      </p>
    );
  }

  // Multiple paragraphs with proper spacing
  return (
    <div
      className={cn("space-y-4", className)}
      style={{
        color: textColor,
        fontFamily: "var(--font-body)",
      }}
    >
      {paragraphs.map((para, index) => (
        <p key={index} className="text-lg leading-relaxed">
          {para}
          {truncated && index === paragraphs.length - 1 && "..."}
        </p>
      ))}
    </div>
  );
}

interface BlogPostContentFullProps {
  html: string;
  className?: string;
}

/**
 * Full HTML content renderer with prose styling
 * Used when showFullContent is enabled in featured mode
 */
export function BlogPostContentFull({
  html,
  className,
}: BlogPostContentFullProps): React.ReactElement {
  return (
    <div
      className={cn(
        "prose prose-lg max-w-none",
        "[&_p]:mb-4 [&_p]:mt-0 [&_p:last-child]:mb-0",
        "[&_h2]:mt-8 [&_h2]:mb-4 [&_h3]:mt-6 [&_h3]:mb-3",
        "[&_ul]:my-4 [&_ol]:my-4 [&_blockquote]:my-6",
        className
      )}
      style={
        {
          "--tw-prose-body": "var(--color-foreground)",
          "--tw-prose-headings": "var(--color-foreground)",
          "--tw-prose-lead": "var(--color-muted-foreground)",
          "--tw-prose-links": "var(--color-primary)",
          "--tw-prose-bold": "var(--color-foreground)",
          "--tw-prose-counters": "var(--color-muted-foreground)",
          "--tw-prose-bullets": "var(--color-muted-foreground)",
          "--tw-prose-hr": "var(--color-border)",
          "--tw-prose-quotes": "var(--color-foreground)",
          "--tw-prose-quote-borders": "var(--color-primary)",
          "--tw-prose-captions": "var(--color-muted-foreground)",
          "--tw-prose-code": "var(--color-foreground)",
          "--tw-prose-pre-code": "var(--color-foreground)",
          "--tw-prose-pre-bg": "var(--color-muted)",
          "--tw-prose-th-borders": "var(--color-border)",
          "--tw-prose-td-borders": "var(--color-border)",
          fontFamily: "var(--font-body)",
        } as React.CSSProperties
      }
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
