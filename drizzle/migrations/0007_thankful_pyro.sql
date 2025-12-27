CREATE TYPE "public"."layout_job_status" AS ENUM('pending', 'processing', 'completed', 'failed');--> statement-breakpoint
CREATE TABLE "layout_suggestion_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"page_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"status" "layout_job_status" DEFAULT 'pending' NOT NULL,
	"progress_percentage" integer DEFAULT 0 NOT NULL,
	"error_message" text,
	"trigger_run_id" text,
	"description" text NOT NULL,
	"suggestions" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "layout_suggestion_jobs" ADD CONSTRAINT "layout_suggestion_jobs_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "layout_suggestion_jobs" ADD CONSTRAINT "layout_suggestion_jobs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_layout_jobs_page_id" ON "layout_suggestion_jobs" USING btree ("page_id");--> statement-breakpoint
CREATE INDEX "idx_layout_jobs_user_id" ON "layout_suggestion_jobs" USING btree ("user_id");