-- Phase 1 Schema

CREATE TABLE visitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id TEXT UNIQUE NOT NULL,
  first_seen_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  first_page TEXT,
  device TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  platform TEXT NOT NULL,
  budget NUMERIC,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_name TEXT,
  full_name TEXT,
  phone TEXT,
  email TEXT,
  city TEXT,
  fleet_size TEXT,
  current_booking_method TEXT,
  main_problem TEXT,
  buying_timeline TEXT,
  qualification_score INTEGER DEFAULT 0,
  status TEXT DEFAULT 'NEW',
  campaign_id UUID REFERENCES campaigns(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE form_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL,
  visitor_id TEXT REFERENCES visitors(visitor_id),
  lead_id UUID REFERENCES leads(id),
  current_step INTEGER DEFAULT 0,
  status TEXT DEFAULT 'STARTED',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  abandoned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT,
  visitor_id TEXT REFERENCES visitors(visitor_id),
  lead_id UUID REFERENCES leads(id),
  event_name TEXT NOT NULL,
  page TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE attribution (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT,
  visitor_id TEXT REFERENCES visitors(visitor_id),
  lead_id UUID REFERENCES leads(id),
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  fbclid TEXT,
  referrer TEXT,
  landing_page TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id),
  scheduled_at TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'SCHEDULED',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id),
  campaign_id UUID REFERENCES campaigns(id),
  value NUMERIC,
  currency TEXT DEFAULT 'USD',
  converted_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS setup
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE attribution ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversions ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts and updates
CREATE POLICY "Allow anon insert to visitors" ON visitors FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update to visitors" ON visitors FOR UPDATE TO anon USING (true);
CREATE POLICY "Allow anon insert to events" ON events FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon insert to attribution" ON attribution FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon insert to form_sessions" ON form_sessions FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update to form_sessions" ON form_sessions FOR UPDATE TO anon USING (true);
CREATE POLICY "Allow anon insert to leads" ON leads FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update to leads" ON leads FOR UPDATE TO anon USING (true);

-- Admins (authenticated users) get full access
CREATE POLICY "Allow authenticated full access to visitors" ON visitors FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated full access to campaigns" ON campaigns FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated full access to leads" ON leads FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated full access to form_sessions" ON form_sessions FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated full access to events" ON events FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated full access to attribution" ON attribution FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated full access to appointments" ON appointments FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated full access to conversions" ON conversions FOR ALL TO authenticated USING (true);
