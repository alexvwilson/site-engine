CREATE TABLE "domain_verification_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"site_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"domain" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"verification_attempts" integer DEFAULT 0 NOT NULL,
	"max_attempts" integer DEFAULT 20 NOT NULL,
	"last_check_at" timestamp with time zone,
	"error_message" text,
	"trigger_run_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sites" ADD COLUMN "domain_verification_status" text;--> statement-breakpoint
ALTER TABLE "sites" ADD COLUMN "domain_verification_challenges" jsonb;--> statement-breakpoint
ALTER TABLE "sites" ADD COLUMN "domain_verified_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "sites" ADD COLUMN "domain_ssl_status" text;--> statement-breakpoint
ALTER TABLE "sites" ADD COLUMN "domain_error_message" text;--> statement-breakpoint
ALTER TABLE "domain_verification_jobs" ADD CONSTRAINT "domain_verification_jobs_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "domain_verification_jobs" ADD CONSTRAINT "domain_verification_jobs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "domain_verification_jobs_site_id_idx" ON "domain_verification_jobs" USING btree ("site_id");--> statement-breakpoint
CREATE INDEX "domain_verification_jobs_user_id_idx" ON "domain_verification_jobs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "domain_verification_jobs_status_idx" ON "domain_verification_jobs" USING btree ("status");