-- Down Migration: 0007_thankful_pyro
-- Reverts: Layout Suggestion Jobs table creation
-- Created: 2025-12-26
--
-- WARNING: This migration will DROP the layout_suggestion_jobs table.
-- All layout suggestion job data will be permanently lost.
-- This is acceptable in development but should be carefully considered in production.

-- ============================================================================
-- Step 1: Drop indexes (safe - IF EXISTS)
-- ============================================================================

DROP INDEX IF EXISTS "idx_layout_jobs_page_id";
DROP INDEX IF EXISTS "idx_layout_jobs_user_id";

-- ============================================================================
-- Step 2: Drop foreign key constraints (if they exist)
-- ============================================================================

ALTER TABLE IF EXISTS "layout_suggestion_jobs"
  DROP CONSTRAINT IF EXISTS "layout_suggestion_jobs_page_id_pages_id_fk";

ALTER TABLE IF EXISTS "layout_suggestion_jobs"
  DROP CONSTRAINT IF EXISTS "layout_suggestion_jobs_user_id_users_id_fk";

-- ============================================================================
-- Step 3: Drop the table
-- ============================================================================

DROP TABLE IF EXISTS "layout_suggestion_jobs";

-- ============================================================================
-- Step 4: Drop the enum type
-- ============================================================================

DROP TYPE IF EXISTS "layout_job_status";

-- ============================================================================
-- Verification (optional - run manually to confirm rollback)
-- ============================================================================
-- SELECT EXISTS (
--   SELECT FROM information_schema.tables
--   WHERE table_name = 'layout_suggestion_jobs'
-- ) AS table_exists;
