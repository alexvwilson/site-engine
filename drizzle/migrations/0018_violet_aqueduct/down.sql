-- Down migration for 0018_violet_aqueduct
-- Removes favicon_url column from sites table

-- WARNING: This will permanently delete all favicon URLs
ALTER TABLE "sites" DROP COLUMN IF EXISTS "favicon_url";
