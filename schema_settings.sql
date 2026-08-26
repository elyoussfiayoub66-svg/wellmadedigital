-- Run this in your Supabase SQL Editor to create the CRM settings table

CREATE TABLE IF NOT EXISTS crm_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_name TEXT DEFAULT 'WellMade Digital',
  agency_email TEXT DEFAULT 'hello@wellmadedigital.com',
  agency_phone TEXT DEFAULT '+212 600 000 000',
  agency_address TEXT DEFAULT 'Casablanca, Morocco',
  default_commission_rate NUMERIC DEFAULT 13.0,
  lead_statuses JSONB DEFAULT '["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "WON", "LOST"]'::jsonb,
  alert_preferences JSONB DEFAULT '{"new_lead": true, "meeting_booked": true, "payment_received": true, "task_assigned": true}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert a default row if the table is empty
INSERT INTO crm_settings (agency_name)
SELECT 'WellMade Digital'
WHERE NOT EXISTS (SELECT 1 FROM crm_settings);

-- RLS
ALTER TABLE crm_settings ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view and update settings
CREATE POLICY "Allow authenticated to view settings" ON crm_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated to update settings" ON crm_settings FOR UPDATE TO authenticated USING (true);
