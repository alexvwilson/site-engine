import type { ThemeData } from "@/lib/drizzle/schema/theme-types";
import type { FooterContent } from "@/lib/section-types";
import { getSmallStyles, getLinkStyles } from "../utilities/theme-styles";

interface FooterBlockProps {
  content: FooterContent;
  theme: ThemeData;
}

export function FooterBlock({ content, theme }: FooterBlockProps) {
  return (
    <footer
      className="py-8 px-6"
      style={{
        backgroundColor: "var(--color-foreground)",
        color: "var(--color-background)",
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p
            className="opacity-70"
            style={{
              ...getSmallStyles(theme),
              color: "var(--color-background)",
            }}
          >
            {content.copyright}
          </p>

          {content.links && content.links.length > 0 && (
            <nav className="flex flex-wrap gap-6">
              {content.links.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  className="opacity-70 hover:opacity-100 transition-opacity"
                  style={{
                    ...getLinkStyles(theme),
                    color: "var(--color-background)",
                    fontSize: theme.typography.scale.small,
                  }}
                >
                  {link.label}
                </a>
              ))}
            </nav>
          )}
        </div>
      </div>
    </footer>
  );
}
