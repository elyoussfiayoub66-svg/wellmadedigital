 -- Add availability to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS availability JSONB DEFAULT '{"monday": {"active": true, "start": "09:00", "end": "17:00"}, "tuesday": {"active": true, "start": "09:00", "end": "17:00"}, "wednesday": {"active": true, "start": "09:00", "end": "17:00"}, "thursday": {"active": true, "start": "09:00", "end": "17:00"}, "friday": {"active": true, "start": "09:00", "end": "17:00"}, "saturday": {"active": false, "start": "09:00", "end": "17:00"}, "sunday": {"active": false, "start": "09:00", "end": "17:00"}}'::jsonb;

-- Create landing_pages table
CREATE TABLE IF NOT EXISTS landing_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  html_content TEXT,
  css_content TEXT,
  grapesjs_data JSONB, -- The raw editor state
  assigned_user_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for landing_pages
ALTER TABLE landing_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated to view all landing_pages" 
ON landing_pages FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated to insert landing_pages" 
ON landing_pages FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated to update landing_pages" 
ON landing_pages FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated to delete landing_pages" 
ON landing_pages FOR DELETE TO authenticated USING (true);

-- Allow anonymous users to view landing_pages by slug (for the public LP view)
CREATE POLICY "Allow anonymous to view landing_pages" 
ON landing_pages FOR SELECT TO anon USING (true);
