-- Down migration for 0025_handy_shen.sql
-- Removes page_id column from blog_posts table
-- WARNING: This will remove all page assignments from blog posts

-- Drop the index first
DROP INDEX IF EXISTS "blog_posts_page_id_idx";

-- Drop the foreign key constraint
ALTER TABLE "blog_posts" DROP CONSTRAINT IF EXISTS "blog_posts_page_id_pages_id_fk";

-- Drop the column
ALTER TABLE "blog_posts" DROP COLUMN IF EXISTS "page_id";
