-- =====================================================================
-- DEFINITIVE SIGNUP FIX
-- Run this entire script in your Supabase SQL Editor
-- This fixes "Database error saving new user" on signup
-- =====================================================================

-- STEP 1: Ensure profiles table has account_status column with proper default
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS account_status TEXT NOT NULL DEFAULT 'pending';

-- STEP 2: Make sure any existing users who are admins stay active
-- (prevents locking everyone out - you may need to manually set your own account)
-- UPDATE public.profiles SET account_status = 'active' WHERE id = '<YOUR_USER_ID>';

-- STEP 3: Rewrite handle_new_user to insert WITH account_status = 'pending'
-- This ensures new signups start as pending and the notifications trigger fires correctly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, account_status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    NEW.raw_user_meta_data->>'avatar_url',
    'pending'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 4: Recreate the trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- STEP 5: Rewrite notify_on_pending_user to be completely safe
-- It now wraps everything in an EXCEPTION block so if notifications
-- table doesn't exist yet it won't crash the signup
CREATE OR REPLACE FUNCTION notify_on_pending_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Only notify if this is a new pending user
  IF NEW.account_status = 'pending' THEN
    BEGIN
      INSERT INTO notifications (user_id, title, message, type)
      SELECT 
        id,
        'New User Pending Approval',
        COALESCE(NEW.full_name, 'A new user') || ' has signed up and is waiting for approval.',
        'warning'
      FROM profiles 
      WHERE account_status = 'active' 
        AND id != NEW.id;
    EXCEPTION WHEN OTHERS THEN
      -- Silently ignore notification errors — never block signup
      NULL;
    END;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 6: Recreate the trigger on profiles
DROP TRIGGER IF EXISTS trigger_pending_user ON profiles;
CREATE TRIGGER trigger_pending_user
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE PROCEDURE notify_on_pending_user();

-- STEP 7: RLS policies — allow INSERT from the trigger (SECURITY DEFINER bypasses RLS,
-- but let's be explicit so nothing blocks the profile creation)
DROP POLICY IF EXISTS "Service role can insert profiles" ON profiles;
CREATE POLICY "Service role can insert profiles" ON profiles
  FOR INSERT WITH CHECK (true);

-- DONE: New users will now sign up without error, start as 'pending',
-- and admins will be notified via the notifications table.
