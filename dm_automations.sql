-- Create the IG Accounts table
CREATE TABLE IF NOT EXISTS public.ig_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    handle TEXT NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'error')),
    password_hash TEXT, -- Depending on how you store/manage credentials securely
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES auth.users(id)
);

-- Create the DM Automations table
CREATE TABLE IF NOT EXISTS public.dm_automations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'archived' CHECK (status IN ('active', 'paused', 'archived', 'error')),
    source TEXT DEFAULT 'Database',
    scheduled INTEGER DEFAULT 0,
    sent INTEGER DEFAULT 0,
    nextExecution TEXT DEFAULT 'Pending',
    delay_between_dms INTEGER DEFAULT 5,
    delay_after_batch INTEGER DEFAULT 60,
    message_template TEXT NOT NULL,
    pipeline_status_filter TEXT,
    outreach_status_filter TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES auth.users(id)
);

-- Note: To ensure RLS works properly for logged-in users, enable it.
-- ALTER TABLE public.ig_accounts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.dm_automations ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Allow all for authenticated" ON public.ig_accounts FOR ALL TO authenticated USING (true);
-- CREATE POLICY "Allow all for authenticated" ON public.dm_automations FOR ALL TO authenticated USING (true);
