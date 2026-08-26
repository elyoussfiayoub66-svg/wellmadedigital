-- Add account_status column to profiles table
-- By default, new users are placed in a 'pending' state
ALTER TABLE profiles ADD COLUMN account_status VARCHAR DEFAULT 'pending';

-- Update existing profiles to 'active' so current users are not locked out
UPDATE profiles SET account_status = 'active' WHERE account_status = 'pending';
