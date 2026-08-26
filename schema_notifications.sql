-- Notifications Table
DROP TABLE IF EXISTS notifications CASCADE;
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info', -- 'info', 'success', 'warning', 'error'
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own notifications" ON notifications
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Trigger for New Payments
CREATE OR REPLACE FUNCTION notify_on_invoice_paid()
RETURNS TRIGGER AS $$
BEGIN
  -- If status changed to Paid
  IF NEW.status = 'Paid' AND OLD.status != 'Paid' THEN
    -- Insert a notification for all users (or ideally admins/project managers)
    -- For simplicity, let's insert a notification for all active profiles
    INSERT INTO notifications (user_id, title, message, type)
    SELECT id, 'Invoice Paid', 'Invoice #' || NEW.invoice_number || ' has been marked as Paid (' || NEW.amount || ').', 'success'
    FROM profiles WHERE account_status = 'active';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_invoice_paid ON invoices;
CREATE TRIGGER trigger_invoice_paid
AFTER UPDATE ON invoices
FOR EACH ROW EXECUTE PROCEDURE notify_on_invoice_paid();

-- Trigger for New User Signups
CREATE OR REPLACE FUNCTION notify_on_pending_user()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.account_status = 'pending' THEN
    -- Notify all active users (admins)
    INSERT INTO notifications (user_id, title, message, type)
    SELECT id, 'New User Pending Approval', COALESCE(NEW.full_name, 'A new user') || ' has signed up and is waiting for approval.', 'warning'
    FROM profiles WHERE account_status = 'active' AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_pending_user ON profiles;
CREATE TRIGGER trigger_pending_user
AFTER INSERT ON profiles
FOR EACH ROW EXECUTE PROCEDURE notify_on_pending_user();
