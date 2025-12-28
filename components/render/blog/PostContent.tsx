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
      className="prose prose-lg max-w-none"
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
