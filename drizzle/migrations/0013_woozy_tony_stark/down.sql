-- Down Migration: 0013_woozy_tony_stark
-- Reverts: Blog categories table, category_id on blog_posts, default_blog_category_id on sites
-- WARNING: This will drop all blog category data!

-- Step 1: Drop index on blog_posts.category_id
DROP INDEX IF EXISTS "blog_posts_category_id_idx";

-- Step 2: Drop foreign key from blog_posts.category_id to blog_categories
ALTER TABLE "blog_posts" DROP CONSTRAINT IF EXISTS "blog_posts_category_id_blog_categories_id_fk";

-- Step 3: Drop index on blog_categories.site_id
DROP INDEX IF EXISTS "blog_categories_site_id_idx";

-- Step 4: Drop foreign key from blog_categories.site_id to sites
ALTER TABLE "blog_categories" DROP CONSTRAINT IF EXISTS "blog_categories_site_id_sites_id_fk";

-- Step 5: Drop the default_blog_category_id column from sites
ALTER TABLE "sites" DROP COLUMN IF EXISTS "default_blog_category_id";

-- Step 6: Drop the category_id column from blog_posts
ALTER TABLE "blog_posts" DROP COLUMN IF EXISTS "category_id";

-- Step 7: Drop the blog_categories table
DROP TABLE IF EXISTS "blog_categories";
