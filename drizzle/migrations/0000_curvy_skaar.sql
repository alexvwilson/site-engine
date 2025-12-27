CREATE TYPE "public"."summary_type" AS ENUM('meeting_notes', 'youtube_video', 'general');--> statement-breakpoint
CREATE TYPE "public"."file_type" AS ENUM('audio', 'video');--> statement-breakpoint
CREATE TYPE "public"."job_status" AS ENUM('pending', 'processing', 'completed', 'failed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."timestamp_granularity" AS ENUM('segment', 'word');--> statement-breakpoint
CREATE TYPE "public"."transcript_message_sender" AS ENUM('user', 'assistant');--> statement-breakpoint
CREATE TYPE "public"."transcript_message_status" AS ENUM('success', 'error');--> statement-breakpoint
CREATE TABLE "ai_summaries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"transcript_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"summary_type" "summary_type" NOT NULL,
	"summary_content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ai_summaries_transcript_id_unique" UNIQUE("transcript_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"full_name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "transcription_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"file_name" text NOT NULL,
	"original_file_url" text NOT NULL,
	"file_size_bytes" bigint NOT NULL,
	"file_type" "file_type" NOT NULL,
	"file_extension" text NOT NULL,
	"status" "job_status" DEFAULT 'pending' NOT NULL,
	"progress_percentage" integer DEFAULT 0 NOT NULL,
	"error_message" text,
	"duration_seconds" integer,
	"language" text,
	"detected_language" text,
	"timestamp_granularity" timestamp_granularity NOT NULL,
	"trigger_job_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "transcripts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"transcript_text_plain" text NOT NULL,
	"transcript_srt" text NOT NULL,
	"transcript_vtt" text NOT NULL,
	"transcript_json" jsonb NOT NULL,
	"transcript_verbose_json" jsonb,
	"word_timestamps" jsonb,
	"detected_language" text NOT NULL,
	"duration_seconds" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "transcripts_job_id_unique" UNIQUE("job_id")
);
--> statement-breakpoint
CREATE TABLE "transcript_conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"transcript_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transcript_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"transcript_conversation_id" uuid NOT NULL,
	"sender" "transcript_message_sender" NOT NULL,
	"content" text NOT NULL,
	"status" "transcript_message_status" DEFAULT 'success' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ai_summaries" ADD CONSTRAINT "ai_summaries_transcript_id_transcripts_id_fk" FOREIGN KEY ("transcript_id") REFERENCES "public"."transcripts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_summaries" ADD CONSTRAINT "ai_summaries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transcription_jobs" ADD CONSTRAINT "transcription_jobs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transcripts" ADD CONSTRAINT "transcripts_job_id_transcription_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."transcription_jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transcripts" ADD CONSTRAINT "transcripts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transcript_conversations" ADD CONSTRAINT "transcript_conversations_transcript_id_transcripts_id_fk" FOREIGN KEY ("transcript_id") REFERENCES "public"."transcripts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transcript_conversations" ADD CONSTRAINT "transcript_conversations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transcript_messages" ADD CONSTRAINT "transcript_messages_transcript_conversation_id_transcript_conversations_id_fk" FOREIGN KEY ("transcript_conversation_id") REFERENCES "public"."transcript_conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ai_summaries_user_id_idx" ON "ai_summaries" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "ai_summaries_type_idx" ON "ai_summaries" USING btree ("summary_type");--> statement-breakpoint
CREATE INDEX "role_idx" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "created_at_idx" ON "users" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "transcription_jobs_user_id_idx" ON "transcription_jobs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "transcription_jobs_status_idx" ON "transcription_jobs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "transcription_jobs_created_at_idx" ON "transcription_jobs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "transcripts_user_id_idx" ON "transcripts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "transcripts_created_at_idx" ON "transcripts" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "transcript_conversations_transcript_id_idx" ON "transcript_conversations" USING btree ("transcript_id");--> statement-breakpoint
CREATE INDEX "transcript_conversations_user_id_idx" ON "transcript_conversations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "transcript_messages_conversation_id_idx" ON "transcript_messages" USING btree ("transcript_conversation_id");--> statement-breakpoint
CREATE INDEX "transcript_messages_status_idx" ON "transcript_messages" USING btree ("status");