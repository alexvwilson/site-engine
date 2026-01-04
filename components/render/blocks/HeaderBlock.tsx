import Image from "next/image";
import type { ThemeData } from "@/lib/drizzle/schema/theme-types";
import type { HeaderContent, HeaderFooterBorderWidth, SocialLink, SocialIconStyle } from "@/lib/section-types";
import { getButtonStyles, getLinkStyles } from "../utilities/theme-styles";
import { transformUrl } from "@/lib/url-utils";
import { cn } from "@/lib/utils";
import { MobileMenu } from "./MobileMenu";
import { SocialIcon } from "@/lib/social-icons";

interface HeaderBlockProps {
  content: HeaderContent;
  theme: ThemeData;
  basePath?: string;
  socialLinks?: SocialLink[];
  socialIconStyle?: SocialIconStyle;
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
      return "var(--color-foreground)";
  }
}

export function HeaderBlock({ content, theme, basePath = "", socialLinks = [], socialIconStyle = "brand" }: HeaderBlockProps) {
  const layout = content.layout ?? "left";
  const isSticky = content.sticky ?? true;
  const showLogoText = content.showLogoText ?? true;
  const logoSize = content.logoSize ?? 32;
  const enableStyling = content.enableStyling ?? false;
  const showBorder = content.showBorder ?? true;
  const textColor = enableStyling ? getTextColor(content.textColorMode) : "var(--color-foreground)";
  const sizeMultiplier = textSizeScale[content.textSize ?? "normal"];

  // Social links settings
  const showSocialLinks = content.showSocialLinks ?? false;
  const socialLinksPosition = content.socialLinksPosition ?? "right";
  const socialLinksSize = content.socialLinksSize ?? "medium";
  const hasSocialLinks = showSocialLinks && socialLinks.length > 0;

  // Social icons component
  const SocialLinksRow = hasSocialLinks && (
    <div className="hidden md:flex items-center gap-3">
      {socialLinks.map((link) => (
        <a
          key={`${link.platform}-${link.url}`}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:opacity-70 transition-opacity"
        >
          <SocialIcon
            platform={link.platform}
            style={socialIconStyle}
            size={socialLinksSize}
            primaryColor={theme.colors.primary}
            monochromeColor={textColor}
          />
        </a>
      ))}
    </div>
  );

  // Logo/Brand component with dynamic sizing
  const LogoBrand = (
    <div className="flex items-center gap-2">
      {content.logoUrl &&
        (content.logoUrl.startsWith("http") ||
          content.logoUrl.startsWith("/")) && (
          <Image
            src={content.logoUrl}
            alt={content.siteName}
            width={Math.round(logoSize * 3.75)}
            height={logoSize}
            style={{
              height: logoSize,
              width: "auto",
              maxHeight: logoSize,
              objectFit: "contain"
            }}
            unoptimized
          />
        )}
      {showLogoText && (
        <span
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: `calc(${theme.typography.scale.body} * ${sizeMultiplier})`,
            fontWeight: 600,
            color: textColor,
          }}
        >
          {content.siteName}
        </span>
      )}
    </div>
  );

  // Navigation links component
  const NavLinks = content.links && content.links.length > 0 && (
    <nav className={cn(
      "hidden md:flex items-center gap-6",
      layout === "center" && "justify-center"
    )}>
      {content.links.map((link, index) => (
        <a
          key={index}
          href={transformUrl(basePath, link.url)}
          className="hover:opacity-70 transition-opacity"
          style={{
            ...getLinkStyles(theme),
            color: textColor,
            fontFamily: "var(--font-body)",
            fontSize: `calc(${theme.typography.scale.small} * ${sizeMultiplier})`,
            fontWeight: 500,
          }}
        >
          {link.label}
        </a>
      ))}
    </nav>
  );

  // CTA button component
  const CTAButton = (content.showCta ?? (content.ctaText && content.ctaUrl)) &&
    content.ctaText &&
    content.ctaUrl && (
      <a
        href={transformUrl(basePath, content.ctaUrl)}
        className="hidden sm:inline-block hover:opacity-90 transition-opacity"
        style={getButtonStyles(theme)}
      >
        {content.ctaText}
      </a>
    );

  // Mobile menu component (client-side)
  const MobileMenuComponent = (
    <MobileMenu
      siteName={content.siteName}
      links={content.links || []}
      ctaText={content.ctaText}
      ctaUrl={content.ctaUrl}
      showCta={content.showCta ?? (!!content.ctaText && !!content.ctaUrl)}
      theme={theme}
      basePath={basePath}
    />
  );

  // Background and border styles
  const hasBackgroundImage = enableStyling && content.backgroundImage;
  const hasBackgroundColor = enableStyling && content.backgroundColor;
  const borderWidth = borderWidthMap[content.borderWidth ?? "thin"];
  const borderColor = content.borderColor || theme.colors.primary;

  // Determine background color
  const getBackgroundColor = (): string => {
    if (hasBackgroundImage) return "transparent";
    if (hasBackgroundColor) return content.backgroundColor!;
    return "var(--color-background)";
  };

  // Calculate minimum header height based on logo size
  const minHeaderHeight = Math.max(64, logoSize + 16); // Logo + 16px padding

  // Render header content for each layout
  const renderHeaderContent = (layoutType: "left" | "right" | "center") => {
    if (layoutType === "left") {
      return (
        <div className="max-w-6xl mx-auto px-6">
          <div
            className="flex items-center justify-between py-2"
            style={{ minHeight: minHeaderHeight }}
          >
            <div className="flex items-center gap-4">
              {LogoBrand}
              {socialLinksPosition === "left" && SocialLinksRow}
            </div>
            {NavLinks}
            <div className="flex items-center gap-4">
              {socialLinksPosition === "right" && SocialLinksRow}
              {CTAButton}
              {MobileMenuComponent}
            </div>
          </div>
        </div>
      );
    }

    if (layoutType === "right") {
      return (
        <div className="max-w-6xl mx-auto px-6">
          <div
            className="flex items-center justify-between py-2"
            style={{ minHeight: minHeaderHeight }}
          >
            <div className="flex items-center gap-4">
              {MobileMenuComponent}
              {CTAButton}
              {socialLinksPosition === "left" && SocialLinksRow}
            </div>
            {NavLinks}
            <div className="flex items-center gap-4">
              {socialLinksPosition === "right" && SocialLinksRow}
              {LogoBrand}
            </div>
          </div>
        </div>
      );
    }

    // Center layout
    return (
      <div className="max-w-6xl mx-auto px-6">
        <div
          className="flex items-center justify-between py-2"
          style={{ minHeight: minHeaderHeight }}
        >
          <div className="w-24 md:w-32 flex items-center gap-4">
            {socialLinksPosition === "left" && SocialLinksRow}
          </div>
          <div className="flex-1 flex justify-center">
            {LogoBrand}
          </div>
          <div className="w-24 md:w-32 flex justify-end items-center gap-4">
            {socialLinksPosition === "right" && SocialLinksRow}
            {CTAButton}
            {MobileMenuComponent}
          </div>
        </div>
        {content.links && content.links.length > 0 && (
          <div className="hidden md:flex justify-center pb-3">
            {NavLinks}
          </div>
        )}
      </div>
    );
  };

  return (
    <header
      className={cn(
        "relative top-0 z-50 w-full",
        isSticky && "sticky"
      )}
      style={{
        backgroundColor: getBackgroundColor(),
        borderBottomWidth: showBorder ? borderWidth : 0,
        borderBottomStyle: showBorder ? "solid" : "none",
        borderBottomColor: showBorder ? borderColor : "transparent",
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

      {renderHeaderContent(layout)}
    </header>
  );
}
