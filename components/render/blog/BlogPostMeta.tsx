import { formatBlogDate } from "@/lib/blog-utils";
import { cn } from "@/lib/utils";

interface BlogPostMetaProps {
  authorName?: string | null;
  publishedAt?: Date | string | null;
  showAuthor?: boolean;
  showDate?: boolean;
  light?: boolean;
  className?: string;
}

/**
 * Shared blog post metadata component (author + date)
 * Used by BlogBlock (both featured and grid modes) and legacy blog blocks
 */
export function BlogPostMeta({
  authorName,
  publishedAt,
  showAuthor = true,
  showDate = true,
  light = false,
  className,
}: BlogPostMetaProps): React.ReactElement | null {
  const formattedDate = formatBlogDate(publishedAt);

  // Don't render if nothing to show
  if ((!showAuthor || !authorName) && (!showDate || !formattedDate)) {
    return null;
  }

  return (
    <div
      className={cn("flex items-center gap-2 text-sm", className)}
      style={{
        color: light ? "rgba(255, 255, 255, 0.8)" : "var(--color-muted-foreground)",
      }}
    >
      {showAuthor && authorName && (
        <>
          <span>{authorName}</span>
          {showDate && formattedDate && <span>•</span>}
        </>
      )}
      {showDate && formattedDate && <time>{formattedDate}</time>}
    </div>
  );
}
