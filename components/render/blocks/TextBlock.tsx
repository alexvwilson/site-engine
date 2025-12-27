import type { ThemeData } from "@/lib/drizzle/schema/theme-types";
import type { TextContent } from "@/lib/section-types";

interface TextBlockProps {
  content: TextContent;
  theme: ThemeData;
}

export function TextBlock({ content, theme }: TextBlockProps) {
  // Handle empty content
  if (!content.body || content.body.trim() === "" || content.body === "<p></p>") {
    return null;
  }

  // Custom CSS for prose elements using theme values
  const proseStyles = `
    .text-block-prose {
      font-family: var(--font-body);
      color: var(--color-foreground);
      line-height: ${theme.typography.lineHeights.relaxed};
    }
    .text-block-prose h2 {
      font-family: var(--font-heading);
      font-size: ${theme.typography.scale.h2};
      font-weight: 600;
      margin-top: 1.5em;
      margin-bottom: 0.5em;
      color: var(--color-foreground);
    }
    .text-block-prose h3 {
      font-family: var(--font-heading);
      font-size: ${theme.typography.scale.h3};
      font-weight: 600;
      margin-top: 1.25em;
      margin-bottom: 0.5em;
      color: var(--color-foreground);
    }
    .text-block-prose a {
      color: var(--color-primary);
      text-decoration: underline;
    }
    .text-block-prose blockquote {
      border-left: 2px solid var(--color-primary);
      padding-left: 1rem;
      font-style: italic;
      color: var(--color-muted-foreground);
    }
    .text-block-prose ul, .text-block-prose ol {
      padding-left: 1.5rem;
      margin: 1rem 0;
    }
    .text-block-prose li {
      margin: 0.25rem 0;
    }
  `;

  return (
    <section
      className="py-12 px-6"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      <style dangerouslySetInnerHTML={{ __html: proseStyles }} />
      <div className="max-w-3xl mx-auto">
        <div
          className="text-block-prose max-w-none"
          dangerouslySetInnerHTML={{ __html: content.body }}
        />
      </div>
    </section>
  );
}
