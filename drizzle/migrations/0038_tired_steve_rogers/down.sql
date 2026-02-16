-- Down migration for 0038_tired_steve_rogers
-- Removes alt_text columns from images and blog_posts tables
-- WARNING: Any stored alt text data will be lost

ALTER TABLE "blog_posts" DROP COLUMN IF EXISTS "featured_image_alt";
ALTER TABLE "images" DROP COLUMN IF EXISTS "alt_text";
