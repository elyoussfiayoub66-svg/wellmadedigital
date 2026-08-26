-- Run this in your Supabase SQL Editor to add the missing fields from the booking form to the leads table

ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS business_type TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS desired_outcome TEXT;
