/*
  # Add INSERT policies for countries and packages

  1. Security Changes
    - Add policy for inserting countries (allows public inserts for data sync)
    - Add policy for inserting packages (allows public inserts for data sync)
    - These policies are needed for initial data population
    - In production, these should be restricted to service role only
*/

-- Allow public to insert countries (for data sync)
CREATE POLICY "Allow public to insert countries"
  ON countries
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow public to update countries (for data sync)
CREATE POLICY "Allow public to update countries"
  ON countries
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Allow public to insert packages (for data sync)
CREATE POLICY "Allow public to insert packages"
  ON esim_packages
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow public to update packages (for data sync)
CREATE POLICY "Allow public to update packages"
  ON esim_packages
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);
