CREATE TABLE "sites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"slug" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"published_at" timestamp with time zone,
	CONSTRAINT "sites_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
DROP TABLE "ai_summaries" CASCADE;--> statement-breakpoint
DROP TABLE "transcription_jobs" CASCADE;--> statement-breakpoint
DROP TABLE "transcripts" CASCADE;--> statement-breakpoint
DROP TABLE "transcript_conversations" CASCADE;--> statement-breakpoint
DROP TABLE "transcript_messages" CASCADE;--> statement-breakpoint
ALTER TABLE "sites" ADD CONSTRAINT "sites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "sites_user_id_idx" ON "sites" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sites_slug_idx" ON "sites" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "sites_status_idx" ON "sites" USING btree ("status");--> statement-breakpoint
CREATE INDEX "sites_updated_at_idx" ON "sites" USING btree ("updated_at");--> statement-breakpoint
DROP TYPE "public"."summary_type";--> statement-breakpoint
DROP TYPE "public"."file_type";--> statement-breakpoint
DROP TYPE "public"."job_status";--> statement-breakpoint
DROP TYPE "public"."timestamp_granularity";--> statement-breakpoint
DROP TYPE "public"."transcript_message_sender";--> statement-breakpoint
DROP TYPE "public"."transcript_message_status";