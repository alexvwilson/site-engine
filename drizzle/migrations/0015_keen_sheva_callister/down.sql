-- Down Migration: 0015_keen_sheva_callister
-- Rollback logo generation jobs table and brand_personality column
-- WARNING: This will permanently delete all logo generation job data

-- Drop indexes first
DROP INDEX IF EXISTS "logo_generation_jobs_status_idx";
DROP INDEX IF EXISTS "logo_generation_jobs_user_id_idx";
DROP INDEX IF EXISTS "logo_generation_jobs_site_id_idx";

-- Drop foreign key constraints (handled by CASCADE on table drop)
-- DROP the logo_generation_jobs table
DROP TABLE IF EXISTS "logo_generation_jobs";

-- Remove brand_personality column from sites table
ALTER TABLE "sites" DROP COLUMN IF EXISTS "brand_personality";
