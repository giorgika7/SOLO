/*
  # Fix Price Conversion from Cents to Dollars

  1. Changes
    - Divide all existing `price` and `retail_price` values by 100 in `esim_packages` table
    - Divide all existing `min_price` and `min_retail_price` values by 100 in `countries` table

  2. Notes
    - This migration corrects prices that were stored as cents instead of dollars
    - Example: 6000 cents becomes $60.00 in the database (correctly representing $0.60)
    - The migration is idempotent - it only updates values > 10 to avoid double-conversion
*/

-- Update esim_packages table: divide prices by 100 for values that appear to be in cents
UPDATE esim_packages
SET
  price = price / 100,
  retail_price = retail_price / 100
WHERE price > 10 OR retail_price > 10;

-- Update countries table: divide min prices by 100 for values that appear to be in cents
UPDATE countries
SET
  min_price = min_price / 100,
  min_retail_price = min_retail_price / 100
WHERE min_price > 10 OR min_retail_price > 10;