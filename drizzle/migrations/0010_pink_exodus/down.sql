-- Down migration for 0010_pink_exodus
-- Removes site-level header and footer content columns
-- WARNING: This will delete all stored header/footer configurations

ALTER TABLE "sites" DROP COLUMN IF EXISTS "header_content";
ALTER TABLE "sites" DROP COLUMN IF EXISTS "footer_content";
