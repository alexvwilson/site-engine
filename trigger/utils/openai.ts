/**
 * OpenAI Client Utility
 *
 * Singleton OpenAI client for GPT-4o API calls.
 * Used by theme generation and layout suggestion tasks.
 */

import OpenAI from "openai";

// Validate API key
if (!process.env.OPENAI_API_KEY) {
  throw new Error(
    "OPENAI_API_KEY environment variable is required for GPT-4o",
  );
}

// Create singleton OpenAI client
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Export OpenAI types for convenience
export type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
