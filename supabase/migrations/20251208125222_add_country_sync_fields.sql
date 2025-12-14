/*
  # Add Country Sync Fields

  1. Updates to Tables
    - Add new columns to `countries` table for API integration
      - `api_location_code` - Location code from eSIM Access API
      - `package_count` - Number of available packages
      - `min_price` - Minimum package price for this country
      - `last_synced_at` - Timestamp of last sync
    
    - Add new columns to `esim_packages` table for API data
      - `package_code` - Unique package code from API
      - `package_name` - Package name from API
      - `location_code` - Location code from API
      - `location_name` - Location name from API
  
  2. Indexes
    - Add index on `api_location_code` for faster lookups
    - Add index on `package_code` for faster lookups
*/

-- Add new columns to countries table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'countries' AND column_name = 'api_location_code'
  ) THEN
    ALTER TABLE countries ADD COLUMN api_location_code text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'countries' AND column_name = 'package_count'
  ) THEN
    ALTER TABLE countries ADD COLUMN package_count integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'countries' AND column_name = 'min_price'
  ) THEN
    ALTER TABLE countries ADD COLUMN min_price numeric;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'countries' AND column_name = 'last_synced_at'
  ) THEN
    ALTER TABLE countries ADD COLUMN last_synced_at timestamptz;
  END IF;
END $$;

-- Add new columns to esim_packages table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'esim_packages' AND column_name = 'package_code'
  ) THEN
    ALTER TABLE esim_packages ADD COLUMN package_code text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'esim_packages' AND column_name = 'package_name'
  ) THEN
    ALTER TABLE esim_packages ADD COLUMN package_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'esim_packages' AND column_name = 'location_code'
  ) THEN
    ALTER TABLE esim_packages ADD COLUMN location_code text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'esim_packages' AND column_name = 'location_name'
  ) THEN
    ALTER TABLE esim_packages ADD COLUMN location_name text;
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_countries_api_location_code ON countries(api_location_code);
CREATE INDEX IF NOT EXISTS idx_esim_packages_package_code ON esim_packages(package_code);
CREATE INDEX IF NOT EXISTS idx_esim_packages_location_code ON esim_packages(location_code);