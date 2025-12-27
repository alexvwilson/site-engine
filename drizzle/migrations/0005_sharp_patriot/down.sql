-- Down Migration: 0005_sharp_patriot
-- Rollback: Drop sections table
-- WARNING: This will delete ALL section data permanently

-- Drop indexes first
DROP INDEX IF EXISTS "sections_page_position_idx";
DROP INDEX IF EXISTS "sections_user_id_idx";
DROP INDEX IF EXISTS "sections_page_id_idx";

-- Drop the sections table (foreign key constraints will be removed automatically)
DROP TABLE IF EXISTS "sections";
