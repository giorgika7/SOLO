/*
  # Fix data_amount column type and convert to bytes

  1. Changes
    - Changes data_amount column from integer to bigint (supports larger numbers)
    - Updates all existing esim_packages to convert data_amount from GB to bytes
    - Updates esims table columns (data_total and data_used) to bigint
    - Multiplies all values by 1073741824 (1 GB in bytes)
    
  2. Important Notes
    - This migration assumes current data_amount values are in GB units (e.g., 1, 3, 5, 10)
    - After this migration, all data amounts will be stored as raw bytes
    - The formatDataAmount utility will properly display these as MB or GB
    - Only updates rows where values are < 1000 to avoid re-converting already converted values
*/

-- Change esim_packages.data_amount from integer to bigint
ALTER TABLE esim_packages 
ALTER COLUMN data_amount TYPE bigint;

-- Convert esim_packages data_amount from GB to bytes
UPDATE esim_packages 
SET data_amount = data_amount * 1073741824 
WHERE data_amount < 1000;

-- Change esims table columns from integer to bigint
ALTER TABLE esims 
ALTER COLUMN data_total TYPE bigint,
ALTER COLUMN data_used TYPE bigint;

-- Convert esims data from GB to bytes (if any exist)
UPDATE esims 
SET 
  data_total = data_total * 1073741824,
  data_used = data_used * 1073741824
WHERE data_total < 1000;