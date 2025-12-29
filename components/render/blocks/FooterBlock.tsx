import type { ThemeData } from "@/lib/drizzle/schema/theme-types";
import type { FooterContent } from "@/lib/section-types";
import { getSmallStyles, getLinkStyles } from "../utilities/theme-styles";

interface FooterBlockProps {
  content: FooterContent;
  theme: ThemeData;
}

export function FooterBlock({ content, theme }: FooterBlockProps) {
  const layout = content.layout ?? "simple";

  // Minimal layout: Copyright only
  if (layout === "minimal") {
    return (
      <footer
        className="py-6 px-6"
        style={{
          backgroundColor: "var(--color-foreground)",
          color: "var(--color-background)",
        }}
      >
        <div className="max-w-6xl mx-auto text-center">
          <p
            className="opacity-70"
            style={{
              ...getSmallStyles(theme),
              color: "var(--color-background)",
            }}
          >
            {content.copyright}
          </p>
        </div>
      </footer>
    );
  }

  // Columns layout: Multi-column with links grouped
  if (layout === "columns") {
    return (
      <footer
        className="py-12 px-6"
        style={{
          backgroundColor: "var(--color-foreground)",
          color: "var(--color-background)",
        }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Brand column */}
            <div>
              <p
                className="font-semibold mb-4"
                style={{
                  color: "var(--color-background)",
                  fontFamily: "var(--font-heading)",
                }}
              >
                Links
              </p>
              {content.links && content.links.length > 0 && (
                <nav className="flex flex-col gap-2">
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
          {/* Bottom row with copyright */}
          <div className="pt-8 border-t border-white/20">
            <p
              className="opacity-70 text-center md:text-left"
              style={{
                ...getSmallStyles(theme),
                color: "var(--color-background)",
              }}
            >
              {content.copyright}
            </p>
          </div>
        </div>
      </footer>
    );
  }

  // Simple layout (default): Single row layout
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
