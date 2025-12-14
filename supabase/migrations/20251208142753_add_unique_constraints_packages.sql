/*
  # Add unique constraints for packages

  1. Changes
    - Add unique constraint on api_package_id for esim_packages
    - This allows upsert operations
*/

-- Add unique constraint on api_package_id
ALTER TABLE esim_packages
ADD CONSTRAINT esim_packages_api_package_id_unique 
UNIQUE (api_package_id);
