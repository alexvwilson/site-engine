ALTER TABLE "sites" ADD COLUMN "custom_domain" text;--> statement-breakpoint
ALTER TABLE "sites" ADD COLUMN "meta_title" text;--> statement-breakpoint
ALTER TABLE "sites" ADD COLUMN "meta_description" text;--> statement-breakpoint
ALTER TABLE "sections" ADD COLUMN "status" text DEFAULT 'published' NOT NULL;--> statement-breakpoint
CREATE INDEX "sites_custom_domain_idx" ON "sites" USING btree ("custom_domain");--> statement-breakpoint
CREATE INDEX "sections_status_idx" ON "sections" USING btree ("status");--> statement-breakpoint
ALTER TABLE "sites" ADD CONSTRAINT "sites_custom_domain_unique" UNIQUE("custom_domain");