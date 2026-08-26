-- Chat Messages Schema
CREATE TABLE IF NOT EXISTS project_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE project_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only select messages if they are a member of the project
CREATE POLICY "Users can read project messages" ON project_messages
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM project_members 
      WHERE project_members.project_id = project_messages.project_id 
      AND project_members.user_id = auth.uid()
    )
  );

-- Policy: Users can only insert messages if they are a member of the project
CREATE POLICY "Users can insert project messages" ON project_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM project_members 
      WHERE project_members.project_id = project_messages.project_id 
      AND project_members.user_id = auth.uid()
    )
    AND sender_id = auth.uid() -- Can only send as themselves
  );

-- Enable Realtime for this table
-- Note: 'supabase_realtime' publication usually exists in Supabase.
-- If it doesn't, this will create it, but in Supabase it's there by default.
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime CASCADE;
  CREATE PUBLICATION supabase_realtime;
COMMIT;
ALTER PUBLICATION supabase_realtime ADD TABLE project_messages;
