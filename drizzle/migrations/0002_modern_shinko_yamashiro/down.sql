-- Down migration for: 0002_modern_shinko_yamashiro
-- Generated: Storage RLS policies rollback
--
-- This file reverses the RLS policies for the media-uploads storage bucket
-- Review carefully before executing in production

-- Drop policies in reverse order
DROP POLICY IF EXISTS "Users can delete own media" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own media" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own media" ON storage.objects;
