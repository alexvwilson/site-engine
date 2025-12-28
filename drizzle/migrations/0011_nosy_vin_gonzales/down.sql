-- Down migration for 0011_nosy_vin_gonzales
-- Removes under construction mode fields from sites table

ALTER TABLE "sites" DROP COLUMN IF EXISTS "construction_description";
ALTER TABLE "sites" DROP COLUMN IF EXISTS "construction_title";
ALTER TABLE "sites" DROP COLUMN IF EXISTS "under_construction";
