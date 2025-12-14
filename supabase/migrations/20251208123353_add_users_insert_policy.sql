/*
  # Add INSERT policy for users table

  1. Changes
    - Add INSERT policy to allow authenticated users to create their own profile
    
  2. Security
    - Users can only insert their own profile (matching auth.uid())
    - Prevents users from creating profiles for other users
*/

-- Add INSERT policy for users table
CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);
