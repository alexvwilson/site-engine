/**
 * Trigger.dev Tasks Index
 *
 * Exports all tasks for Trigger.dev to discover and register.
 * This file is referenced in trigger.config.ts dirs: ["./trigger"]
 */

// Export all tasks
export { extractAudioTask } from "./tasks/extract-audio";
export { chunkAudioTask } from "./tasks/chunk-audio";
export { transcribeAudioTask } from "./tasks/transcribe-audio";
export { generateAISummaryTask } from "./tasks/generate-ai-summary";

// Export utilities for use in other parts of the application
export * from "./utils/ffmpeg";
export * from "./utils/formats";
export * from "./utils/openai";
export * from "./utils/prompts";
