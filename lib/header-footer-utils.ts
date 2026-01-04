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

  // Check if page has styling override
  const useSiteStyling = !pageHeader.overrideStyling;
  const usePageStyling = pageHeader.overrideStyling;

  return {
    // Content always from site settings
    siteName: siteHeader.siteName,
    logoUrl: siteHeader.logoUrl,
    links: siteHeader.links,

    // CTA - can be overridden at page level
    showCta: pageHeader.overrideCta ? pageHeader.showCta : siteHeader.showCta,
    ctaText: pageHeader.overrideCta ? pageHeader.ctaText : siteHeader.ctaText,
    ctaUrl: pageHeader.overrideCta ? pageHeader.ctaUrl : siteHeader.ctaUrl,

    // Layout options - can be overridden at page level
    layout: pageHeader.overrideLayout
      ? pageHeader.layout
      : (siteHeader.layout ?? "left"),
    sticky: pageHeader.overrideSticky
      ? pageHeader.sticky
      : (siteHeader.sticky ?? true),
    showLogoText: pageHeader.overrideShowLogoText
      ? pageHeader.showLogoText
      : (siteHeader.showLogoText ?? true),

    // Logo size - can be overridden at page level
    logoSize: pageHeader.overrideLogoSize
      ? pageHeader.logoSize
      : siteHeader.logoSize,

    // Styling options - from site or page based on override flag
    enableStyling: usePageStyling
      ? pageHeader.enableStyling
      : siteHeader.enableStyling,
    backgroundColor: usePageStyling
      ? pageHeader.backgroundColor
      : siteHeader.backgroundColor,
    backgroundImage: usePageStyling
      ? pageHeader.backgroundImage
      : siteHeader.backgroundImage,
    overlayColor: usePageStyling
      ? pageHeader.overlayColor
      : siteHeader.overlayColor,
    overlayOpacity: usePageStyling
      ? pageHeader.overlayOpacity
      : siteHeader.overlayOpacity,
    showBorder: useSiteStyling
      ? siteHeader.showBorder
      : pageHeader.showBorder,
    borderWidth: useSiteStyling
      ? siteHeader.borderWidth
      : pageHeader.borderWidth,
    borderColor: useSiteStyling
      ? siteHeader.borderColor
      : pageHeader.borderColor,
    textColorMode: usePageStyling
      ? pageHeader.textColorMode
      : siteHeader.textColorMode,
    textSize: usePageStyling
      ? pageHeader.textSize
      : siteHeader.textSize,

    // Social links - always from site settings (can be overridden if page wants to hide them)
    showSocialLinks: pageHeader.overrideSocialLinks
      ? pageHeader.showSocialLinks
      : siteHeader.showSocialLinks,
    socialLinksPosition: pageHeader.overrideSocialLinks
      ? pageHeader.socialLinksPosition
      : siteHeader.socialLinksPosition,
    socialLinksSize: pageHeader.overrideSocialLinks
      ? pageHeader.socialLinksSize
      : siteHeader.socialLinksSize,
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

  // Check if page has styling override
  const useSiteStyling = !pageFooter.overrideStyling;
  const usePageStyling = pageFooter.overrideStyling;

  return {
    // Content always from site settings
    copyright: siteFooter.copyright,
    links: siteFooter.links,

    // Layout - can be overridden at page level
    layout: pageFooter.overrideLayout
      ? pageFooter.layout
      : (siteFooter.layout ?? "simple"),

    // Styling options - from site or page based on override flag
    enableStyling: usePageStyling
      ? pageFooter.enableStyling
      : siteFooter.enableStyling,
    backgroundColor: usePageStyling
      ? pageFooter.backgroundColor
      : siteFooter.backgroundColor,
    backgroundImage: usePageStyling
      ? pageFooter.backgroundImage
      : siteFooter.backgroundImage,
    overlayColor: usePageStyling
      ? pageFooter.overlayColor
      : siteFooter.overlayColor,
    overlayOpacity: usePageStyling
      ? pageFooter.overlayOpacity
      : siteFooter.overlayOpacity,
    showBorder: useSiteStyling
      ? siteFooter.showBorder
      : pageFooter.showBorder,
    borderWidth: useSiteStyling
      ? siteFooter.borderWidth
      : pageFooter.borderWidth,
    borderColor: useSiteStyling
      ? siteFooter.borderColor
      : pageFooter.borderColor,
    textColorMode: usePageStyling
      ? pageFooter.textColorMode
      : siteFooter.textColorMode,
    textSize: usePageStyling
      ? pageFooter.textSize
      : siteFooter.textSize,

    // Social links - always from site settings (can be overridden if page wants to hide them)
    showSocialLinks: pageFooter.overrideSocialLinks
      ? pageFooter.showSocialLinks
      : siteFooter.showSocialLinks,
    socialLinksPosition: pageFooter.overrideSocialLinks
      ? pageFooter.socialLinksPosition
      : siteFooter.socialLinksPosition,
    socialLinksSize: pageFooter.overrideSocialLinks
      ? pageFooter.socialLinksSize
      : siteFooter.socialLinksSize,
    socialLinksAlignment: pageFooter.overrideSocialLinks
      ? pageFooter.socialLinksAlignment
      : siteFooter.socialLinksAlignment,
  };
}
