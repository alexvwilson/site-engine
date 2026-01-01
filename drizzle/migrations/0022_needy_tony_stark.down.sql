-- Down migration for 0022_needy_tony_stark.sql
-- Drops the seo_analysis_jobs table and all its constraints/indexes

DROP INDEX IF EXISTS "seo_analysis_jobs_status_idx";
DROP INDEX IF EXISTS "seo_analysis_jobs_user_id_idx";
DROP INDEX IF EXISTS "seo_analysis_jobs_site_id_idx";
DROP TABLE IF EXISTS "seo_analysis_jobs";
