"use client";

import { useState, useEffect } from "react";
import type { ThemeData } from "@/lib/drizzle/schema/theme-types";
import { getButtonStyles, getLinkStyles } from "../utilities/theme-styles";
import { transformUrl } from "@/lib/url-utils";
import { X, Menu } from "lucide-react";

interface NavLink {
  label: string;
  url: string;
}

interface MobileMenuProps {
  siteName: string;
  links: NavLink[];
  ctaText?: string;
  ctaUrl?: string;
  showCta?: boolean;
  theme: ThemeData;
  basePath?: string;
}

export function MobileMenu({
  siteName,
  links,
  ctaText,
  ctaUrl,
  showCta,
  theme,
  basePath = "",
}: MobileMenuProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent): void => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when menu is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close menu when clicking a link (for same-page anchor navigation)
  const handleLinkClick = (): void => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden p-2 hover:opacity-70 transition-opacity"
        style={{ color: "var(--color-foreground)" }}
        aria-label="Open menu"
        aria-expanded={isOpen}
        aria-controls="mobile-menu-drawer"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[100] md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Slide-out Drawer */}
      <div
        id="mobile-menu-drawer"
        className={`fixed top-0 right-0 h-full w-72 max-w-[80vw] z-[101] transform transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{
          backgroundColor: "var(--color-background)",
          borderLeft: "1px solid var(--color-border)",
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation menu"
      >
        {/* Header with close button */}
        <div
          className="flex items-center justify-between p-4 border-b"
          style={{ borderColor: "var(--color-border)" }}
        >
          <span
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: theme.typography.scale.body,
              fontWeight: 600,
              color: "var(--color-foreground)",
            }}
          >
            {siteName}
          </span>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:opacity-70 transition-opacity"
            style={{ color: "var(--color-foreground)" }}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col p-4 gap-1">
          {links.map((link, index) => (
            <a
              key={index}
              href={transformUrl(basePath, link.url)}
              onClick={handleLinkClick}
              className="py-3 px-2 rounded-md hover:opacity-70 transition-opacity"
              style={{
                ...getLinkStyles(theme),
                color: "var(--color-foreground)",
                fontFamily: "var(--font-body)",
                fontSize: theme.typography.scale.body,
                fontWeight: 500,
              }}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* CTA Button */}
        {showCta && ctaText && ctaUrl && (
          <div className="p-4 mt-auto">
            <a
              href={transformUrl(basePath, ctaUrl)}
              onClick={handleLinkClick}
              className="block text-center w-full py-3 rounded-md hover:opacity-90 transition-opacity"
              style={getButtonStyles(theme)}
            >
              {ctaText}
            </a>
          </div>
        )}
      </div>
    </>
  );
}
