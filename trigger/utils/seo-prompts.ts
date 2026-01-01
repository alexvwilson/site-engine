/**
 * SEO Analysis Prompts
 *
 * Prompt templates and Zod schemas for AI-powered SEO analysis.
 */

import { z } from "zod";

// ============================================================================
// Zod Schemas
// ============================================================================

export const seoRecommendationSchema = z.object({
  id: z.string(),
  category: z.enum(["content", "technical", "keywords", "meta"]),
  priority: z.enum(["high", "medium", "low"]),
  title: z.string(),
  description: z.string(),
  currentState: z.string().optional(),
  suggestedFix: z.string(),
  pageSlug: z.string().optional(),
});

export const seoAnalysisResponseSchema = z.object({
  overallScore: z.number().min(0).max(100),
  recommendations: z.array(seoRecommendationSchema),
  summary: z.string(),
  strengths: z.array(z.string()),
});

export type SeoAnalysisResponse = z.infer<typeof seoAnalysisResponseSchema>;

// ============================================================================
// Input Types
// ============================================================================

export interface SeoAnalysisInput {
  siteName: string;
  siteDescription: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  pages: Array<{
    title: string;
    slug: string;
    isHome: boolean;
    metaTitle: string | null;
    metaDescription: string | null;
    sections: Array<{
      blockType: string;
      content: unknown;
    }>;
  }>;
}

// ============================================================================
// Prompt Builder
// ============================================================================

export function buildSeoAnalysisPrompt(input: SeoAnalysisInput): {
  system: string;
  user: string;
} {
  const system = `You are an expert SEO consultant specializing in website optimization for small businesses and personal brands. Your task is to analyze a website's content and structure, then provide actionable recommendations.

You will receive information about a website including:
- Site name and description
- Meta titles and descriptions (site-level and page-level)
- Page structure and content from each section

Analyze this information and return a JSON response with:
1. An overall SEO score (0-100) based on content quality, meta optimization, and structure
2. Specific recommendations organized by priority (high, medium, low)
3. A brief summary of findings
4. Strengths the site already has

Categories for recommendations:
- "content": Content quality, length, readability, headings
- "technical": Structure, image alt text, links
- "keywords": Keyword usage, topic focus
- "meta": Meta titles, descriptions, Open Graph

Prioritization guidelines:
- HIGH: Missing meta descriptions, no page titles, critical content issues
- MEDIUM: Suboptimal meta lengths, weak headings, missing alt text
- LOW: Minor improvements, nice-to-haves, polish

Keep recommendations specific and actionable. Include the page slug for page-specific issues.

IMPORTANT: Return ONLY valid JSON matching this structure:
{
  "overallScore": number (0-100),
  "recommendations": [
    {
      "id": "unique-id",
      "category": "content" | "technical" | "keywords" | "meta",
      "priority": "high" | "medium" | "low",
      "title": "Short title",
      "description": "What's the issue",
      "currentState": "Current value if applicable",
      "suggestedFix": "How to fix it",
      "pageSlug": "page-slug if page-specific"
    }
  ],
  "summary": "2-3 sentence overview",
  "strengths": ["Strength 1", "Strength 2"]
}`;

  // Build page content summary
  const pagesSummary = input.pages
    .map((page) => {
      const contentSummary = page.sections
        .map((section) => {
          return summarizeSectionContent(section.blockType, section.content);
        })
        .filter(Boolean)
        .join("\n    ");

      return `
  Page: ${page.title} (/${page.slug})${page.isHome ? " [HOME]" : ""}
  Meta Title: ${page.metaTitle || "[NOT SET]"}
  Meta Description: ${page.metaDescription || "[NOT SET]"}
  Content:
    ${contentSummary || "[No content sections]"}`;
    })
    .join("\n");

  const user = `Analyze this website for SEO:

SITE INFORMATION:
Name: ${input.siteName}
Description: ${input.siteDescription || "[NOT SET]"}
Site Meta Title: ${input.metaTitle || "[NOT SET]"}
Site Meta Description: ${input.metaDescription || "[NOT SET]"}

PAGES:
${pagesSummary}

Please analyze this site and provide SEO recommendations. Focus on high-impact improvements first.`;

  return { system, user };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Summarize section content for the AI prompt
 */
function summarizeSectionContent(
  blockType: string,
  content: unknown
): string | null {
  if (!content || typeof content !== "object") return null;

  const c = content as Record<string, unknown>;

  switch (blockType) {
    case "hero":
      return `[Hero] Heading: "${c.heading || ""}" | Subheading: "${c.subheading || ""}"`;

    case "text":
      const textBody = c.body as string | undefined;
      if (textBody) {
        // Extract plain text from HTML
        const plainText = textBody
          .replace(/<[^>]*>/g, " ")
          .replace(/\s+/g, " ")
          .trim();
        const preview =
          plainText.length > 200
            ? plainText.substring(0, 200) + "..."
            : plainText;
        return `[Text] ${preview}`;
      }
      return null;

    case "features":
      const features = c.features as Array<{ title?: string }> | undefined;
      if (features?.length) {
        const titles = features.map((f) => f.title).filter(Boolean);
        return `[Features] ${features.length} features: ${titles.join(", ")}`;
      }
      return null;

    case "cta":
      return `[CTA] "${c.heading || ""}" - Button: "${c.buttonText || ""}"`;

    case "testimonials":
      const testimonials = c.testimonials as Array<unknown> | undefined;
      return testimonials?.length
        ? `[Testimonials] ${testimonials.length} testimonials`
        : null;

    case "contact":
      return `[Contact Form] "${c.heading || ""}"`;

    case "image":
      const imgAlt = c.alt as string | undefined;
      return `[Image] Alt: "${imgAlt || "[NOT SET]"}"`;

    case "gallery":
      const images = c.images as Array<{ alt?: string }> | undefined;
      if (images?.length) {
        const withAlt = images.filter((img) => img.alt?.trim()).length;
        return `[Gallery] ${images.length} images (${withAlt} with alt text)`;
      }
      return null;

    case "embed":
      return `[Embed] ${c.title || "Embedded content"}`;

    default:
      return null;
  }
}
