CREATE TABLE workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  status TEXT DEFAULT 'paused' CHECK (status IN ('active', 'paused')),
  nodes JSONB DEFAULT '[]'::jsonb,
  edges JSONB DEFAULT '[]'::jsonb,
  last_run_at TIMESTAMP WITH TIME ZONE,
  total_executions INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE whatsapp_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone_number TEXT NOT NULL,
  worker_status TEXT DEFAULT 'disconnected' CHECK (worker_status IN ('connected', 'disconnected', 'pairing')),
  qr_code_url TEXT,
  session_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_accounts ENABLE ROW LEVEL SECURITY;

-- Simple policies for authenticated users
CREATE POLICY "Allow authenticated full access to workflows" ON workflows FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated full access to whatsapp_accounts" ON whatsapp_accounts FOR ALL TO authenticated USING (true);
ALTER TABLE workflows ADD COLUMN IF NOT EXISTS whatsapp_account_id UUID REFERENCES whatsapp_accounts(id);
