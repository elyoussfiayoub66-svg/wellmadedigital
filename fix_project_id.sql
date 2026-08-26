-- Self-healing script for project_id errors

-- 1. Safely drop and recreate the project_members table to ensure the columns are exactly correct
DROP TABLE IF EXISTS project_members CASCADE;

CREATE TABLE project_members (
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, user_id)
);

-- 2. Ensure invoices has the project_id column just in case the error is coming from the automation trigger
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE CASCADE;

-- 3. Ensure the project_members table has proper RLS so you can actually write to it
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated full access to project_members" ON project_members;
CREATE POLICY "Allow authenticated full access to project_members" ON project_members FOR ALL TO authenticated USING (true);

-- 4. Force Supabase API cache to reload
NOTIFY pgrst, 'reload schema';
