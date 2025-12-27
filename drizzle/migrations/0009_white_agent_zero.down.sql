-- Rollback: Remove color_mode column from sites table
ALTER TABLE "sites" DROP COLUMN "color_mode";
