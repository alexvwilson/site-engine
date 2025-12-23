/**
 * Generate AI Summary Task (v2 - Classification-Based)
 *
 * On-demand task for generating type-specific AI summaries:
 * 1. Classifies transcript type using GPT-4.1 (meeting_notes, youtube_video, general)
 * 2. Generates markdown summary with type-specific prompt
 * 3. Streams response in real-time via Trigger.dev streams
 * 4. Saves summary to ai_summaries table with summary_type and summary_content
 */

import { logger, task, metadata, streams } from "@trigger.dev/sdk";
import { createClient } from "@supabase/supabase-js";
import { openai } from "../utils/openai";
import {
  classifyTranscript,
  buildTypeSpecificPrompt,
  type SummaryType,
} from "../utils/prompts";
import type OpenAI from "openai";

// Initialize Supabase client with service role
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface GenerateAISummaryPayload {
  userId: string;
  transcriptId: string;
  transcriptText: string;
}

// Stream types for real-time frontend updates
export type SUMMARY_STREAMS = {
  summary: OpenAI.ChatCompletionChunk;
};

export const generateAISummaryTask = task({
  id: "generate-ai-summary",
  run: async (payload: GenerateAISummaryPayload) => {
    const { userId, transcriptId, transcriptText } = payload;

    logger.info("Starting AI summary generation with classification", {
      transcriptId,
      transcriptLength: transcriptText.length,
    });

    // Initialize progress
    metadata.set("progress", 0);

    try {
      // STEP 1: Classify transcript type (0-10% progress)
      logger.info("Classifying transcript type with GPT-4.1");
      metadata.set("progress", 5);

      const summaryType: SummaryType = await classifyTranscript(transcriptText);

      logger.info("Transcript classified", {
        summaryType,
        transcriptPreview: transcriptText.substring(0, 200),
      });

      metadata.set("progress", 10);

      // STEP 2: Build type-specific prompt
      const prompt = buildTypeSpecificPrompt(summaryType, transcriptText);

      logger.info("Built type-specific prompt", {
        summaryType,
        promptLength: prompt.length,
      });

      // STEP 3: Generate markdown summary with streaming (10-90% progress)
      logger.info("Calling GPT-4.1 API with streaming for markdown summary", {
        model: "gpt-4.1",
        summaryType,
      });

      metadata.set("progress", 15);

      // Call GPT-4.1 with streaming enabled (markdown output, NOT JSON mode)
      const completion = await openai.chat.completions.create({
        model: "gpt-4.1",
        messages: [
          {
            role: "system",
            content:
              "You are an expert content analyst. Generate comprehensive, well-formatted markdown summaries.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        stream: true, // Enable streaming
      });

      // Register the stream with Trigger.dev for real-time frontend updates
      const { stream } = await streams.pipe("summary", completion);

      // Accumulate the full markdown response as we stream
      let markdownSummary = "";

      logger.info("Streaming AI summary generation...");

      // Read the stream and build the full response
      let chunkCount = 0;
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        markdownSummary += content;
        chunkCount++;

        // Update progress gradually during streaming (15% -> 90%)
        if (chunkCount % 10 === 0) {
          const currentProgress = Math.min(
            90,
            15 + Math.floor((chunkCount / 100) * 75)
          );
          metadata.set("progress", currentProgress);
        }
      }

      logger.info("Streaming complete", {
        chunkCount,
        markdownLength: markdownSummary.length,
      });

      metadata.set("progress", 90);

      if (!markdownSummary.trim()) {
        throw new Error("GPT-4.1 returned empty response");
      }

      logger.info("AI summary generated successfully", {
        summaryType,
        markdownLength: markdownSummary.length,
      });

      // STEP 4: Save summary to database (90-100% progress)
      logger.info("Saving summary to database");
      metadata.set("progress", 92);

      // Insert AI summary with v2 schema
      const { error: insertError } = await supabase
        .from("ai_summaries")
        .insert({
          transcript_id: transcriptId,
          user_id: userId,
          summary_type: summaryType,
          summary_content: markdownSummary,
        });

      if (insertError) {
        throw new Error(`Failed to save AI summary: ${insertError.message}`);
      }

      logger.info("AI summary saved to database");

      metadata.set("progress", 100);

      logger.info("AI summary generation completed successfully", {
        transcriptId,
        summaryType,
      });

      return {
        success: true,
        transcriptId,
        summaryType,
        summaryGenerated: true,
        markdownLength: markdownSummary.length,
      };
    } catch (error) {
      logger.error("AI summary generation failed", {
        error,
        message: error instanceof Error ? error.message : String(error),
      });

      // Set progress to indicate failure
      metadata.set("progress", 0);

      throw error;
    }
  },
});
