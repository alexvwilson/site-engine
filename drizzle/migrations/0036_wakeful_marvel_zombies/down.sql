-- Down Migration: 0036_wakeful_marvel_zombies
-- Removes landing_faqs and landing_features tables
-- WARNING: This will DELETE all admin-managed FAQ and feature content!

-- Drop indexes first
DROP INDEX IF EXISTS "idx_landing_features_active";
DROP INDEX IF EXISTS "idx_landing_features_order";
DROP INDEX IF EXISTS "idx_landing_faqs_active";
DROP INDEX IF EXISTS "idx_landing_faqs_order";

-- Drop tables (WARNING: data loss!)
DROP TABLE IF EXISTS "landing_features";
DROP TABLE IF EXISTS "landing_faqs";
