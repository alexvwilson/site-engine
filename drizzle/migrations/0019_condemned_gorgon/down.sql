-- Down migration for 0019_condemned_gorgon.sql
-- Removes the use_separate_favicon column from sites table
-- Safe to run: No data loss (column stores boolean preference only)

ALTER TABLE "sites" DROP COLUMN IF EXISTS "use_separate_favicon";
