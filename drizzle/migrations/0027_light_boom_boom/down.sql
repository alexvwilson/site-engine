-- Down migration: Remove social links columns from sites table
ALTER TABLE "sites" DROP COLUMN IF EXISTS "social_icon_style";--> statement-breakpoint
ALTER TABLE "sites" DROP COLUMN IF EXISTS "social_links";
