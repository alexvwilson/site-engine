import type { ThemeData } from "@/lib/drizzle/schema/theme-types";
import type { HeaderContent } from "@/lib/section-types";
import { getButtonStyles, getLinkStyles } from "../utilities/theme-styles";

interface HeaderBlockProps {
  content: HeaderContent;
  theme: ThemeData;
}

export function HeaderBlock({ content, theme }: HeaderBlockProps) {
  return (
    <header
      className="sticky top-0 z-50 w-full border-b"
      style={{
        backgroundColor: theme.colors.background,
        borderColor: theme.colors.border,
      }}
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo / Site Name */}
          <div className="flex items-center gap-2">
            {content.logoUrl && (
              <img
                src={content.logoUrl}
                alt={content.siteName}
                className="h-8 w-auto"
              />
            )}
            <span
              style={{
                fontFamily: theme.typography.headingFont.family,
                fontSize: theme.typography.scale.body,
                fontWeight: 600,
                color: theme.colors.foreground,
              }}
            >
              {content.siteName}
            </span>
          </div>

          {/* Navigation Links */}
          {content.links && content.links.length > 0 && (
            <nav className="hidden md:flex items-center gap-6">
              {content.links.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  className="hover:opacity-70 transition-opacity"
                  style={{
                    ...getLinkStyles(theme),
                    color: theme.colors.foreground,
                    fontFamily: theme.typography.bodyFont.family,
                    fontSize: theme.typography.scale.small,
                    fontWeight: 500,
                  }}
                >
                  {link.label}
                </a>
              ))}
            </nav>
          )}

          {/* CTA Button */}
          {content.ctaText && content.ctaUrl && (
            <a
              href={content.ctaUrl}
              className="hidden sm:inline-block hover:opacity-90 transition-opacity"
              style={getButtonStyles(theme)}
            >
              {content.ctaText}
            </a>
          )}

          {/* Mobile Menu Button (visual only - no JS interaction in server component) */}
          <button
            className="md:hidden p-2 hover:opacity-70 transition-opacity"
            style={{ color: theme.colors.foreground }}
            aria-label="Open menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
