-- Down Migration: 0017_tranquil_makkari
-- Rollback custom domain support schema changes
--
-- WARNING: This will drop the domain_verification_jobs table and remove domain columns from sites.
-- Any domain verification data will be lost.

-- Drop indexes first
DROP INDEX IF EXISTS "domain_verification_jobs_status_idx";
DROP INDEX IF EXISTS "domain_verification_jobs_user_id_idx";
DROP INDEX IF EXISTS "domain_verification_jobs_site_id_idx";

-- Drop foreign key constraints
ALTER TABLE IF EXISTS "domain_verification_jobs" DROP CONSTRAINT IF EXISTS "domain_verification_jobs_user_id_users_id_fk";
ALTER TABLE IF EXISTS "domain_verification_jobs" DROP CONSTRAINT IF EXISTS "domain_verification_jobs_site_id_sites_id_fk";

-- Drop columns from sites table
ALTER TABLE IF EXISTS "sites" DROP COLUMN IF EXISTS "domain_error_message";
ALTER TABLE IF EXISTS "sites" DROP COLUMN IF EXISTS "domain_ssl_status";
ALTER TABLE IF EXISTS "sites" DROP COLUMN IF EXISTS "domain_verified_at";
ALTER TABLE IF EXISTS "sites" DROP COLUMN IF EXISTS "domain_verification_challenges";
ALTER TABLE IF EXISTS "sites" DROP COLUMN IF EXISTS "domain_verification_status";

-- Drop domain_verification_jobs table
DROP TABLE IF EXISTS "domain_verification_jobs";
