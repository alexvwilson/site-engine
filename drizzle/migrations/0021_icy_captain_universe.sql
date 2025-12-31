CREATE TABLE "legal_generation_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"site_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"progress_percentage" integer DEFAULT 0 NOT NULL,
	"business_type" text NOT NULL,
	"data_collection" jsonb NOT NULL,
	"jurisdiction" text NOT NULL,
	"pages_to_generate" jsonb NOT NULL,
	"generated_content" jsonb,
	"created_page_ids" jsonb,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "legal_generation_jobs" ADD CONSTRAINT "legal_generation_jobs_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "legal_generation_jobs" ADD CONSTRAINT "legal_generation_jobs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "legal_generation_jobs_site_id_idx" ON "legal_generation_jobs" USING btree ("site_id");--> statement-breakpoint
CREATE INDEX "legal_generation_jobs_user_id_idx" ON "legal_generation_jobs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "legal_generation_jobs_status_idx" ON "legal_generation_jobs" USING btree ("status");