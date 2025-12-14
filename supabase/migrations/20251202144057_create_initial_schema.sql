/*
  # Initial SOLO eSIM Database Schema

  1. New Tables
    - `users` - User profiles and account information
    - `countries` - Available countries and regions
    - `esim_packages` - eSIM packages per country
    - `esims` - Purchased eSIM records
    - `orders` - Purchase orders
    - `referral_codes` - User referral tracking
    
  2. Security
    - Enable RLS on all tables
    - Users can only read/write their own data
    - Public read access to countries and packages
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  balance numeric DEFAULT 0,
  currency text DEFAULT 'USD',
  preferences jsonb DEFAULT '{"language":"en","notifications":true,"dataAlerts":true}',
  created_at timestamptz DEFAULT now(),
  last_login timestamptz,
  updated_at timestamptz DEFAULT now()
);

-- Create countries table
CREATE TABLE IF NOT EXISTS countries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  region text NOT NULL,
  flag text,
  is_top_country boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create esim_packages table
CREATE TABLE IF NOT EXISTS esim_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id uuid NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
  data_amount integer NOT NULL,
  validity_days integer NOT NULL,
  price numeric NOT NULL,
  currency text DEFAULT 'USD',
  description text,
  api_package_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create esims table
CREATE TABLE IF NOT EXISTS esims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  country_id uuid NOT NULL REFERENCES countries(id),
  package_id uuid NOT NULL REFERENCES esim_packages(id),
  iccid text UNIQUE NOT NULL,
  activation_code text NOT NULL,
  qr_code text,
  status text DEFAULT 'inactive',
  data_used integer DEFAULT 0,
  data_total integer NOT NULL,
  purchase_date timestamptz DEFAULT now(),
  expiry_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  package_id uuid NOT NULL REFERENCES esim_packages(id),
  amount numeric NOT NULL,
  currency text DEFAULT 'USD',
  status text DEFAULT 'pending',
  payment_method text,
  email text NOT NULL,
  esim_id uuid REFERENCES esims(id),
  promo_code text,
  discount numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create referral_codes table
CREATE TABLE IF NOT EXISTS referral_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code text UNIQUE NOT NULL,
  bonus_amount numeric DEFAULT 10,
  used_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_countries_code ON countries(code);
CREATE INDEX IF NOT EXISTS idx_esim_packages_country ON esim_packages(country_id);
CREATE INDEX IF NOT EXISTS idx_esims_user ON esims(user_id);
CREATE INDEX IF NOT EXISTS idx_esims_iccid ON esims(iccid);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_referral_codes_user ON referral_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON referral_codes(code);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE esim_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE esims ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for countries table (public read)
CREATE POLICY "Countries are publicly readable"
  ON countries FOR SELECT
  TO public
  USING (true);

-- RLS Policies for esim_packages table (public read)
CREATE POLICY "Packages are publicly readable"
  ON esim_packages FOR SELECT
  TO public
  USING (true);

-- RLS Policies for esims table
CREATE POLICY "Users can read own eSIMs"
  ON esims FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own eSIMs"
  ON esims FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own eSIMs"
  ON esims FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for orders table
CREATE POLICY "Users can read own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for referral_codes table
CREATE POLICY "Users can read own referral codes"
  ON referral_codes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own referral codes"
  ON referral_codes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
