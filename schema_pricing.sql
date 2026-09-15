-- schema_pricing.sql
-- Pricing Calculator Database Schema

-- Features Table
CREATE TABLE IF NOT EXISTS pricing_features (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  pricing_type VARCHAR(50) DEFAULT 'fixed' -- 'fixed' or 'per_page'
);

-- Dependency Groups
CREATE TABLE IF NOT EXISTS pricing_groups (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  discount_percentage DECIMAL(5,2) DEFAULT 10.00
);

-- Feature <-> Group mapping (Many-to-Many)
CREATE TABLE IF NOT EXISTS pricing_feature_groups (
  feature_id VARCHAR(50) REFERENCES pricing_features(id) ON DELETE CASCADE,
  group_id VARCHAR(50) REFERENCES pricing_groups(id) ON DELETE CASCADE,
  PRIMARY KEY (feature_id, group_id)
);

-- Mutually Exclusive Pairs (e.g. Basic vs Advanced Booking)
CREATE TABLE IF NOT EXISTS pricing_exclusive_pairs (
  feature_id_1 VARCHAR(50) REFERENCES pricing_features(id) ON DELETE CASCADE,
  feature_id_2 VARCHAR(50) REFERENCES pricing_features(id) ON DELETE CASCADE,
  PRIMARY KEY (feature_id_1, feature_id_2)
);

-- Saved Quotes
CREATE TABLE IF NOT EXISTS pricing_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name VARCHAR(255),
  total_price DECIMAL(10, 2),
  discount_total DECIMAL(10, 2),
  configuration JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SEED DATA --

-- 1. Insert Features
INSERT INTO pricing_features (id, name, category, price, pricing_type) VALUES
('login', 'Login + Signup', 'Core', 500, 'fixed'),
('roles', 'User roles & permissions', 'Core', 400, 'fixed'),
('homepage', 'Homepage', 'Pages', 700, 'fixed'),
('standard', 'Standard public page', 'Pages', 100, 'per_page'),
('dashboard', 'Operations / dashboard page', 'Pages', 300, 'per_page'),
('settings', 'Settings page', 'Pages', 200, 'per_page'),
('profile', 'Profile page', 'Pages', 50, 'per_page'),
('basicBooking', 'Basic booking system', 'Booking', 800, 'fixed'),
('advancedBooking', 'Advanced booking system', 'Booking', 1400, 'fixed'),
('calendar', 'Calendar availability', 'Booking', 500, 'fixed'),
('autoConfirm', 'Automated booking confirmation', 'Booking', 500, 'fixed'),
('catalog', 'Product / service catalog', 'Commerce', 800, 'fixed'),
('orderMgmt', 'Order management', 'Commerce', 1200, 'fixed'),
('coupon', 'Coupon / discount system', 'Commerce', 400, 'fixed'),
('whatsapp', 'WhatsApp automated messaging', 'Communication', 900, 'fixed')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name, 
  category = EXCLUDED.category, 
  price = EXCLUDED.price, 
  pricing_type = EXCLUDED.pricing_type;

-- 2. Insert Groups
INSERT INTO pricing_groups (id, name, discount_percentage) VALUES
('booking', 'Booking Group', 10.00),
('commerce', 'Commerce Group', 10.00),
('communication', 'Communication Group', 10.00)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name, 
  discount_percentage = EXCLUDED.discount_percentage;

-- 3. Insert Feature <-> Group Relations
INSERT INTO pricing_feature_groups (feature_id, group_id) VALUES
('basicBooking', 'booking'),
('advancedBooking', 'booking'),
('calendar', 'booking'),
('autoConfirm', 'booking'),
('catalog', 'commerce'),
('orderMgmt', 'commerce'),
('coupon', 'commerce'),
('whatsapp', 'communication'),
('autoConfirm', 'communication')
ON CONFLICT DO NOTHING;

-- 4. Insert Mutually Exclusive Pairs
INSERT INTO pricing_exclusive_pairs (feature_id_1, feature_id_2) VALUES
('basicBooking', 'advancedBooking')
ON CONFLICT DO NOTHING;
