-- Invoices Schema and Automation

CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  amount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'Pending',
  type TEXT, -- e.g., 'Deposit', 'Final'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS setup
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated full access to invoices" ON invoices;
CREATE POLICY "Allow authenticated full access to invoices" ON invoices 
  FOR ALL TO authenticated 
  USING (true);

-- Automation Trigger
CREATE OR REPLACE FUNCTION handle_project_invoices()
RETURNS TRIGGER AS $$
BEGIN
  -- 1. Deposit Invoice Trigger (When status becomes 'Active')
  IF NEW.status = 'Active' AND (TG_OP = 'INSERT' OR OLD.status != 'Active') THEN
    -- Prevent duplicate deposit invoices for the same project
    IF NOT EXISTS (SELECT 1 FROM invoices WHERE project_id = NEW.id AND type = 'Deposit') THEN
      INSERT INTO invoices (invoice_number, project_id, lead_id, amount, status, type)
      VALUES (
        'INV-' || to_char(NOW(), 'YYYYMMDD') || '-' || substring(NEW.id::text from 1 for 4),
        NEW.id,
        NEW.lead_id,
        NEW.value * 0.5,
        'Pending',
        'Deposit'
      );
    END IF;
  END IF;

  -- 2. Final Invoice Trigger (When status becomes 'Review' or 'Completed')
  IF (NEW.status = 'Review' OR NEW.status = 'Completed') AND (TG_OP = 'INSERT' OR (OLD.status != 'Review' AND OLD.status != 'Completed')) THEN
    -- Prevent duplicate final invoices for the same project
    IF NOT EXISTS (SELECT 1 FROM invoices WHERE project_id = NEW.id AND type = 'Final') THEN
      INSERT INTO invoices (invoice_number, project_id, lead_id, amount, status, type)
      VALUES (
        'INV-' || to_char(NOW(), 'YYYYMMDD') || '-' || substring(NEW.id::text from 5 for 4),
        NEW.id,
        NEW.lead_id,
        NEW.value * 0.5,
        'Pending',
        'Final'
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_project_status_invoices ON projects;
CREATE TRIGGER trg_project_status_invoices
AFTER INSERT OR UPDATE OF status ON projects
FOR EACH ROW
EXECUTE FUNCTION handle_project_invoices();
