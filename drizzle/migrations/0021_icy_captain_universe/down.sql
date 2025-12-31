-- Down Migration: 0021_icy_captain_universe
-- Reverses: Creation of legal_generation_jobs table
--
-- WARNING: This will drop the legal_generation_jobs table and all its data.
-- Any legal page generation history will be lost.

-- Drop indexes first
DROP INDEX IF EXISTS "legal_generation_jobs_status_idx";
DROP INDEX IF EXISTS "legal_generation_jobs_user_id_idx";
DROP INDEX IF EXISTS "legal_generation_jobs_site_id_idx";

-- Drop the table (cascades foreign key constraints)
DROP TABLE IF EXISTS "legal_generation_jobs";
