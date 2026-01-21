-- Down migration for 0035_ordinary_loners.sql
-- Removes primitive and preset columns from sections table
-- WARNING: This will remove all primitive/preset data

-- Drop indexes first
DROP INDEX IF EXISTS "sections_primitive_preset_idx";
DROP INDEX IF EXISTS "sections_primitive_idx";

-- Drop columns
ALTER TABLE "sections" DROP COLUMN IF EXISTS "preset";
ALTER TABLE "sections" DROP COLUMN IF EXISTS "primitive";
