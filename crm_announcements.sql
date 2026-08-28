-- Run this in your Supabase SQL Editor
-- Creates the table for Global CRM Announcements

CREATE TABLE IF NOT EXISTS crm_announcements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    author_id UUID,
    author_name TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure everyone can read/insert
ALTER TABLE crm_announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_read" ON crm_announcements FOR SELECT USING (true);
CREATE POLICY "allow_insert" ON crm_announcements FOR INSERT WITH CHECK (true);
