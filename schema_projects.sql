-- Projects Schema

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  lead_id UUID REFERENCES leads(id),
  start_date DATE,
  delivery_date DATE,
  status TEXT DEFAULT 'Planning',
  value NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Many-to-many relationship for assigning users to projects
CREATE TABLE IF NOT EXISTS project_members (
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, user_id)
);

-- RLS setup
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users full access to projects (for simplicity in the dashboard)
DROP POLICY IF EXISTS "Allow authenticated full access to projects" ON projects;
CREATE POLICY "Allow authenticated full access to projects" ON projects 
  FOR ALL TO authenticated 
  USING (true);

DROP POLICY IF EXISTS "Allow authenticated full access to project_members" ON project_members;
CREATE POLICY "Allow authenticated full access to project_members" ON project_members 
  FOR ALL TO authenticated 
  USING (true);
