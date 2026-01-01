/**
 * SEO Analysis Task
 *
 * Analyzes a site's content and structure using AI to provide
 * actionable SEO recommendations.
 */

import { schemaTask, logger, metadata } from "@trigger.dev/sdk";
import { z } from "zod";
import { db } from "@/lib/drizzle/db";
import { seoAnalysisJobs, sites, pages, sections } from "@/lib/drizzle/schema";
import { eq, asc, inArray } from "drizzle-orm";
import { generateStructuredOutput } from "../utils/ai-providers";
import {
  buildSeoAnalysisPrompt,
  seoAnalysisResponseSchema,
  type SeoAnalysisInput,
} from "../utils/seo-prompts";

// ============================================================================
// Task Definition
// ============================================================================

export const analyzeSeo = schemaTask({
  id: "analyze-seo",
  schema: z.object({
    jobId: z.string().uuid(),
  }),
  run: async ({ jobId }) => {
    logger.info("Starting SEO analysis", { jobId });

    // ========================================================================
    // Step 1: Fetch job and site data (0-10%)
    // ========================================================================
    metadata.set("progress", 0);
    metadata.set("status", "pending");
    metadata.set("step", "Initializing...");

    const [job] = await db
      .select()
      .from(seoAnalysisJobs)
      .where(eq(seoAnalysisJobs.id, jobId))
      .limit(1);

    if (!job) {
      throw new Error(`SEO analysis job not found: ${jobId}`);
    }

    const [site] = await db
      .select()
      .from(sites)
      .where(eq(sites.id, job.site_id))
      .limit(1);

    if (!site) {
      throw new Error(`Site not found: ${job.site_id}`);
    }

    // Update job status to analyzing
    await db
      .update(seoAnalysisJobs)
      .set({
        status: "analyzing",
        progress_percentage: 5,
        updated_at: new Date(),
      })
      .where(eq(seoAnalysisJobs.id, jobId));

    metadata.set("progress", 5);
    metadata.set("status", "analyzing");
    metadata.set("step", "Loading site content...");

    // ========================================================================
    // Step 2: Gather all site content (10-30%)
    // ========================================================================
    const sitePages = await db
      .select({
        id: pages.id,
        title: pages.title,
        slug: pages.slug,
        isHome: pages.is_home,
        metaTitle: pages.meta_title,
        metaDescription: pages.meta_description,
      })
      .from(pages)
      .where(eq(pages.site_id, job.site_id))
      .orderBy(asc(pages.created_at));

    metadata.set("progress", 15);
    metadata.set("step", `Analyzing ${sitePages.length} pages...`);

    // Fetch sections for all pages
    const pageIds = sitePages.map((p) => p.id);
    let allSections: Array<{
      page_id: string;
      block_type: string;
      content: unknown;
    }> = [];

    if (pageIds.length > 0) {
      allSections = await db
        .select({
          page_id: sections.page_id,
          block_type: sections.block_type,
          content: sections.content,
        })
        .from(sections)
        .where(inArray(sections.page_id, pageIds))
        .orderBy(asc(sections.position));
    }

    // Group sections by page
    const sectionsByPage = new Map<
      string,
      Array<{ blockType: string; content: unknown }>
    >();
    for (const section of allSections) {
      if (!sectionsByPage.has(section.page_id)) {
        sectionsByPage.set(section.page_id, []);
      }
      sectionsByPage.get(section.page_id)!.push({
        blockType: section.block_type,
        content: section.content,
      });
    }

    // Build input for AI analysis
    const analysisInput: SeoAnalysisInput = {
      siteName: site.name,
      siteDescription: site.description,
      metaTitle: site.meta_title,
      metaDescription: site.meta_description,
      pages: sitePages.map((page) => ({
        title: page.title,
        slug: page.slug,
        isHome: page.isHome,
        metaTitle: page.metaTitle,
        metaDescription: page.metaDescription,
        sections: sectionsByPage.get(page.id) || [],
      })),
    };

    metadata.set("progress", 30);
    metadata.set("step", "Running AI analysis...");

    await db
      .update(seoAnalysisJobs)
      .set({
        progress_percentage: 30,
        updated_at: new Date(),
      })
      .where(eq(seoAnalysisJobs.id, jobId));

    // ========================================================================
    // Step 3: Run AI Analysis (30-85%)
    // ========================================================================
    logger.info("Building SEO analysis prompt", {
      siteName: site.name,
      pageCount: sitePages.length,
      sectionCount: allSections.length,
    });

    const prompt = buildSeoAnalysisPrompt(analysisInput);

    let aiResponse;
    try {
      aiResponse = await generateStructuredOutput(
        prompt.system,
        prompt.user,
        seoAnalysisResponseSchema,
        {
          provider: "openai",
          model: "gpt-4o",
          temperature: 0.3, // Lower for more consistent analysis
          maxTokens: 4000,
        }
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "AI analysis failed";
      logger.error("AI analysis failed", { error: errorMessage });

      await db
        .update(seoAnalysisJobs)
        .set({
          status: "failed",
          error_message: errorMessage,
          updated_at: new Date(),
        })
        .where(eq(seoAnalysisJobs.id, jobId));

      metadata.set("status", "failed");
      metadata.set("step", "Analysis failed");
      throw error;
    }

    logger.info("AI analysis complete", {
      score: aiResponse.overallScore,
      recommendationCount: aiResponse.recommendations.length,
    });

    metadata.set("progress", 85);
    metadata.set("step", "Saving results...");

    // ========================================================================
    // Step 4: Save Results (85-100%)
    // ========================================================================
    const result = {
      ...aiResponse,
      analyzedAt: new Date().toISOString(),
    };

    await db
      .update(seoAnalysisJobs)
      .set({
        status: "completed",
        progress_percentage: 100,
        result,
        updated_at: new Date(),
      })
      .where(eq(seoAnalysisJobs.id, jobId));

    metadata.set("progress", 100);
    metadata.set("status", "completed");
    metadata.set("step", "Complete!");

    logger.info("SEO analysis completed", {
      jobId,
      score: aiResponse.overallScore,
      highPriority: aiResponse.recommendations.filter(
        (r) => r.priority === "high"
      ).length,
      mediumPriority: aiResponse.recommendations.filter(
        (r) => r.priority === "medium"
      ).length,
      lowPriority: aiResponse.recommendations.filter(
        (r) => r.priority === "low"
      ).length,
    });

    return {
      success: true,
      jobId,
      score: aiResponse.overallScore,
      recommendationCount: aiResponse.recommendations.length,
    };
  },
});
