"use client";

interface PostContentProps {
  content: { html: string } | null;
}

export function PostContent({ content }: PostContentProps) {
  if (!content?.html) {
    return null;
  }

  return (
    <div
      className="prose prose-lg max-w-none [&_p]:mb-4 [&_p]:mt-0 [&_p:last-child]:mb-0 [&_h2]:mt-8 [&_h2]:mb-4 [&_h3]:mt-6 [&_h3]:mb-3 [&_ul]:my-4 [&_ol]:my-4 [&_blockquote]:my-6"
      style={{
        // Theme-aware prose styling
        "--tw-prose-body": "var(--theme-text)",
        "--tw-prose-headings": "var(--theme-text)",
        "--tw-prose-lead": "var(--theme-muted-text)",
        "--tw-prose-links": "var(--theme-primary)",
        "--tw-prose-bold": "var(--theme-text)",
        "--tw-prose-counters": "var(--theme-muted-text)",
        "--tw-prose-bullets": "var(--theme-muted-text)",
        "--tw-prose-hr": "var(--theme-border)",
        "--tw-prose-quotes": "var(--theme-text)",
        "--tw-prose-quote-borders": "var(--theme-primary)",
        "--tw-prose-captions": "var(--theme-muted-text)",
        "--tw-prose-code": "var(--theme-text)",
        "--tw-prose-pre-code": "var(--theme-text)",
        "--tw-prose-pre-bg": "var(--theme-muted)",
        "--tw-prose-th-borders": "var(--theme-border)",
        "--tw-prose-td-borders": "var(--theme-border)",
        fontFamily: "var(--theme-font-body)",
      } as React.CSSProperties}
      dangerouslySetInnerHTML={{ __html: content.html }}
    />
  );
}
