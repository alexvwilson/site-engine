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
// Site Management
// ============================================================================

/**
 * Sites table - User-created websites
 * Core entity for the Site Engine application
 */
export * from "./sites";

/**
 * Pages table - Individual pages within sites
 * Each page belongs to one site and can be set as homepage
 */
export * from "./pages";

/**
 * Sections table - Content blocks within pages
 * Each section has a block type and JSONB content
 */
export * from "./sections";

/**
 * Blog Posts table - Blog entries within sites
 * Separate content type for time-based articles and news
 */
export * from "./blog-posts";

/**
 * Blog Categories table - Categories for organizing blog posts
 * Each category belongs to one site, posts can have one category
 */
export * from "./blog-categories";

/**
 * Contact Submissions table - Form submissions from published sites
 * Unique per email per site, stores contact info only
 */
export * from "./contact-submissions";

// ============================================================================
// Theme Management
// ============================================================================

/**
 * Theme types - TypeScript interfaces for theme data structures
 * Used by theme generation jobs, saved themes, and frontend components
 */
export * from "./theme-types";

/**
 * Theme generation jobs table - Tracks AI theme generation progress
 * Supports Quick Generate (single call) and Guided Generate (multi-stage)
 */
export * from "./theme-generation-jobs";

/**
 * Themes table - Saved theme versions per site
 * Each site can have multiple themes with one active
 */
export * from "./themes";

// ============================================================================
// AI Features
// ============================================================================

/**
 * Layout suggestion jobs table - Tracks AI layout suggestion requests
 * Users describe page purpose and receive section recommendations
 */
export * from "./layout-suggestion-jobs";

/**
 * Logo generation jobs table - Tracks AI logo prompt generation
 * Generates ChatGPT-ready prompts based on site context and brand personality
 */
export * from "./logo-generation-jobs";
