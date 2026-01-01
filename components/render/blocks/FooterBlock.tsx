import type { ThemeData } from "@/lib/drizzle/schema/theme-types";
import type { FooterContent, HeaderFooterBorderWidth } from "@/lib/section-types";
import { getSmallStyles, getLinkStyles } from "../utilities/theme-styles";
import { transformUrl } from "@/lib/url-utils";

interface FooterBlockProps {
  content: FooterContent;
  theme: ThemeData;
  basePath?: string;
}

const borderWidthMap: Record<HeaderFooterBorderWidth, string> = {
  thin: "1px",
  medium: "2px",
  thick: "4px",
};

const textSizeScale = {
  small: 0.875,
  normal: 1,
  large: 1.125,
};

function getTextColor(textColorMode: string | undefined): string {
  switch (textColorMode) {
    case "light":
      return "#ffffff";
    case "dark":
      return "#000000";
    default:
      return "var(--color-background)";
  }
}

export function FooterBlock({ content, theme, basePath = "" }: FooterBlockProps) {
  const layout = content.layout ?? "simple";
  const enableStyling = content.enableStyling ?? false;
  const showBorder = content.showBorder ?? false;
  const textColor = enableStyling ? getTextColor(content.textColorMode) : "var(--color-background)";
  const sizeMultiplier = textSizeScale[content.textSize ?? "normal"];

  // Background and border styles
  const hasBackgroundImage = enableStyling && content.backgroundImage;
  const hasBackgroundColor = enableStyling && content.backgroundColor;
  const borderWidth = borderWidthMap[content.borderWidth ?? "thin"];
  const borderColor = content.borderColor || theme.colors.primary;

  // Get footer background color
  const getBackgroundColor = (): string => {
    if (hasBackgroundImage) return "transparent";
    if (hasBackgroundColor) return content.backgroundColor!;
    return "var(--color-foreground)";
  };

  // Render the footer content based on layout
  const renderFooterContent = () => {
    // Minimal layout: Copyright only
    if (layout === "minimal") {
      return (
        <div className="max-w-6xl mx-auto text-center py-6 px-6">
          <p
            className="opacity-70"
            style={{
              ...getSmallStyles(theme),
              color: textColor,
              fontSize: `calc(${theme.typography.scale.small} * ${sizeMultiplier})`,
            }}
          >
            {content.copyright}
          </p>
        </div>
      );
    }

    // Columns layout: Multi-column with links grouped
    if (layout === "columns") {
      return (
        <div className="max-w-6xl mx-auto py-12 px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Links column */}
            <div>
              <p
                className="font-semibold mb-4"
                style={{
                  color: textColor,
                  fontFamily: "var(--font-heading)",
                  fontSize: `calc(${theme.typography.scale.body} * ${sizeMultiplier})`,
                }}
              >
                Links
              </p>
              {content.links && content.links.length > 0 && (
                <nav className="flex flex-col gap-2">
                  {content.links.map((link, index) => (
                    <a
                      key={index}
                      href={transformUrl(basePath, link.url)}
                      className="opacity-70 hover:opacity-100 transition-opacity"
                      style={{
                        ...getLinkStyles(theme),
                        color: textColor,
                        fontSize: `calc(${theme.typography.scale.small} * ${sizeMultiplier})`,
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
                color: textColor,
                fontSize: `calc(${theme.typography.scale.small} * ${sizeMultiplier})`,
              }}
            >
              {content.copyright}
            </p>
          </div>
        </div>
      );
    }

    // Simple layout (default): Single row layout
    return (
      <div className="max-w-6xl mx-auto py-8 px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p
            className="opacity-70"
            style={{
              ...getSmallStyles(theme),
              color: textColor,
              fontSize: `calc(${theme.typography.scale.small} * ${sizeMultiplier})`,
            }}
          >
            {content.copyright}
          </p>

          {content.links && content.links.length > 0 && (
            <nav className="flex flex-wrap gap-6">
              {content.links.map((link, index) => (
                <a
                  key={index}
                  href={transformUrl(basePath, link.url)}
                  className="opacity-70 hover:opacity-100 transition-opacity"
                  style={{
                    ...getLinkStyles(theme),
                    color: textColor,
                    fontSize: `calc(${theme.typography.scale.small} * ${sizeMultiplier})`,
                  }}
                >
                  {link.label}
                </a>
              ))}
            </nav>
          )}
        </div>
      </div>
    );
  };

  return (
    <footer
      className="relative"
      style={{
        backgroundColor: getBackgroundColor(),
        color: textColor,
        borderTopWidth: showBorder ? borderWidth : 0,
        borderTopStyle: showBorder ? "solid" : "none",
        borderTopColor: showBorder ? borderColor : "transparent",
      }}
    >
      {/* Background image with overlay */}
      {hasBackgroundImage && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center -z-10"
            style={{ backgroundImage: `url(${content.backgroundImage})` }}
          />
          <div
            className="absolute inset-0 -z-10"
            style={{
              backgroundColor: content.overlayColor || "#000000",
              opacity: (content.overlayOpacity ?? 50) / 100,
            }}
          />
        </>
      )}

      {/* Background color overlay (when no image) */}
      {hasBackgroundColor && !hasBackgroundImage && content.overlayColor && (
        <div
          className="absolute inset-0 -z-10"
          style={{
            backgroundColor: content.overlayColor,
            opacity: (content.overlayOpacity ?? 0) / 100,
          }}
        />
      )}

      {renderFooterContent()}
    </footer>
  );
}
