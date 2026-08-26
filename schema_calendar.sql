-- Calendar and Appointments Schema Update

-- 1. Add assignee_id to appointments
ALTER TABLE appointments 
ADD COLUMN assignee_id UUID REFERENCES profiles(id),
ADD COLUMN end_time TIMESTAMPTZ,
ADD COLUMN title TEXT;

-- 2. Create function to automatically set end_time to 30 mins after scheduled_at
CREATE OR REPLACE FUNCTION set_appointment_end_time()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.end_time IS NULL THEN
    NEW.end_time := NEW.scheduled_at + interval '30 minutes';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_appointment_end_time
BEFORE INSERT OR UPDATE ON appointments
FOR EACH ROW
EXECUTE FUNCTION set_appointment_end_time();

-- 3. Ensure profiles are publicly readable so customers and team members can see the list
-- (Assuming profiles table already exists from previous setup)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone." ON profiles;
CREATE POLICY "Profiles are viewable by everyone." ON profiles
  FOR SELECT USING (true);

-- 4. Allow anon to insert leads and appointments (for the booking page)
DROP POLICY IF EXISTS "Allow anon insert to leads" ON leads;
CREATE POLICY "Allow anon insert to leads" ON leads FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon insert to appointments" ON appointments;
CREATE POLICY "Allow anon insert to appointments" ON appointments FOR INSERT TO anon WITH CHECK (true);

-- 5. Allow authenticated users to view all appointments (or just their own)
DROP POLICY IF EXISTS "Allow authenticated full access to appointments" ON appointments;
CREATE POLICY "Allow authenticated full access to appointments" ON appointments 
  FOR ALL TO authenticated 
  USING (true);
