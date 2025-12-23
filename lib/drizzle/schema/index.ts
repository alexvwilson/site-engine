/**
 * Database Schema Index
 *
 * Barrel export file for all Drizzle ORM table schemas.
 * Organized by domain for better discoverability.
 */

// ============================================================================
// User Management
// ============================================================================

/**
 * Users table - Application user profiles (references auth.users.id)
 * Includes role-based access control
 */
export * from "./users";

// ============================================================================
// Transcription Core
// ============================================================================

/**
 * Transcription Jobs - File upload and background processing tracking
 * Manages job status (pending/processing/completed/failed) and Trigger.dev integration
 */
export * from "./transcription-jobs";

/**
 * Transcripts - Completed transcription results in multiple formats
 * Stores plain text, SRT, VTT, JSON, and word-level timestamps
 */
export * from "./transcripts";

// ============================================================================
// AI Features
// ============================================================================

/**
 * AI Summaries - Generated summaries of transcripts
 * Powered by AI models for quick transcript insights
 */
export * from "./ai-summaries";

/**
 * Transcript Conversations - Chat conversations about specific transcripts
 * Enables Q&A and discussion threads on transcription content
 */
export * from "./transcript-conversations";

/**
 * Transcript Messages - Individual messages within transcript conversations
 * Stores user and AI messages with model references
 */
export * from "./transcript-messages";
