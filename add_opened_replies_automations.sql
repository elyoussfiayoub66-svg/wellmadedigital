-- Run this in your Supabase SQL Editor to add the required tracking columns to dm_automations

ALTER TABLE public.dm_automations 
ADD COLUMN IF NOT EXISTS opened INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS replies INTEGER DEFAULT 0;

-- Optional: If you want to reset any old tracked stats you can run:
-- UPDATE public.dm_automations SET opened = 0, replies = 0;
