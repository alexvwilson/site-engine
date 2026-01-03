-- Down Migration: 0026_overjoyed_apocalypse
-- Reverts: Image Albums and Images tables for media organization
-- WARNING: This will DELETE all image album data and image tracking records!
-- Actual files in Supabase Storage will NOT be affected.

-- Drop indexes first (reverse order of creation)
DROP INDEX IF EXISTS "images_created_at_idx";
DROP INDEX IF EXISTS "images_album_id_idx";
DROP INDEX IF EXISTS "images_site_id_idx";
DROP INDEX IF EXISTS "image_albums_display_order_idx";
DROP INDEX IF EXISTS "image_albums_site_id_idx";

-- Drop foreign key constraints
ALTER TABLE "images" DROP CONSTRAINT IF EXISTS "images_album_id_image_albums_id_fk";
ALTER TABLE "images" DROP CONSTRAINT IF EXISTS "images_site_id_sites_id_fk";
ALTER TABLE "image_albums" DROP CONSTRAINT IF EXISTS "image_albums_site_id_sites_id_fk";

-- Drop tables (images first due to FK dependency on image_albums)
DROP TABLE IF EXISTS "images";
DROP TABLE IF EXISTS "image_albums";
