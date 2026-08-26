-- Add meeting_result to appointments for the Clients CRM page

ALTER TABLE appointments ADD COLUMN IF NOT EXISTS meeting_result TEXT DEFAULT 'Pending';

-- Ensure authenticated users have full access to leads and appointments
DROP POLICY IF EXISTS "Allow authenticated full access to leads" ON leads;
CREATE POLICY "Allow authenticated full access to leads" ON leads 
  FOR ALL TO authenticated 
  USING (true);

DROP POLICY IF EXISTS "Allow authenticated full access to appointments" ON appointments;
CREATE POLICY "Allow authenticated full access to appointments" ON appointments 
  FOR ALL TO authenticated 
  USING (true);
