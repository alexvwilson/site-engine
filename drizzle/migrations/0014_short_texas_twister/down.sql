-- Down migration for 0014_short_texas_twister.sql
-- Removes SEO columns from blog_posts table
-- WARNING: This will permanently delete any meta_title and meta_description data

ALTER TABLE "blog_posts" DROP COLUMN IF EXISTS "meta_description";
ALTER TABLE "blog_posts" DROP COLUMN IF EXISTS "meta_title";
