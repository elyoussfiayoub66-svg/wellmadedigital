-- Run this in Supabase SQL Editor if you already created the dm_automations table before the update
ALTER TABLE public.dm_automations 
  DROP COLUMN IF EXISTS delay_between_dms,
  DROP COLUMN IF EXISTS delay_after_batch;

ALTER TABLE public.dm_automations
  ADD COLUMN IF NOT EXISTS delay_between_dms_min INTEGER DEFAULT 5,
  ADD COLUMN IF NOT EXISTS delay_between_dms_max INTEGER DEFAULT 10,
  ADD COLUMN IF NOT EXISTS delay_after_batch_min INTEGER DEFAULT 30,
  ADD COLUMN IF NOT EXISTS delay_after_batch_max INTEGER DEFAULT 60;
