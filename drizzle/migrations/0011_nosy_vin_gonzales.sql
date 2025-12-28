ALTER TABLE "sites" ADD COLUMN "under_construction" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "sites" ADD COLUMN "construction_title" text;--> statement-breakpoint
ALTER TABLE "sites" ADD COLUMN "construction_description" text;