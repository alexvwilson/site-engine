-- Down Migration: 0008_public_chamber
-- Rollback: Remove custom_domain, meta_title, meta_description from sites; remove status from sections
-- WARNING: This will permanently delete data in these columns!

-- Drop the unique constraint on custom_domain
ALTER TABLE "sites" DROP CONSTRAINT IF EXISTS "sites_custom_domain_unique";

-- Drop the indexes
DROP INDEX IF EXISTS "sites_custom_domain_idx";
DROP INDEX IF EXISTS "sections_status_idx";

-- Remove columns from sections table
ALTER TABLE "sections" DROP COLUMN IF EXISTS "status";

-- Remove columns from sites table
ALTER TABLE "sites" DROP COLUMN IF EXISTS "meta_description";
ALTER TABLE "sites" DROP COLUMN IF EXISTS "meta_title";
ALTER TABLE "sites" DROP COLUMN IF EXISTS "custom_domain";
