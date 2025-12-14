/*
  # Fix corrupted data amounts in database

  1. Problem
    - Previous code incorrectly multiplied API byte values by 1073741824 (1GB)
    - This caused data_amount values to be massively inflated
    - Example: 100MB (104857600 bytes) became 112589990684262400

  2. Solution
    - Delete all existing packages to start fresh
    - The sync service will re-populate with correct values from API
    - API now correctly maps volume field to dataAmount
    - No more incorrect multiplication in sync code

  3. Important Notes
    - This clears all package data but preserves countries
    - User esims and orders are not affected
    - Re-run country sync after this migration to populate packages
*/

-- Delete all existing packages (they have corrupted data_amount values)
DELETE FROM esim_packages;

-- Note: Countries table is preserved, packages will be re-synced
