CREATE TABLE IF NOT EXISTS website_content (
  id TEXT PRIMARY KEY DEFAULT 'default',
  content JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE website_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON website_content
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated write" ON website_content
  FOR ALL USING (auth.role() = 'authenticated');

INSERT INTO storage.buckets (id, name, public) VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Read Uploads" ON storage.objects
  FOR SELECT USING (bucket_id = 'uploads');

CREATE POLICY "Authenticated Upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'uploads' AND auth.role() = 'authenticated');
