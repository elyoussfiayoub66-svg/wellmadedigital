-- Create an RPC function to approve users that bypasses RLS
CREATE OR REPLACE FUNCTION approve_user(user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE profiles SET account_status = 'active' WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
