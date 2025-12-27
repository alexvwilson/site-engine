/**
 * Quick Theme Generation Task
 *
 * Generates a complete theme in a single AI call.
 * Updates progress via Trigger.dev metadata for real-time tracking.
 */

import { schemaTask, logger, metadata } from "@trigger.dev/sdk";
import { z } from "zod";
import { db } from "@/lib/drizzle/db";
import { themeGenerationJobs, themes } from "@/lib/drizzle/schema";
import { eq } from "drizzle-orm";
import { generateStructuredOutput } from "../utils/ai-providers";
import {
  buildQuickGeneratePrompt,
  prepareRequirements,
} from "../utils/theme-prompts";
import { quickGenerateResponseSchema } from "../utils/theme-parser";
import { completeThemeData } from "../utils/tailwind-generator";
import type { ThemeData } from "@/lib/drizzle/schema/theme-types";

// ============================================================================
// Task Definition
// ============================================================================

export const generateThemeQuick = schemaTask({
  id: "generate-theme-quick",
  schema: z.object({
    jobId: z.string().uuid(),
  }),
  run: async ({ jobId }) => {
    logger.info("Starting quick theme generation", { jobId });

    // ========================================================================
    // Step 1: Fetch job and validate (0%)
    // ========================================================================
    metadata.set("progress", 0);
    metadata.set("status", "pending");
    metadata.set("step", "Initializing...");

    const [job] = await db
      .select()
      .from(themeGenerationJobs)
      .where(eq(themeGenerationJobs.id, jobId))
      .limit(1);

    if (!job) {
      throw new Error(`Theme generation job not found: ${jobId}`);
    }

    if (job.mode !== "quick") {
      throw new Error(`Job ${jobId} is not a quick generation job`);
    }

    // Update job status to generating
    await db
      .update(themeGenerationJobs)
      .set({
        status: "generating_colors",
        progress_percentage: 5,
        updated_at: new Date(),
      })
      .where(eq(themeGenerationJobs.id, jobId));

    metadata.set("progress", 5);
    metadata.set("status", "generating");
    metadata.set("step", "Preparing requirements...");

    // ========================================================================
    // Step 2: Generate complete theme via AI (5% -> 80%)
    // ========================================================================
    logger.info("Calling AI for theme generation", {
      requirements: job.requirements,
    });

    metadata.set("progress", 10);
    metadata.set("step", "Generating colors, typography, and components...");

    const sanitizedRequirements = prepareRequirements(job.requirements);
    const prompt = buildQuickGeneratePrompt(sanitizedRequirements);

    let aiResponse;
    try {
      aiResponse = await generateStructuredOutput(
        prompt.system,
        prompt.user,
        quickGenerateResponseSchema,
        {
          provider: job.ai_provider as "openai",
          model: job.ai_model,
        }
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "AI generation failed";
      logger.error("AI generation failed", { error: errorMessage });

      await db
        .update(themeGenerationJobs)
        .set({
          status: "failed",
          error_message: errorMessage,
          updated_at: new Date(),
        })
        .where(eq(themeGenerationJobs.id, jobId));

      metadata.set("status", "failed");
      metadata.set("step", "Generation failed");
      throw error;
    }

    logger.info("AI response received", {
      colors: aiResponse.colors.primary,
      headingFont: aiResponse.typography.headingFont.family,
      bodyFont: aiResponse.typography.bodyFont.family,
    });

    metadata.set("progress", 80);
    metadata.set("step", "Processing theme data...");

    // ========================================================================
    // Step 3: Build complete ThemeData with Tailwind/CSS outputs (80% -> 90%)
    // ========================================================================
    await db
      .update(themeGenerationJobs)
      .set({
        status: "finalizing",
        progress_percentage: 80,
        color_data: aiResponse.colors,
        typography_data: aiResponse.typography,
        component_data: aiResponse.components,
        updated_at: new Date(),
      })
      .where(eq(themeGenerationJobs.id, jobId));

    // Construct base theme data
    const baseThemeData: ThemeData = {
      colors: aiResponse.colors,
      typography: aiResponse.typography,
      components: aiResponse.components,
      tailwindExtends: {},
      cssVariables: "",
      generatedAt: new Date().toISOString(),
      aiProvider: job.ai_provider,
      aiModel: job.ai_model,
    };

    // Generate Tailwind extends and CSS variables
    const completeTheme = completeThemeData(baseThemeData);

    metadata.set("progress", 90);
    metadata.set("step", "Saving theme...");

    // ========================================================================
    // Step 4: Save theme to database (90% -> 100%)
    // ========================================================================
    logger.info("Saving completed theme", { jobId });

    // Create the theme record
    const themeName = `${sanitizedRequirements.brandName} Theme - ${new Date().toLocaleDateString()}`;

    // Check if this is the first theme for this site (to set as active)
    const existingThemes = await db
      .select({ id: themes.id })
      .from(themes)
      .where(eq(themes.site_id, job.site_id))
      .limit(1);

    const isFirstTheme = existingThemes.length === 0;

    const [savedTheme] = await db
      .insert(themes)
      .values({
        site_id: job.site_id,
        user_id: job.user_id,
        generation_job_id: jobId,
        name: themeName,
        is_active: isFirstTheme, // First theme is automatically active
        data: completeTheme,
      })
      .returning();

    // Update job as completed
    await db
      .update(themeGenerationJobs)
      .set({
        status: "completed",
        progress_percentage: 100,
        final_theme_data: completeTheme,
        updated_at: new Date(),
      })
      .where(eq(themeGenerationJobs.id, jobId));

    metadata.set("progress", 100);
    metadata.set("status", "completed");
    metadata.set("step", "Theme generated successfully!");

    logger.info("Quick theme generation completed", {
      jobId,
      themeId: savedTheme.id,
      isFirstTheme,
    });

    return {
      success: true,
      jobId,
      themeId: savedTheme.id,
      themeName: savedTheme.name,
      isActive: isFirstTheme,
    };
  },
});
