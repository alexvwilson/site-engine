/**
 * Layout Suggestion Task
 *
 * Generates section suggestions for a page based on user description.
 * Uses OpenAI gpt-4o to analyze page purpose and recommend appropriate sections.
 */

import { schemaTask, logger, metadata } from "@trigger.dev/sdk";
import { z } from "zod";
import { db } from "@/lib/drizzle/db";
import { layoutSuggestionJobs } from "@/lib/drizzle/schema";
import { eq } from "drizzle-orm";
import { generateStructuredOutput } from "../utils/ai-providers";
import { buildLayoutSuggestionPrompt } from "../utils/layout-prompts";
import type { LayoutSuggestion } from "@/lib/drizzle/schema/layout-suggestion-jobs";

// ============================================================================
// Response Schema
// ============================================================================

const blockTypeEnum = z.enum([
  "header",
  "hero",
  "text",
  "image",
  "gallery",
  "features",
  "cta",
  "testimonials",
  "contact",
  "footer",
]);

const layoutSuggestionResponseSchema = z.object({
  suggestions: z.array(
    z.object({
      blockType: blockTypeEnum,
      rationale: z.string(),
      suggestedContent: z.record(z.unknown()),
    })
  ),
  overallRationale: z.string(),
});

// ============================================================================
// Task Definition
// ============================================================================

export const suggestLayout = schemaTask({
  id: "suggest-layout",
  schema: z.object({
    jobId: z.string().uuid(),
  }),
  run: async ({ jobId }) => {
    logger.info("Starting layout suggestion generation", { jobId });

    // ========================================================================
    // Step 1: Fetch job and validate (0%)
    // ========================================================================
    metadata.set("progress", 0);
    metadata.set("status", "pending");
    metadata.set("step", "Initializing...");

    const [job] = await db
      .select()
      .from(layoutSuggestionJobs)
      .where(eq(layoutSuggestionJobs.id, jobId))
      .limit(1);

    if (!job) {
      throw new Error(`Layout suggestion job not found: ${jobId}`);
    }

    // Update to processing
    await db
      .update(layoutSuggestionJobs)
      .set({
        status: "processing",
        progress_percentage: 10,
        updated_at: new Date(),
      })
      .where(eq(layoutSuggestionJobs.id, jobId));

    metadata.set("progress", 10);
    metadata.set("status", "processing");
    metadata.set("step", "Analyzing page requirements...");

    // ========================================================================
    // Step 2: Generate suggestions via AI (10% -> 80%)
    // ========================================================================
    logger.info("Calling AI for layout suggestions", {
      description: job.description.slice(0, 100),
    });

    metadata.set("progress", 20);
    metadata.set("step", "Generating section recommendations...");

    const prompt = buildLayoutSuggestionPrompt(job.description);

    let aiResponse;
    try {
      aiResponse = await generateStructuredOutput(
        prompt.system,
        prompt.user,
        layoutSuggestionResponseSchema,
        { provider: "openai", model: "gpt-4o" }
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "AI generation failed";
      logger.error("AI generation failed", { error: errorMessage });

      await db
        .update(layoutSuggestionJobs)
        .set({
          status: "failed",
          error_message: errorMessage,
          updated_at: new Date(),
        })
        .where(eq(layoutSuggestionJobs.id, jobId));

      metadata.set("status", "failed");
      metadata.set("step", "Generation failed");
      throw error;
    }

    logger.info("AI response received", {
      suggestionCount: aiResponse.suggestions.length,
      blockTypes: aiResponse.suggestions.map((s) => s.blockType),
    });

    metadata.set("progress", 80);
    metadata.set("step", "Processing suggestions...");

    // ========================================================================
    // Step 3: Save suggestions to database (80% -> 100%)
    // ========================================================================
    const suggestions: LayoutSuggestion[] = aiResponse.suggestions.map((s) => ({
      blockType: s.blockType,
      rationale: s.rationale,
      suggestedContent: s.suggestedContent,
    }));

    await db
      .update(layoutSuggestionJobs)
      .set({
        status: "completed",
        progress_percentage: 100,
        suggestions,
        updated_at: new Date(),
      })
      .where(eq(layoutSuggestionJobs.id, jobId));

    metadata.set("progress", 100);
    metadata.set("status", "completed");
    metadata.set("step", "Suggestions ready!");

    logger.info("Layout suggestion completed", {
      jobId,
      suggestionCount: suggestions.length,
    });

    return {
      success: true,
      jobId,
      suggestions,
      overallRationale: aiResponse.overallRationale,
    };
  },
});
