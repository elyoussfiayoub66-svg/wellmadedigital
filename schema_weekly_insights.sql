-- Create the weekly_insights table to store weekly metrics
CREATE TABLE IF NOT EXISTS public.weekly_insights (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  week_start_date date NOT NULL UNIQUE,
  dms_made integer DEFAULT 0,
  dm_reply_rate numeric DEFAULT 0,
  positive_replies integer DEFAULT 0,
  meetings integer DEFAULT 0,
  proposals integer DEFAULT 0,
  deals integer DEFAULT 0,
  revenue numeric DEFAULT 0,
  delivery_time_days numeric DEFAULT 0,
  profit_per_project numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Add Row Level Security policies
ALTER TABLE public.weekly_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON public.weekly_insights
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON public.weekly_insights
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update access for authenticated users" ON public.weekly_insights
  FOR UPDATE USING (auth.role() = 'authenticated');
