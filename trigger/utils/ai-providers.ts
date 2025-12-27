/**
 * AI Provider Abstraction
 *
 * Wrapper for AI API calls with structured JSON output support.
 * Currently supports OpenAI GPT-4o, designed for future multi-provider expansion.
 */

import { z } from "zod";
import { openai } from "./openai";
import { logger } from "@trigger.dev/sdk";

// ============================================================================
// Types
// ============================================================================

/**
 * Supported AI providers (extensible for future providers)
 */
export type AIProvider = "openai" | "anthropic" | "google";

/**
 * AI provider configuration
 */
export interface AIConfig {
  provider: AIProvider;
  model: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Default configuration for theme generation
 */
export const DEFAULT_AI_CONFIG: AIConfig = {
  provider: "openai",
  model: "gpt-4o",
  temperature: 0.7,
  maxTokens: 4096,
};

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Generate structured JSON output from AI with Zod validation.
 *
 * Uses OpenAI's JSON mode for reliable structured output.
 * Validates response against provided Zod schema.
 *
 * @param systemPrompt - System context for the AI
 * @param userPrompt - User's request/requirements
 * @param schema - Zod schema for response validation
 * @param config - AI configuration (optional, uses defaults)
 * @returns Validated response matching the schema type
 * @throws Error if AI response fails validation
 */
export async function generateStructuredOutput<T extends z.ZodTypeAny>(
  systemPrompt: string,
  userPrompt: string,
  schema: T,
  config: Partial<AIConfig> = {}
): Promise<z.infer<T>> {
  const finalConfig = { ...DEFAULT_AI_CONFIG, ...config };

  logger.info("Generating structured output", {
    provider: finalConfig.provider,
    model: finalConfig.model,
  });

  if (finalConfig.provider !== "openai") {
    throw new Error(
      `Provider "${finalConfig.provider}" not yet supported. Only "openai" is available.`
    );
  }

  const response = await openai.chat.completions.create({
    model: finalConfig.model,
    temperature: finalConfig.temperature,
    max_tokens: finalConfig.maxTokens,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  const content = response.choices[0]?.message?.content;

  if (!content) {
    throw new Error("AI returned empty response");
  }

  logger.info("Received AI response", {
    length: content.length,
    model: response.model,
    usage: response.usage,
  });

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    logger.error("Failed to parse AI response as JSON", { content });
    throw new Error("AI response is not valid JSON");
  }

  const result = schema.safeParse(parsed);

  if (!result.success) {
    logger.error("AI response failed schema validation", {
      errors: result.error.errors,
      received: parsed,
    });
    throw new Error(
      `AI response validation failed: ${result.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")}`
    );
  }

  return result.data;
}

/**
 * Generate text output from AI (non-structured).
 * Useful for rationale explanations or free-form content.
 *
 * @param systemPrompt - System context for the AI
 * @param userPrompt - User's request
 * @param config - AI configuration (optional)
 * @returns AI response as string
 */
export async function generateTextOutput(
  systemPrompt: string,
  userPrompt: string,
  config: Partial<AIConfig> = {}
): Promise<string> {
  const finalConfig = { ...DEFAULT_AI_CONFIG, ...config };

  if (finalConfig.provider !== "openai") {
    throw new Error(
      `Provider "${finalConfig.provider}" not yet supported. Only "openai" is available.`
    );
  }

  const response = await openai.chat.completions.create({
    model: finalConfig.model,
    temperature: finalConfig.temperature,
    max_tokens: finalConfig.maxTokens,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  const content = response.choices[0]?.message?.content;

  if (!content) {
    throw new Error("AI returned empty response");
  }

  return content;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get display name for AI provider
 */
export function getProviderDisplayName(provider: AIProvider): string {
  const names: Record<AIProvider, string> = {
    openai: "OpenAI",
    anthropic: "Anthropic",
    google: "Google",
  };
  return names[provider];
}

/**
 * Check if a provider is currently supported
 */
export function isProviderSupported(provider: AIProvider): boolean {
  return provider === "openai";
}
