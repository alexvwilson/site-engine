-- Down migration for: 0000_curvy_skaar
-- Generated: Initial schema rollback
--
-- This file reverses the changes made in 0000_curvy_skaar.sql
-- Review carefully before executing in production
--
-- WARNINGS:
-- - Dropping tables will permanently delete all data
-- - This is the initial schema - rolling back removes the entire database structure

-- ==========================================
-- REVERSE INDEX OPERATIONS
-- ==========================================

DROP INDEX IF EXISTS "transcript_messages_status_idx";
DROP INDEX IF EXISTS "transcript_messages_conversation_id_idx";
DROP INDEX IF EXISTS "transcript_conversations_user_id_idx";
DROP INDEX IF EXISTS "transcript_conversations_transcript_id_idx";
DROP INDEX IF EXISTS "transcripts_created_at_idx";
DROP INDEX IF EXISTS "transcripts_user_id_idx";
DROP INDEX IF EXISTS "transcription_jobs_created_at_idx";
DROP INDEX IF EXISTS "transcription_jobs_status_idx";
DROP INDEX IF EXISTS "transcription_jobs_user_id_idx";
DROP INDEX IF EXISTS "created_at_idx";
DROP INDEX IF EXISTS "role_idx";
DROP INDEX IF EXISTS "ai_summaries_type_idx";
DROP INDEX IF EXISTS "ai_summaries_user_id_idx";

-- ==========================================
-- REVERSE FOREIGN KEY CONSTRAINTS
-- ==========================================

ALTER TABLE "transcript_messages" DROP CONSTRAINT IF EXISTS "transcript_messages_transcript_conversation_id_transcript_conversations_id_fk";
ALTER TABLE "transcript_conversations" DROP CONSTRAINT IF EXISTS "transcript_conversations_user_id_users_id_fk";
ALTER TABLE "transcript_conversations" DROP CONSTRAINT IF EXISTS "transcript_conversations_transcript_id_transcripts_id_fk";
ALTER TABLE "transcripts" DROP CONSTRAINT IF EXISTS "transcripts_user_id_users_id_fk";
ALTER TABLE "transcripts" DROP CONSTRAINT IF EXISTS "transcripts_job_id_transcription_jobs_id_fk";
ALTER TABLE "transcription_jobs" DROP CONSTRAINT IF EXISTS "transcription_jobs_user_id_users_id_fk";
ALTER TABLE "ai_summaries" DROP CONSTRAINT IF EXISTS "ai_summaries_user_id_users_id_fk";
ALTER TABLE "ai_summaries" DROP CONSTRAINT IF EXISTS "ai_summaries_transcript_id_transcripts_id_fk";

-- ==========================================
-- REVERSE TABLE OPERATIONS
-- ==========================================

-- WARNING: Dropping tables will permanently delete all data
DROP TABLE IF EXISTS "transcript_messages";
DROP TABLE IF EXISTS "transcript_conversations";
DROP TABLE IF EXISTS "transcripts";
DROP TABLE IF EXISTS "transcription_jobs";
DROP TABLE IF EXISTS "users";
DROP TABLE IF EXISTS "ai_summaries";

-- ==========================================
-- REVERSE ENUM TYPE OPERATIONS
-- ==========================================

DROP TYPE IF EXISTS "public"."transcript_message_status";
DROP TYPE IF EXISTS "public"."transcript_message_sender";
DROP TYPE IF EXISTS "public"."timestamp_granularity";
DROP TYPE IF EXISTS "public"."job_status";
DROP TYPE IF EXISTS "public"."file_type";
DROP TYPE IF EXISTS "public"."summary_type";
