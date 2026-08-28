-- Prospects Schema

CREATE TABLE IF NOT EXISTS prospects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name TEXT NOT NULL,
  owner_name TEXT,
  niche TEXT,
  ig_handle TEXT,
  phone TEXT,
  email TEXT,
  pipeline_status TEXT,
  outreach_status TEXT,
  followup_status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS setup
ALTER TABLE prospects ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users full access to prospects
DROP POLICY IF EXISTS "Allow authenticated full access to prospects" ON prospects;
CREATE POLICY "Allow authenticated full access to prospects" ON prospects 
  FOR ALL TO authenticated 
  USING (true);
