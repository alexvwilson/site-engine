-- Down Migration: 0012_complete_stick
-- Rollback blog_posts table and show_blog_author column
-- WARNING: This will delete all blog posts data!

-- Drop indexes first
DROP INDEX IF EXISTS "blog_posts_published_at_idx";
DROP INDEX IF EXISTS "blog_posts_status_idx";
DROP INDEX IF EXISTS "blog_posts_author_id_idx";
DROP INDEX IF EXISTS "blog_posts_site_id_idx";

-- Drop foreign key constraints
ALTER TABLE "blog_posts" DROP CONSTRAINT IF EXISTS "blog_posts_author_id_users_id_fk";
ALTER TABLE "blog_posts" DROP CONSTRAINT IF EXISTS "blog_posts_site_id_sites_id_fk";

-- Drop the blog_posts table
DROP TABLE IF EXISTS "blog_posts";

-- Remove show_blog_author column from sites
ALTER TABLE "sites" DROP COLUMN IF EXISTS "show_blog_author";
