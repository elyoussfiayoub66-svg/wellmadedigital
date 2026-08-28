-- Run this in your Supabase SQL Editor to create the missing 'media' storage bucket and grant upload access.

-- 1. Create the public bucket named 'media'
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Allow public access to view images
CREATE POLICY "Allow public read access on media bucket"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'media');

-- 3. Allow authenticated users to upload new images
CREATE POLICY "Allow authenticated users to insert files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'media' AND auth.role() = 'authenticated');

-- 4. Allow authenticated users to update their files
CREATE POLICY "Allow authenticated users to update files"
  ON storage.objects FOR UPDATE
  WITH CHECK (bucket_id = 'media' AND auth.role() = 'authenticated');

-- 5. Allow authenticated users to delete files (optional but good practice)
CREATE POLICY "Allow authenticated users to delete files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'media' AND auth.role() = 'authenticated');
