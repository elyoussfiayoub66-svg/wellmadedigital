-- Add new columns for the Schedule Meeting modal

-- Add instagram to leads
ALTER TABLE leads ADD COLUMN IF NOT EXISTS instagram TEXT;

-- Add meeting_link to appointments
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS meeting_link TEXT;
