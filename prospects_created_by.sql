-- Run this in your Supabase SQL Editor
-- This adds the created_by column so the Team Page can accurately count your listed prospects.

ALTER TABLE prospects ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- This line automatically assigns all your existing 21 prospects to you so they don't show up as 0.
UPDATE prospects 
SET created_by = (SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1) 
WHERE created_by IS NULL;
