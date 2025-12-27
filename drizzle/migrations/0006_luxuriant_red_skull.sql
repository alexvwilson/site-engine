CREATE TABLE "theme_generation_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"site_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"mode" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"stage" text,
	"requirements" jsonb NOT NULL,
	"color_data" jsonb,
	"typography_data" jsonb,
	"component_data" jsonb,
	"final_theme_data" jsonb,
	"ai_provider" text NOT NULL,
	"ai_model" text NOT NULL,
	"progress_percentage" integer DEFAULT 0 NOT NULL,
	"error_message" text,
	"trigger_run_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "themes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"site_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"generation_job_id" uuid,
	"name" text NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"data" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "theme_generation_jobs" ADD CONSTRAINT "theme_generation_jobs_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "theme_generation_jobs" ADD CONSTRAINT "theme_generation_jobs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "themes" ADD CONSTRAINT "themes_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "themes" ADD CONSTRAINT "themes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "themes" ADD CONSTRAINT "themes_generation_job_id_theme_generation_jobs_id_fk" FOREIGN KEY ("generation_job_id") REFERENCES "public"."theme_generation_jobs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "theme_generation_jobs_site_id_idx" ON "theme_generation_jobs" USING btree ("site_id");--> statement-breakpoint
CREATE INDEX "theme_generation_jobs_user_id_idx" ON "theme_generation_jobs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "theme_generation_jobs_status_idx" ON "theme_generation_jobs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "theme_generation_jobs_created_at_idx" ON "theme_generation_jobs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "themes_site_id_idx" ON "themes" USING btree ("site_id");--> statement-breakpoint
CREATE INDEX "themes_user_id_idx" ON "themes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "themes_is_active_idx" ON "themes" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "themes_generation_job_id_idx" ON "themes" USING btree ("generation_job_id");