-- Run this in your Supabase SQL Editor if you have RLS (Row Level Security) enabled.
-- This allows users to delete announcements they authored.

CREATE POLICY "allow_delete" ON crm_announcements 
FOR DELETE 
USING (auth.uid() = author_id);
