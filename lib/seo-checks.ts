/**
 * SEO Check definitions and analysis logic
 * Phase 1: Manual checklist-based scorecard
 */

import type { HeaderContent, SectionContent } from "@/lib/section-types";
import type { BlockType } from "@/lib/drizzle/schema/sections";

// ============================================================================
// Types
// ============================================================================

export type SeoCheckCategory = "site" | "page" | "content";
export type SeoCheckStatus = "pass" | "fail" | "warning";

export interface SeoCheck {
  id: string;
  category: SeoCheckCategory;
  name: string;
  description: string;
  guidance: string;
}

export interface SeoCheckResult {
  check: SeoCheck;
  status: SeoCheckStatus;
  details?: string;
  pageId?: string; // For page-specific checks
  pageName?: string; // For display
}

export interface SeoAuditData {
  site: {
    id: string;
    name: string;
    description: string | null;
    metaTitle: string | null;
    metaDescription: string | null;
    faviconUrl: string | null;
    headerContent: HeaderContent | null;
  };
  pages: Array<{
    id: string;
    title: string;
    slug: string;
    metaTitle: string | null;
    metaDescription: string | null;
    isHome: boolean;
  }>;
  sections: Array<{
    pageId: string;
    blockType: BlockType;
    content: SectionContent;
  }>;
}

export interface SeoAuditSummary {
  totalChecks: number;
  passedChecks: number;
  warningChecks: number;
  failedChecks: number;
  score: number; // 0-100
  results: SeoCheckResult[];
}

// ============================================================================
// Check Definitions
// ============================================================================

export const SEO_CHECKS: SeoCheck[] = [
  // Site-level checks
  {
    id: "site-meta-title",
    category: "site",
    name: "Site Meta Title",
    description: "A concise, keyword-rich title for your site",
    guidance:
      "Set a meta title in Settings → SEO Settings. Aim for 50-60 characters. This appears as the clickable headline in search results.",
  },
  {
    id: "site-meta-description",
    category: "site",
    name: "Site Meta Description",
    description: "A compelling summary of your site",
    guidance:
      "Add a meta description in Settings → SEO Settings. Keep it 120-160 characters. This appears below the title in search results.",
  },
  {
    id: "site-favicon",
    category: "site",
    name: "Favicon",
    description: "Browser tab icon for brand recognition",
    guidance:
      "Upload a favicon in Settings → Logo & Branding. Square images (512x512px) work best.",
  },
  // Page-level checks
  {
    id: "page-meta-title",
    category: "page",
    name: "Page Meta Title",
    description: "Unique title for each page",
    guidance:
      "Edit the page settings and set a custom meta title. Each page should have a unique, descriptive title.",
  },
  {
    id: "page-meta-description",
    category: "page",
    name: "Page Meta Description",
    description: "Unique description for each page",
    guidance:
      "Edit the page settings and add a meta description. Unique descriptions help search engines understand page content.",
  },
  // Content checks
  {
    id: "image-alt-text",
    category: "content",
    name: "Image Alt Text",
    description: "Descriptive text for all images",
    guidance:
      "Add alt text to images in your sections. Describe what the image shows for accessibility and SEO.",
  },
  {
    id: "logo-alt-text",
    category: "content",
    name: "Logo Description",
    description: "Site name set for logo accessibility",
    guidance:
      "Ensure your site has a name set in the header configuration. This is used as alt text for your logo.",
  },
];

// ============================================================================
// Analysis Functions
// ============================================================================

/**
 * Run a full SEO audit on the provided site data
 */
export function runSeoAudit(data: SeoAuditData): SeoAuditSummary {
  const results: SeoCheckResult[] = [];

  // Run site-level checks
  results.push(...runSiteLevelChecks(data));

  // Run page-level checks
  results.push(...runPageLevelChecks(data));

  // Run content checks
  results.push(...runContentChecks(data));

  // Calculate summary
  const passedChecks = results.filter((r) => r.status === "pass").length;
  const warningChecks = results.filter((r) => r.status === "warning").length;
  const failedChecks = results.filter((r) => r.status === "fail").length;
  const totalChecks = results.length;

  // Score: passes count as 1, warnings as 0.5, fails as 0
  const score =
    totalChecks > 0
      ? Math.round(((passedChecks + warningChecks * 0.5) / totalChecks) * 100)
      : 100;

  return {
    totalChecks,
    passedChecks,
    warningChecks,
    failedChecks,
    score,
    results,
  };
}

/**
 * Run site-level SEO checks
 */
