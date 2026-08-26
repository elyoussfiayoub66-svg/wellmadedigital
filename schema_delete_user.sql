-- Function to securely delete a user from auth.users (which cascades to profiles)
CREATE OR REPLACE FUNCTION delete_user_account(user_id UUID)
RETURNS void AS $$
BEGIN
  -- We delete from auth.users, and because profiles has ON DELETE CASCADE, it removes the profile too.
  DELETE FROM auth.users WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
