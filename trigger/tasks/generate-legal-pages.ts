/**
 * Legal Page Generation Task
 *
 * Generates Privacy Policy, Terms of Service, and Cookie Policy
 * for child sites using GPT-4o. Creates pages and updates footer links.
 */

import { schemaTask, logger, metadata } from "@trigger.dev/sdk";
import { z } from "zod";
import { db } from "@/lib/drizzle/db";
import {
  legalGenerationJobs,
  pages,
  sections,
  sites,
} from "@/lib/drizzle/schema";
import { eq, and } from "drizzle-orm";
import { generateStructuredOutput } from "../utils/ai-providers";
import {
  buildLegalPrompt,
  legalContentSchema,
  LEGAL_PAGE_CONFIG,
  type LegalContentResponse,
} from "../utils/legal-prompts";
import type {
  LegalPageType,
  LegalCreatedPageIds,
} from "@/lib/drizzle/schema/legal-generation-jobs";
import type { FooterContent, FooterLink } from "@/lib/section-types";

// ============================================================================
// Task Definition
// ============================================================================

export const generateLegalPages = schemaTask({
  id: "generate-legal-pages",
  schema: z.object({
    jobId: z.string().uuid(),
  }),
  run: async ({ jobId }) => {
    logger.info("Starting legal page generation", { jobId });

    // ========================================================================
    // Step 1: Fetch job and validate (0-5%)
    // ========================================================================
    metadata.set("progress", 0);
    metadata.set("status", "pending");
    metadata.set("step", "Initializing...");

    const [job] = await db
      .select()
      .from(legalGenerationJobs)
      .where(eq(legalGenerationJobs.id, jobId))
      .limit(1);

    if (!job) {
      throw new Error(`Legal generation job not found: ${jobId}`);
    }

    const [site] = await db
      .select()
      .from(sites)
      .where(eq(sites.id, job.site_id))
      .limit(1);

    if (!site) {
      throw new Error(`Site not found: ${job.site_id}`);
    }

    // Update job status to generating
    await db
      .update(legalGenerationJobs)
      .set({
        status: "generating",
        progress_percentage: 5,
        updated_at: new Date(),
      })
      .where(eq(legalGenerationJobs.id, jobId));

    metadata.set("progress", 5);
    metadata.set("status", "generating");
    metadata.set("step", "Analyzing business context...");

    // ========================================================================
    // Step 2: Build prompt and generate content (5-60%)
    // ========================================================================
    logger.info("Building legal prompt", {
      siteName: site.name,
      businessType: job.business_type,
      jurisdiction: job.jurisdiction,
      pagesToGenerate: job.pages_to_generate,
    });

    const prompt = buildLegalPrompt({
      siteName: site.name,
      siteSlug: site.slug,
      businessType: job.business_type,
      dataCollection: job.data_collection,
      jurisdiction: job.jurisdiction,
      pagesToGenerate: job.pages_to_generate,
    });

    metadata.set("progress", 10);
    metadata.set("step", "Generating legal content with AI...");

    let aiResponse: LegalContentResponse;
    try {
      aiResponse = await generateStructuredOutput(
        prompt.system,
        prompt.user,
        legalContentSchema,
        {
          provider: "openai",
          model: "gpt-4o",
          temperature: 0.3, // Lower temperature for more consistent legal content
          maxTokens: 8000, // Legal content can be lengthy
        }
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "AI generation failed";
      logger.error("AI generation failed", { error: errorMessage });

      await db
        .update(legalGenerationJobs)
        .set({
          status: "failed",
          error_message: errorMessage,
          updated_at: new Date(),
        })
        .where(eq(legalGenerationJobs.id, jobId));

      metadata.set("status", "failed");
      metadata.set("step", "Generation failed");
      throw error;
    }

    logger.info("AI response received", {
      hasPrivacy: !!aiResponse.privacy,
      hasTerms: !!aiResponse.terms,
      hasCookies: !!aiResponse.cookies,
    });

    metadata.set("progress", 60);
    metadata.set("step", "Creating pages...");

    // ========================================================================
    // Step 3: Create pages and sections (60-85%)
    // ========================================================================
    const createdPageIds: LegalCreatedPageIds = {};
    const pageTypes: LegalPageType[] = ["privacy", "terms", "cookies"];

    for (const pageType of pageTypes) {
      const content = aiResponse[pageType];
      if (!content) continue;

      const config = LEGAL_PAGE_CONFIG[pageType];

      // Check if page with this slug already exists
      const [existingPage] = await db
        .select({ id: pages.id })
        .from(pages)
        .where(and(eq(pages.site_id, job.site_id), eq(pages.slug, config.slug)))
        .limit(1);

      let pageId: string;

      if (existingPage) {
        // Update existing page's section content
        pageId = existingPage.id;
        logger.info("Updating existing legal page", {
          pageType,
          pageId,
          slug: config.slug,
        });

        // Find and update the first text section, or create one
        const [existingSection] = await db
          .select({ id: sections.id })
          .from(sections)
          .where(
            and(
              eq(sections.page_id, pageId),
              eq(sections.block_type, "text")
            )
          )
          .limit(1);

        if (existingSection) {
          await db
            .update(sections)
            .set({
              content: { body: content },
              updated_at: new Date(),
            })
            .where(eq(sections.id, existingSection.id));
        } else {
          await db.insert(sections).values({
            page_id: pageId,
            user_id: job.user_id,
            block_type: "text",
            content: { body: content },
            position: 0,
            status: "published",
          });
        }
      } else {
        // Create new page
        const [newPage] = await db
          .insert(pages)
          .values({
            site_id: job.site_id,
            user_id: job.user_id,
            title: config.title,
            slug: config.slug,
            status: "published",
            published_at: new Date(),
          })
          .returning({ id: pages.id });

        pageId = newPage.id;
        logger.info("Created new legal page", {
          pageType,
          pageId,
          slug: config.slug,
        });

        // Add text section with generated content
        await db.insert(sections).values({
          page_id: pageId,
          user_id: job.user_id,
          block_type: "text",
          content: { body: content },
          position: 0,
          status: "published",
        });
      }

      createdPageIds[pageType] = pageId;

      // Update progress incrementally
      const progressPerPage = 8;
      const currentProgress = 60 + (pageTypes.indexOf(pageType) + 1) * progressPerPage;
      metadata.set("progress", Math.min(currentProgress, 84));
    }

    metadata.set("progress", 85);
    metadata.set("step", "Updating footer links...");

    // ========================================================================
    // Step 4: Update footer links (85-95%)
    // ========================================================================
    const currentFooter = (site.footer_content as FooterContent | null) ?? {
      copyright: `© ${new Date().getFullYear()} ${site.name}`,
      links: [],
    };

    // Legal link labels to replace/add
    const legalLinkLabels = ["Privacy Policy", "Terms of Service", "Cookie Policy"];

    // Remove existing legal links
    const existingNonLegalLinks = currentFooter.links.filter(
      (link) => !legalLinkLabels.includes(link.label)
    );

    // Build new legal links based on created pages
    const newLegalLinks: FooterLink[] = [];

    if (createdPageIds.privacy) {
      newLegalLinks.push({
        label: "Privacy Policy",
        url: `/${LEGAL_PAGE_CONFIG.privacy.slug}`,
      });
    }
    if (createdPageIds.terms) {
      newLegalLinks.push({
        label: "Terms of Service",
        url: `/${LEGAL_PAGE_CONFIG.terms.slug}`,
      });
    }
    if (createdPageIds.cookies) {
      newLegalLinks.push({
        label: "Cookie Policy",
        url: `/${LEGAL_PAGE_CONFIG.cookies.slug}`,
      });
    }

    // Update site footer content
    const updatedFooter: FooterContent = {
      ...currentFooter,
      links: [...existingNonLegalLinks, ...newLegalLinks],
    };

    await db
      .update(sites)
      .set({
        footer_content: updatedFooter,
        updated_at: new Date(),
      })
      .where(eq(sites.id, job.site_id));

    logger.info("Footer links updated", {
      totalLinks: updatedFooter.links.length,
      legalLinks: newLegalLinks.length,
    });

    metadata.set("progress", 95);
    metadata.set("step", "Saving results...");

    // ========================================================================
    // Step 5: Mark job complete (95-100%)
    // ========================================================================
    await db
      .update(legalGenerationJobs)
      .set({
        status: "completed",
        progress_percentage: 100,
        generated_content: aiResponse,
        created_page_ids: createdPageIds,
        updated_at: new Date(),
      })
      .where(eq(legalGenerationJobs.id, jobId));

    metadata.set("progress", 100);
    metadata.set("status", "completed");
    metadata.set("step", "Complete!");

    logger.info("Legal page generation completed", {
      jobId,
      createdPages: Object.keys(createdPageIds),
    });

    return {
      success: true,
      jobId,
      createdPageIds,
    };
  },
});
