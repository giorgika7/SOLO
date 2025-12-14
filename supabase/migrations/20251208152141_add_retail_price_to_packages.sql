/*
  # Add Retail Price to eSIM Packages

  1. Changes
    - Add `retail_price` column to `esim_packages` table
    - Add `min_retail_price` column to `countries` table
    - Update existing records to use price * 2 as temporary retail price
  
  2. Purpose
    - Store suggested retail price separate from wholesale price
    - `price` = wholesale cost (what we pay)
    - `retail_price` = suggested retail price (what customers see)
    
  3. Notes
    - Existing data will be updated with estimated retail prices
    - Future syncs will populate actual retail prices from API
*/

-- Add retail_price column to esim_packages
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'esim_packages' AND column_name = 'retail_price'
  ) THEN
    ALTER TABLE esim_packages ADD COLUMN retail_price numeric;
  END IF;
END $$;

-- Update existing packages with estimated retail price (price * 2)
UPDATE esim_packages 
SET retail_price = price * 2 
WHERE retail_price IS NULL;

-- Add min_retail_price column to countries
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'countries' AND column_name = 'min_retail_price'
  ) THEN
    ALTER TABLE countries ADD COLUMN min_retail_price numeric;
  END IF;
END $$;

-- Calculate and update min_retail_price for each country
UPDATE countries c
SET min_retail_price = (
  SELECT MIN(retail_price)
  FROM esim_packages ep
  WHERE ep.country_id = c.id
)
WHERE EXISTS (
  SELECT 1 FROM esim_packages ep WHERE ep.country_id = c.id
);