-- Fix for the total_amount NOT NULL constraint

-- 1. Safely drop the NOT NULL constraint on total_amount so the database doesn't block the insert
ALTER TABLE invoices ALTER COLUMN total_amount DROP NOT NULL;
ALTER TABLE invoices ALTER COLUMN total_amount SET DEFAULT 0;

-- 2. Update the automation trigger to populate BOTH 'amount' (our new column) and 'total_amount' (your old column) just to be safe!
CREATE OR REPLACE FUNCTION handle_project_invoices()
RETURNS TRIGGER AS $$
BEGIN
  -- Deposit Invoice Trigger
  IF NEW.status = 'Active' AND (TG_OP = 'INSERT' OR OLD.status != 'Active') THEN
    IF NOT EXISTS (SELECT 1 FROM invoices WHERE project_id = NEW.id AND type = 'Deposit') THEN
      INSERT INTO invoices (invoice_number, project_id, lead_id, amount, total_amount, status, type)
      VALUES (
        'INV-' || to_char(NOW(), 'YYYYMMDD') || '-' || substring(NEW.id::text from 1 for 4),
        NEW.id,
        NEW.lead_id,
        NEW.value * 0.5,
        NEW.value * 0.5,
        'Pending',
        'Deposit'
      );
    END IF;
  END IF;

  -- Final Invoice Trigger
  IF (NEW.status = 'Review' OR NEW.status = 'Completed') AND (TG_OP = 'INSERT' OR (OLD.status != 'Review' AND OLD.status != 'Completed')) THEN
    IF NOT EXISTS (SELECT 1 FROM invoices WHERE project_id = NEW.id AND type = 'Final') THEN
      INSERT INTO invoices (invoice_number, project_id, lead_id, amount, total_amount, status, type)
      VALUES (
        'INV-' || to_char(NOW(), 'YYYYMMDD') || '-' || substring(NEW.id::text from 5 for 4),
        NEW.id,
        NEW.lead_id,
        NEW.value * 0.5,
        NEW.value * 0.5,
        'Pending',
        'Final'
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
