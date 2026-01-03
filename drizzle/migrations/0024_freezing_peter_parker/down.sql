-- Down migration for 0024_freezing_peter_parker.sql
-- Removes display_order column from pages table

-- WARNING: This will remove page ordering data. Pages will revert to default ordering.

ALTER TABLE "pages" DROP COLUMN IF EXISTS "display_order";
