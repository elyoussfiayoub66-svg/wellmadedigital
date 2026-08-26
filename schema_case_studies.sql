-- Case Studies Table

CREATE TABLE case_studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  client_name TEXT NOT NULL,
  industry TEXT,
  short_description TEXT,
  problem TEXT,
  solution TEXT,
  results JSONB DEFAULT '[]'::jsonb, -- Array of objects: [{"metric": "+45%", "description": "conversion rate"}]
  status TEXT DEFAULT 'DRAFT', -- 'DRAFT' or 'PUBLISHED'
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE case_studies ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to SELECT published case studies
CREATE POLICY "Allow anon select published case studies" ON case_studies 
FOR SELECT TO anon USING (status = 'PUBLISHED');

-- Allow authenticated admins full access to case studies
CREATE POLICY "Allow authenticated full access to case studies" ON case_studies 
FOR ALL TO authenticated USING (true);
