-- Down migration for 0020_plain_white_queen
-- Removes anchor_id column from sections table

-- Drop the index first
DROP INDEX IF EXISTS "sections_page_anchor_idx";

-- Drop the column
ALTER TABLE "sections" DROP COLUMN IF EXISTS "anchor_id";
