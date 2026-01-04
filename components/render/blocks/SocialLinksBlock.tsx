import type { ThemeData } from "@/lib/drizzle/schema/theme-types";
import type { SocialLinksContent, SocialLink, SocialIconStyle, SocialIconSize } from "@/lib/section-types";
import { SocialIcon } from "@/lib/social-icons";

interface SocialLinksBlockProps {
  content: SocialLinksContent;
  theme: ThemeData;
  socialLinks: SocialLink[];
  siteIconStyle: SocialIconStyle;
}

function hexToRgba(hex: string, opacity: number): string {
  const cleanHex = hex.replace("#", "");
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
}

const borderWidthMap = {
  thin: "1px",
  medium: "2px",
  thick: "4px",
};

const borderRadiusMap = {
  none: "0",
  small: "0.25rem",
  medium: "0.5rem",
  large: "1rem",
  full: "9999px",
};

const alignmentMap = {
  left: "justify-start",
  center: "justify-center",
  right: "justify-end",
};

export function SocialLinksBlock({
  content,
  theme,
  socialLinks,
  siteIconStyle,
}: SocialLinksBlockProps) {
  // No social links to display
  if (!socialLinks || socialLinks.length === 0) {
    return null;
  }

  const alignment = content.alignment ?? "center";
  const size: SocialIconSize = content.size ?? "medium";
  const iconStyle = content.iconStyle ?? siteIconStyle;
  const themePrimaryColor = theme.colors.primary;

  // Plain mode (styling disabled) - simple social links row
  if (!content.enableStyling) {
    return (
      <section className="py-12 px-6" style={{ backgroundColor: "var(--theme-background)" }}>
        <div className={`max-w-4xl mx-auto flex flex-wrap gap-4 ${alignmentMap[alignment]}`}>
          {socialLinks.map((link) => (
            <a
              key={link.platform}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-opacity hover:opacity-80"
              aria-label={link.platform}
            >
              <SocialIcon
                platform={link.platform}
                size={size}
                style={iconStyle}
                primaryColor={themePrimaryColor}
              />
            </a>
          ))}
        </div>
      </section>
    );
  }

  // Styled mode - full styling support
  const hasBackgroundImage = !!content.backgroundImage;
  const hasOverlay =
    (content.overlayOpacity ?? 0) > 0 ||
    (!hasBackgroundImage && content.overlayColor);
  const showBorder = content.showBorder ?? false;

  // Section background styles
  const sectionStyles: React.CSSProperties = {
    position: "relative",
  };

  if (hasBackgroundImage) {
    sectionStyles.backgroundImage = `url(${content.backgroundImage})`;
    sectionStyles.backgroundSize = "cover";
    sectionStyles.backgroundPosition = "center";
  }

  // Overlay color
  const overlayRgba = hasOverlay
    ? hexToRgba(
        content.overlayColor || "#000000",
        content.overlayOpacity ?? 0
      )
    : undefined;

  // Container styles (border + box background)
  const containerStyles: React.CSSProperties = {};

  if (showBorder) {
    // Use content borderColor, fallback to theme primary color
    const borderColor = content.borderColor || themePrimaryColor;
    containerStyles.border = `${borderWidthMap[content.borderWidth ?? "medium"]} solid ${borderColor}`;
    containerStyles.borderRadius =
      borderRadiusMap[content.borderRadius ?? "medium"];
    containerStyles.padding = "2rem";

    // Box background
    if (content.useThemeBackground ?? true) {
      containerStyles.backgroundColor = "var(--theme-background)";
    } else if (content.boxBackgroundColor) {
      containerStyles.backgroundColor = hexToRgba(
        content.boxBackgroundColor,
        content.boxBackgroundOpacity ?? 100
      );
    }
  }

  // Determine effective icon style based on textColorMode
  // Only override to monochrome when explicitly set to light/dark text mode
  // or when there's a dark background that requires light icons
  let effectiveIconStyle = iconStyle;
  let iconColor: string | undefined = undefined;

  if (content.textColorMode === "light") {
    effectiveIconStyle = "monochrome";
    iconColor = "#FFFFFF";
  } else if (content.textColorMode === "dark") {
    effectiveIconStyle = "monochrome";
    iconColor = "#1F2937";
  } else if (content.textColorMode === "auto") {
    // Auto mode: only switch to monochrome if there's a dark background
    const hasDarkBackground = hasBackgroundImage || (hasOverlay && (content.overlayOpacity ?? 0) > 30);
    if (hasDarkBackground) {
      effectiveIconStyle = "monochrome";
      iconColor = "#FFFFFF";
    }
    // Otherwise keep the user's chosen icon style (brand, primary, or monochrome)
  }

  return (
    <section className="py-12 px-6" style={sectionStyles}>
      {/* Overlay layer */}
      {hasOverlay && overlayRgba && (
        <div
          className="absolute inset-0"
          style={{ backgroundColor: overlayRgba }}
        />
      )}

      {/* Content container */}
      <div
        className={`relative z-10 max-w-4xl mx-auto ${alignmentMap[alignment]}`}
        style={containerStyles}
      >
        <div className={`flex flex-wrap gap-4 ${alignmentMap[alignment]}`}>
          {socialLinks.map((link) => (
            <a
              key={link.platform}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-opacity hover:opacity-80"
              aria-label={link.platform}
              style={iconColor ? { color: iconColor } : undefined}
            >
              <SocialIcon
                platform={link.platform}
                size={size}
                style={effectiveIconStyle}
                primaryColor={themePrimaryColor}
                monochromeColor={iconColor}
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
