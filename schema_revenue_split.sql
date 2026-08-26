-- Add split_percentage to project_members

ALTER TABLE project_members ADD COLUMN IF NOT EXISTS split_percentage NUMERIC DEFAULT 100;

-- Ensure cache reload
NOTIFY pgrst, 'reload schema';
