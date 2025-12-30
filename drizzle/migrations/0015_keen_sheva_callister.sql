CREATE TABLE "logo_generation_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"site_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"site_name" text NOT NULL,
	"site_description" text,
	"brand_personality" text,
	"primary_color" text,
	"generated_concepts" jsonb,
	"progress_percentage" integer DEFAULT 0 NOT NULL,
	"error_message" text,
	"trigger_run_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sites" ADD COLUMN "brand_personality" text;--> statement-breakpoint
ALTER TABLE "logo_generation_jobs" ADD CONSTRAINT "logo_generation_jobs_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "logo_generation_jobs" ADD CONSTRAINT "logo_generation_jobs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "logo_generation_jobs_site_id_idx" ON "logo_generation_jobs" USING btree ("site_id");--> statement-breakpoint
CREATE INDEX "logo_generation_jobs_user_id_idx" ON "logo_generation_jobs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "logo_generation_jobs_status_idx" ON "logo_generation_jobs" USING btree ("status");