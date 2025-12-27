-- Custom migration: Create RLS policies for media-uploads storage bucket
-- This migration sets up Row Level Security policies for the media-uploads bucket:
-- File path structure: media/{userId}/{jobId}/{filename}
-- So userId is at folder index [2]

-- Policy 1: Users can upload to their own folder
CREATE POLICY "Users can upload own media" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
   bucket_id = 'media-uploads' AND
   auth.uid()::text = (storage.foldername(name))[2]
);

-- Policy 2: Users can view their own media files
CREATE POLICY "Users can view own media" ON storage.objects
FOR SELECT TO authenticated
USING (
   bucket_id = 'media-uploads' AND
   auth.uid()::text = (storage.foldername(name))[2]
);

-- Policy 3: Users can delete their own media files
CREATE POLICY "Users can delete own media" ON storage.objects
FOR DELETE TO authenticated
USING (
   bucket_id = 'media-uploads' AND
   auth.uid()::text = (storage.foldername(name))[2]
);
