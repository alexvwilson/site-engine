/**
 * Trigger.dev Tasks Index
 *
 * Exports all tasks for Trigger.dev to discover and register.
 * This file is referenced in trigger.config.ts dirs: ["./trigger"]
 */

// ============================================================================
// Tasks
// ============================================================================

// Theme generation tasks
export * from "./tasks/generate-theme-quick";

// Layout suggestion task
export * from "./tasks/suggest-layout";

// Domain verification task
export * from "./tasks/verify-domain";

// ============================================================================
// Utilities
// ============================================================================

// OpenAI client singleton
export * from "./utils/openai";

// AI provider abstraction (structured output, multi-provider support)
export * from "./utils/ai-providers";

// Font list and validation
export * from "./utils/font-list";

// Theme parsing with Zod validation
export * from "./utils/theme-parser";

// Theme prompt templates
export * from "./utils/theme-prompts";

// Tailwind config and CSS variables generation
export * from "./utils/tailwind-generator";

// Layout suggestion prompts
export * from "./utils/layout-prompts";
