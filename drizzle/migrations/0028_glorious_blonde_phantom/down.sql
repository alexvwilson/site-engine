-- Down migration for 0028_glorious_blonde_phantom
-- Drops the landing_contacts table

DROP INDEX IF EXISTS "idx_landing_contacts_email";
--> statement-breakpoint
DROP TABLE IF EXISTS "landing_contacts";
