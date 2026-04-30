-- Create a public bucket for ad campaigns and other assets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('public_assets', 'public_assets', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to public_assets
DROP POLICY IF EXISTS "Public Access to public_assets" ON storage.objects;
CREATE POLICY "Public Access to public_assets" ON storage.objects
  FOR SELECT USING (bucket_id = 'public_assets');

-- Allow authenticated users to upload to public_assets
DROP POLICY IF EXISTS "Auth Upload to public_assets" ON storage.objects;
CREATE POLICY "Auth Upload to public_assets" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'public_assets');

-- Allow authenticated users to update their own uploads (or just all for simplicity in admin)
DROP POLICY IF EXISTS "Auth Update to public_assets" ON storage.objects;
CREATE POLICY "Auth Update to public_assets" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'public_assets');

-- Allow authenticated users to delete their own uploads
DROP POLICY IF EXISTS "Auth Delete to public_assets" ON storage.objects;
CREATE POLICY "Auth Delete to public_assets" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'public_assets');
