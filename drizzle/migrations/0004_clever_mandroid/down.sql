-- Down Migration for 0004_clever_mandroid.sql
-- Drops the pages table and all related objects
-- WARNING: This will permanently delete all page data

-- Drop indexes first
DROP INDEX IF EXISTS "pages_status_idx";
DROP INDEX IF EXISTS "pages_user_id_idx";
DROP INDEX IF EXISTS "pages_site_id_idx";

-- Drop foreign key constraints (handled by DROP TABLE CASCADE, but explicit for clarity)
ALTER TABLE IF EXISTS "pages" DROP CONSTRAINT IF EXISTS "pages_user_id_users_id_fk";
ALTER TABLE IF EXISTS "pages" DROP CONSTRAINT IF EXISTS "pages_site_id_sites_id_fk";

-- Drop the unique constraint (handled by DROP TABLE, but explicit for clarity)
ALTER TABLE IF EXISTS "pages" DROP CONSTRAINT IF EXISTS "pages_site_slug_unique";

-- Drop the table
DROP TABLE IF EXISTS "pages";
