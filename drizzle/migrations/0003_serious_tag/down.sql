-- Down migration for 0003_serious_tag.sql
-- WARNING: This migration drops the sites table and all its data
-- WARNING: The original transcription tables are NOT recreated (dev mode - data loss acceptable)

-- Drop indexes first
DROP INDEX IF EXISTS "sites_updated_at_idx";
DROP INDEX IF EXISTS "sites_status_idx";
DROP INDEX IF EXISTS "sites_slug_idx";
DROP INDEX IF EXISTS "sites_user_id_idx";

-- Drop foreign key constraint (handled by CASCADE on table drop)

-- Drop the sites table
DROP TABLE IF EXISTS "sites" CASCADE;

-- NOTE: The following tables were dropped in the up migration and are NOT recreated:
-- - ai_summaries
-- - transcription_jobs
-- - transcripts
-- - transcript_conversations
-- - transcript_messages
--
-- The following enum types were dropped and are NOT recreated:
-- - summary_type
-- - file_type
-- - job_status
-- - timestamp_granularity
-- - transcript_message_sender
-- - transcript_message_status
--
-- This is intentional for development mode. If you need to restore the transcription
-- functionality, you will need to restore from a database backup or recreate from
-- the original schema files (which have been deleted from the codebase).
