-- Down migration for 0029_dazzling_grey_gargoyle
-- Rollback: Create documents table

-- Drop indexes first
DROP INDEX IF EXISTS "documents_created_at_idx";
DROP INDEX IF EXISTS "documents_site_id_idx";

-- Drop the documents table (cascade will remove foreign key constraint)
DROP TABLE IF EXISTS "documents" CASCADE;
