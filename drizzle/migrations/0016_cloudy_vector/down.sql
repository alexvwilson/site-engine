-- Down Migration: 0016_cloudy_vector
-- Rollback: Contact Submissions table and notification email column
-- WARNING: This will delete all contact submission data!

-- Drop indexes first
DROP INDEX IF EXISTS "contact_submissions_email_idx";
DROP INDEX IF EXISTS "contact_submissions_site_id_idx";

-- Drop foreign key constraint
ALTER TABLE "contact_submissions" DROP CONSTRAINT IF EXISTS "contact_submissions_site_id_sites_id_fk";

-- Drop the contact_submissions table
DROP TABLE IF EXISTS "contact_submissions";

-- Remove the notification email column from sites
ALTER TABLE "sites" DROP COLUMN IF EXISTS "contact_notification_email";
