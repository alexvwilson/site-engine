import type { HeaderContent, FooterContent } from "./section-types";

/**
 * Merge site-level header settings with page-level overrides.
 * Content (siteName, logoUrl, links) always comes from site settings.
 * Styling options can be overridden at the page level using override flags.
 */
export function mergeHeaderContent(
  siteHeader: HeaderContent,
  pageHeader: HeaderContent | null
): HeaderContent {
  if (!pageHeader) return siteHeader;

  return {
    // Content always from site settings
    siteName: siteHeader.siteName,
    logoUrl: siteHeader.logoUrl,
    links: siteHeader.links,

    // CTA - can be overridden at page level
    showCta: pageHeader.overrideCta ? pageHeader.showCta : siteHeader.showCta,
    ctaText: pageHeader.overrideCta ? pageHeader.ctaText : siteHeader.ctaText,
    ctaUrl: pageHeader.overrideCta ? pageHeader.ctaUrl : siteHeader.ctaUrl,

    // Styling options - can be overridden at page level
    layout: pageHeader.overrideLayout
      ? pageHeader.layout
      : (siteHeader.layout ?? "left"),
    sticky: pageHeader.overrideSticky
      ? pageHeader.sticky
      : (siteHeader.sticky ?? true),
    showLogoText: pageHeader.overrideShowLogoText
      ? pageHeader.showLogoText
      : (siteHeader.showLogoText ?? true),
  };
}

/**
 * Merge site-level footer settings with page-level overrides.
 * Content (copyright, links) always comes from site settings.
 * Layout can be overridden at the page level.
 */
export function mergeFooterContent(
  siteFooter: FooterContent,
  pageFooter: FooterContent | null
): FooterContent {
  if (!pageFooter) return siteFooter;

  return {
    // Content always from site settings
    copyright: siteFooter.copyright,
    links: siteFooter.links,

    // Styling options - can be overridden at page level
    layout: pageFooter.overrideLayout
      ? pageFooter.layout
      : (siteFooter.layout ?? "simple"),
  };
}
