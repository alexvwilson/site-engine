-- Down Migration: 0006_luxuriant_red_skull
-- Rollback: Remove theme_generation_jobs and themes tables
-- WARNING: This will delete all theme generation job data and saved themes!

-- Drop indexes on themes table
DROP INDEX IF EXISTS "themes_generation_job_id_idx";
DROP INDEX IF EXISTS "themes_is_active_idx";
DROP INDEX IF EXISTS "themes_user_id_idx";
DROP INDEX IF EXISTS "themes_site_id_idx";

-- Drop indexes on theme_generation_jobs table
DROP INDEX IF EXISTS "theme_generation_jobs_created_at_idx";
DROP INDEX IF EXISTS "theme_generation_jobs_status_idx";
DROP INDEX IF EXISTS "theme_generation_jobs_user_id_idx";
DROP INDEX IF EXISTS "theme_generation_jobs_site_id_idx";

-- Drop foreign key constraints on themes table
ALTER TABLE IF EXISTS "themes" DROP CONSTRAINT IF EXISTS "themes_generation_job_id_theme_generation_jobs_id_fk";
ALTER TABLE IF EXISTS "themes" DROP CONSTRAINT IF EXISTS "themes_user_id_users_id_fk";
ALTER TABLE IF EXISTS "themes" DROP CONSTRAINT IF EXISTS "themes_site_id_sites_id_fk";

-- Drop foreign key constraints on theme_generation_jobs table
ALTER TABLE IF EXISTS "theme_generation_jobs" DROP CONSTRAINT IF EXISTS "theme_generation_jobs_user_id_users_id_fk";
ALTER TABLE IF EXISTS "theme_generation_jobs" DROP CONSTRAINT IF EXISTS "theme_generation_jobs_site_id_sites_id_fk";

-- Drop tables (themes first because it references theme_generation_jobs)
DROP TABLE IF EXISTS "themes";
DROP TABLE IF EXISTS "theme_generation_jobs";