function runSiteLevelChecks(data: SeoAuditData): SeoCheckResult[] {
  const results: SeoCheckResult[] = [];

  // Site meta title
  const titleCheck = SEO_CHECKS.find((c) => c.id === "site-meta-title")!;
  const titleLength = data.site.metaTitle?.length ?? 0;
  if (titleLength >= 30 && titleLength <= 60) {
    results.push({
      check: titleCheck,
      status: "pass",
      details: `${titleLength} characters`,
    });
  } else if (titleLength > 0 && titleLength < 30) {
    results.push({
      check: titleCheck,
      status: "warning",
      details: `${titleLength} characters (too short, aim for 50-60)`,
    });
  } else if (titleLength > 60) {
    results.push({
      check: titleCheck,
      status: "warning",
      details: `${titleLength} characters (too long, may be truncated)`,
    });
  } else {
    results.push({
      check: titleCheck,
      status: "fail",
      details: "Not set",
    });
  }

  // Site meta description
  const descCheck = SEO_CHECKS.find((c) => c.id === "site-meta-description")!;
  const descLength = data.site.metaDescription?.length ?? 0;
  if (descLength >= 120 && descLength <= 160) {
    results.push({
      check: descCheck,
      status: "pass",
      details: `${descLength} characters`,
    });
  } else if (descLength > 0 && descLength < 120) {
    results.push({
      check: descCheck,
      status: "warning",
      details: `${descLength} characters (too short, aim for 120-160)`,
    });
  } else if (descLength > 160) {
    results.push({
      check: descCheck,
      status: "warning",
      details: `${descLength} characters (too long, may be truncated)`,
    });
  } else {
    results.push({
      check: descCheck,
      status: "fail",
      details: "Not set",
    });
  }

  // Favicon
  const faviconCheck = SEO_CHECKS.find((c) => c.id === "site-favicon")!;
  if (data.site.faviconUrl && data.site.faviconUrl.length > 0) {
    results.push({
      check: faviconCheck,
      status: "pass",
      details: "Uploaded",
    });
  } else {
    results.push({
      check: faviconCheck,
      status: "fail",
      details: "Not set",
    });
  }

  return results;
}

/**
 * Run page-level SEO checks
 */
function runPageLevelChecks(data: SeoAuditData): SeoCheckResult[] {
  const results: SeoCheckResult[] = [];

  for (const page of data.pages) {
    const pageName = page.isHome ? "Home" : page.title;

    // Page meta title - passes if meta_title is set OR page has a title
    const titleCheck = SEO_CHECKS.find((c) => c.id === "page-meta-title")!;
    const hasMetaTitle = page.metaTitle && page.metaTitle.length > 0;
    const hasTitle = page.title && page.title.length > 0;

    if (hasMetaTitle) {
      const titleLength = page.metaTitle!.length;
      if (titleLength >= 30 && titleLength <= 60) {
        results.push({
          check: titleCheck,
          status: "pass",
          details: `${titleLength} characters`,
          pageId: page.id,
          pageName,
        });
      } else {
        results.push({
          check: titleCheck,
          status: "warning",
          details: `${titleLength} characters (aim for 50-60)`,
          pageId: page.id,
          pageName,
        });
      }
    } else if (hasTitle) {
      results.push({
        check: titleCheck,
        status: "warning",
        details: "Using page title as fallback",
        pageId: page.id,
        pageName,
      });
    } else {
      results.push({
        check: titleCheck,
        status: "fail",
        details: "No title set",
        pageId: page.id,
        pageName,
      });
    }

    // Page meta description
    const descCheck = SEO_CHECKS.find((c) => c.id === "page-meta-description")!;
    const descLength = page.metaDescription?.length ?? 0;

    if (descLength >= 120 && descLength <= 160) {
      results.push({
        check: descCheck,
        status: "pass",
        details: `${descLength} characters`,
        pageId: page.id,
        pageName,
      });
    } else if (descLength > 0) {
      results.push({
        check: descCheck,
        status: "warning",
        details: `${descLength} characters (aim for 120-160)`,
        pageId: page.id,
        pageName,
      });
    } else {
      results.push({
        check: descCheck,
        status: "fail",
        details: "Not set",
        pageId: page.id,
        pageName,
      });
    }
  }

  return results;
}

/**
 * Run content-level SEO checks
 */
