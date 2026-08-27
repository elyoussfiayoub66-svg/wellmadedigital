-- Fix for Calendar Availability
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS assignee_id UUID REFERENCES auth.users(id);

-- Also allow the API to read it if using anon key by fallback
DROP POLICY IF EXISTS "Allow public to view appointments availability" ON public.appointments;
CREATE POLICY "Allow public to view appointments availability" ON public.appointments FOR SELECT TO anon USING (true);
