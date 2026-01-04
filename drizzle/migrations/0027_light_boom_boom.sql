ALTER TABLE "sites" ADD COLUMN "social_links" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "sites" ADD COLUMN "social_icon_style" text DEFAULT 'brand';