function runContentChecks(data: SeoAuditData): SeoCheckResult[] {
  const results: SeoCheckResult[] = [];

  // Check image alt text across all sections
  const imageAltCheck = SEO_CHECKS.find((c) => c.id === "image-alt-text")!;
  const imageStats = analyzeImageAltText(data.sections);

  if (imageStats.total === 0) {
    // No images to check - skip this check entirely
  } else if (imageStats.withAlt === imageStats.total) {
    results.push({
      check: imageAltCheck,
      status: "pass",
      details: `All ${imageStats.total} images have alt text`,
    });
  } else if (imageStats.withAlt > 0) {
    results.push({
      check: imageAltCheck,
      status: "warning",
      details: `${imageStats.withAlt}/${imageStats.total} images have alt text`,
    });
  } else {
    results.push({
      check: imageAltCheck,
      status: "fail",
      details: `0/${imageStats.total} images have alt text`,
    });
  }

  // Check logo alt text (site name in header)
  const logoAltCheck = SEO_CHECKS.find((c) => c.id === "logo-alt-text")!;
  const hasLogo = data.site.headerContent?.logoUrl;
  const hasSiteName =
    data.site.headerContent?.siteName &&
    data.site.headerContent.siteName.length > 0;

  if (!hasLogo) {
    // No logo uploaded - skip this check
  } else if (hasSiteName) {
    results.push({
      check: logoAltCheck,
      status: "pass",
      details: `Logo uses "${data.site.headerContent!.siteName}" as alt text`,
    });
  } else {
    results.push({
      check: logoAltCheck,
      status: "fail",
      details: "Logo uploaded but no site name set for alt text",
    });
  }

  return results;
}

/**
 * Analyze image alt text across all sections
 */
function analyzeImageAltText(
  sections: SeoAuditData["sections"]
): { total: number; withAlt: number } {
  let total = 0;
  let withAlt = 0;

  for (const section of sections) {
    const content = section.content;

    switch (section.blockType) {
      case "image": {
        const imageContent = content as { src?: string; alt?: string };
        if (imageContent.src) {
          total++;
          if (imageContent.alt && imageContent.alt.trim().length > 0) {
            withAlt++;
          }
        }
        break;
      }

      case "gallery": {
        const galleryContent = content as {
          images?: Array<{ src?: string; alt?: string }>;
        };
        if (galleryContent.images) {
          for (const img of galleryContent.images) {
            if (img.src) {
              total++;
              if (img.alt && img.alt.trim().length > 0) {
                withAlt++;
              }
            }
          }
        }
        break;
      }

      case "testimonials": {
        const testimonialsContent = content as {
          testimonials?: Array<{ avatar?: string; author?: string }>;
        };
        if (testimonialsContent.testimonials) {
          for (const t of testimonialsContent.testimonials) {
            if (t.avatar) {
              total++;
              // For avatars, we consider the author name as implicit alt text
              if (t.author && t.author.trim().length > 0) {
                withAlt++;
              }
            }
          }
        }
        break;
      }

      // Hero background images don't need alt text (decorative)
      // Header logos are handled separately
    }
  }

  return { total, withAlt };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get the check definition by ID
 */
export function getCheckById(id: string): SeoCheck | undefined {
  return SEO_CHECKS.find((c) => c.id === id);
}

/**
 * Get all checks for a specific category
 */
export function getChecksByCategory(category: SeoCheckCategory): SeoCheck[] {
  return SEO_CHECKS.filter((c) => c.category === category);
}

/**
 * Get score color based on percentage
 */
export function getScoreColor(score: number): "green" | "yellow" | "red" {
  if (score >= 80) return "green";
  if (score >= 50) return "yellow";
  return "red";
}

/**
 * Group results by category
 */
export function groupResultsByCategory(
  results: SeoCheckResult[]
): Record<SeoCheckCategory, SeoCheckResult[]> {
  return {
    site: results.filter((r) => r.check.category === "site"),
    page: results.filter((r) => r.check.category === "page"),
    content: results.filter((r) => r.check.category === "content"),
  };
}

/**
 * Group page results by page ID
 */
export function groupPageResults(
  results: SeoCheckResult[]
): Map<string, { pageName: string; results: SeoCheckResult[] }> {
  const grouped = new Map<
    string,
    { pageName: string; results: SeoCheckResult[] }
  >();

  for (const result of results) {
    if (result.pageId) {
      if (!grouped.has(result.pageId)) {
        grouped.set(result.pageId, {
          pageName: result.pageName || "Unknown",
          results: [],
        });
      }
      grouped.get(result.pageId)!.results.push(result);
    }
  }

  return grouped;
}
