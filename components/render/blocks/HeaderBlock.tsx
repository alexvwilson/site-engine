import Image from "next/image";
import type { ThemeData } from "@/lib/drizzle/schema/theme-types";
import type { HeaderContent } from "@/lib/section-types";
import { getButtonStyles, getLinkStyles } from "../utilities/theme-styles";
import { transformUrl } from "@/lib/url-utils";
import { cn } from "@/lib/utils";

interface HeaderBlockProps {
  content: HeaderContent;
  theme: ThemeData;
  basePath?: string;
}

export function HeaderBlock({ content, theme, basePath = "" }: HeaderBlockProps) {
  const layout = content.layout ?? "left";
  const isSticky = content.sticky ?? true;
  const showLogoText = content.showLogoText ?? true;

  // Logo/Brand component
  const LogoBrand = (
    <div className="flex items-center gap-2">
      {content.logoUrl &&
        (content.logoUrl.startsWith("http") ||
          content.logoUrl.startsWith("/")) && (
          <Image
            src={content.logoUrl}
            alt={content.siteName}
            width={120}
            height={32}
            className="h-8 w-auto"
            unoptimized
          />
        )}
      {showLogoText && (
        <span
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: theme.typography.scale.body,
            fontWeight: 600,
            color: "var(--color-foreground)",
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
            color: "var(--color-foreground)",
            fontFamily: "var(--font-body)",
            fontSize: theme.typography.scale.small,
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

  // Mobile menu button
  const MobileMenuButton = (
    <button
      className="md:hidden p-2 hover:opacity-70 transition-opacity"
      style={{ color: "var(--color-foreground)" }}
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
  );

  // Left layout: Logo | Nav Links | CTA
  if (layout === "left") {
    return (
      <header
        className={cn(
          "top-0 z-50 w-full border-b",
          isSticky && "sticky"
        )}
        style={{
          backgroundColor: "var(--color-background)",
          borderColor: "var(--color-border)",
        }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex h-16 items-center justify-between">
            {LogoBrand}
            {NavLinks}
            <div className="flex items-center gap-4">
              {CTAButton}
              {MobileMenuButton}
            </div>
          </div>
        </div>
      </header>
    );
  }

  // Right layout: CTA | Nav Links | Logo
  if (layout === "right") {
    return (
      <header
        className={cn(
          "top-0 z-50 w-full border-b",
          isSticky && "sticky"
        )}
        style={{
          backgroundColor: "var(--color-background)",
          borderColor: "var(--color-border)",
        }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              {MobileMenuButton}
              {CTAButton}
            </div>
            {NavLinks}
            {LogoBrand}
          </div>
        </div>
      </header>
    );
  }

  // Center layout: Logo centered, nav below
  return (
    <header
      className={cn(
        "top-0 z-50 w-full border-b",
        isSticky && "sticky"
      )}
      style={{
        backgroundColor: "var(--color-background)",
        borderColor: "var(--color-border)",
      }}
    >
      <div className="max-w-6xl mx-auto px-6">
        {/* Top row: Logo centered with CTA on right */}
        <div className="flex h-14 items-center justify-between">
          <div className="w-24 md:w-32" /> {/* Spacer for balance */}
          <div className="flex-1 flex justify-center">
            {LogoBrand}
          </div>
          <div className="w-24 md:w-32 flex justify-end items-center gap-4">
            {CTAButton}
            {MobileMenuButton}
          </div>
        </div>
        {/* Bottom row: Nav links centered */}
        {content.links && content.links.length > 0 && (
          <div className="hidden md:flex justify-center pb-3">
            {NavLinks}
          </div>
        )}
      </div>
    </header>
  );
}
