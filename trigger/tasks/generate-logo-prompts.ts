/**
 * Logo Prompt Generation Task
 *
 * Generates 10 ChatGPT-ready logo prompts based on site context.
 * Uses SnapAI methodology for high-quality image generation prompts.
 */

import { schemaTask, logger, metadata } from "@trigger.dev/sdk";
import { z } from "zod";
import { db } from "@/lib/drizzle/db";
import { logoGenerationJobs } from "@/lib/drizzle/schema";
import { eq } from "drizzle-orm";
import { generateStructuredOutput } from "../utils/ai-providers";
import { buildLogoPrompt, logoConceptsSchema } from "../utils/logo-prompts";

// ============================================================================
// Task Definition
// ============================================================================

export const generateLogoPrompts = schemaTask({
  id: "generate-logo-prompts",
  schema: z.object({
    jobId: z.string().uuid(),
  }),
  run: async ({ jobId }) => {
    logger.info("Starting logo prompt generation", { jobId });

    // ========================================================================
    // Step 1: Fetch job and validate (0%)
    // ========================================================================
    metadata.set("progress", 0);
    metadata.set("status", "pending");
    metadata.set("step", "Initializing...");

    const [job] = await db
      .select()
      .from(logoGenerationJobs)
      .where(eq(logoGenerationJobs.id, jobId))
      .limit(1);

    if (!job) {
      throw new Error(`Logo generation job not found: ${jobId}`);
    }

    // Update job status to generating
    await db
      .update(logoGenerationJobs)
      .set({
        status: "generating",
        progress_percentage: 5,
        updated_at: new Date(),
      })
      .where(eq(logoGenerationJobs.id, jobId));

    metadata.set("progress", 5);
    metadata.set("status", "generating");
    metadata.set("step", "Analyzing brand context...");

    // ========================================================================
    // Step 2: Build prompt from context (5% -> 15%)
    // ========================================================================
    logger.info("Building logo prompt", {
      siteName: job.site_name,
      personality: job.brand_personality,
      primaryColor: job.primary_color,
    });

    const prompt = buildLogoPrompt({
      siteName: job.site_name,
      siteDescription: job.site_description,
      brandPersonality: job.brand_personality,
      primaryColor: job.primary_color,
    });

    metadata.set("progress", 15);
    metadata.set("step", "Generating 10 logo concepts...");

    // ========================================================================
    // Step 3: Call OpenAI for logo concepts (15% -> 85%)
    // ========================================================================
    logger.info("Calling AI for logo concept generation");

    let aiResponse;
    try {
      aiResponse = await generateStructuredOutput(
        prompt.system,
        prompt.user,
        logoConceptsSchema,
        {
          provider: "openai",
          model: "gpt-4o",
          temperature: 0.8, // Slightly higher for creative variety
          maxTokens: 4096,
        }
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "AI generation failed";
      logger.error("AI generation failed", { error: errorMessage });

      await db
        .update(logoGenerationJobs)
        .set({
          status: "failed",
          error_message: errorMessage,
          updated_at: new Date(),
        })
        .where(eq(logoGenerationJobs.id, jobId));

      metadata.set("status", "failed");
      metadata.set("step", "Generation failed");
      throw error;
    }

    logger.info("AI response received", {
      conceptCount: aiResponse.concepts.length,
      appContext: aiResponse.appContext,
    });

    metadata.set("progress", 85);
    metadata.set("step", "Processing concepts...");

    // ========================================================================
    // Step 4: Validate and save results (85% -> 100%)
    // ========================================================================

    // Verify we have exactly 10 concepts
    if (aiResponse.concepts.length !== 10) {
      logger.warn("Unexpected concept count", {
        expected: 10,
        received: aiResponse.concepts.length,
      });
    }

    // Verify category distribution
    const decomposedCount = aiResponse.concepts.filter(
      (c) => c.category === "decomposed"
    ).length;
    const monogramCount = aiResponse.concepts.filter(
      (c) => c.category === "monogram"
    ).length;
    const snapaiCount = aiResponse.concepts.filter(
      (c) => c.category === "snapai"
    ).length;

    logger.info("Concept distribution", {
      decomposed: decomposedCount,
      monogram: monogramCount,
      snapai: snapaiCount,
    });

    // Verify recommendations
    const recommendations = aiResponse.concepts.filter((c) => c.recommendation);
    logger.info("Recommendations", {
      count: recommendations.length,
      types: recommendations.map((r) => r.recommendation),
    });

    metadata.set("progress", 95);
    metadata.set("step", "Saving results...");

    // Save to database
    await db
      .update(logoGenerationJobs)
      .set({
        status: "completed",
        progress_percentage: 100,
        generated_concepts: aiResponse,
        updated_at: new Date(),
      })
      .where(eq(logoGenerationJobs.id, jobId));

    metadata.set("progress", 100);
    metadata.set("status", "completed");
    metadata.set("step", "Complete!");

    logger.info("Logo prompt generation completed", {
      jobId,
      conceptCount: aiResponse.concepts.length,
    });

    return {
      success: true,
      jobId,
      conceptCount: aiResponse.concepts.length,
      appContext: aiResponse.appContext,
    };
  },
});
