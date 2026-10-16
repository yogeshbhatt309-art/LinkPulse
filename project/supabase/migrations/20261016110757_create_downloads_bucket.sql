/*
# Create public storage bucket for project downloads

1. Storage
- Create a public bucket named "downloads" for serving the project ZIP file.
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('downloads', 'downloads', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to the downloads bucket
DROP POLICY IF EXISTS "public_read_downloads" ON storage.objects;
CREATE POLICY "public_read_downloads" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'downloads');

-- Allow authenticated uploads (edge function uses service role, bypasses RLS)
DROP POLICY IF EXISTS "auth_write_downloads" ON storage.objects;
CREATE POLICY "auth_write_downloads" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'downloads');

DROP POLICY IF EXISTS "auth_update_downloads" ON storage.objects;
CREATE POLICY "auth_update_downloads" ON storage.objects
  FOR UPDATE TO anon, authenticated
  USING (bucket_id = 'downloads') WITH CHECK (bucket_id = 'downloads');

DROP POLICY IF EXISTS "auth_delete_downloads" ON storage.objects;
CREATE POLICY "auth_delete_downloads" ON storage.objects
  FOR DELETE TO anon, authenticated
  USING (bucket_id = 'downloads');
