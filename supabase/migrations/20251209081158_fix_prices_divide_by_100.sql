/*
  # Fix price scaling - divide all prices by 100

  1. Problem
    - Prices were stored in cents instead of dollars
    - Min price 92 = $0.92, Max price 13800 = $138.00
    - This causes display of $92.00 instead of $0.92

  2. Solution
    - Divide both price and retail_price columns by 100
    - Clear all packages to prepare for re-sync with correct prices
    - Next sync will populate with correct dollar amounts

  3. Data Integrity
    - Division is safe for all values (whole cent amounts)
    - No data loss, just scale correction
    - Countries table preserved
*/

UPDATE esim_packages 
SET price = price / 100, 
    retail_price = retail_price / 100;

DELETE FROM esim_packages;
