/*
  # Fix Infinite Recursion in Users Table Policies

  ## Problem
  The "Admins can read all users" policy creates infinite recursion by querying 
  the users table within a policy check on the users table.

  ## Changes
  1. Drop all existing policies on users table
  2. Create clean, simple policies without recursion:
     - Users can read their own profile (no subqueries)
     - Users can insert their own profile (for registration)
     - Users can update their own profile
     - Remove problematic admin policy (admin features can use service role)

  ## Security
  - Each user can only access their own data
  - No recursive queries
  - Admin operations should use service role key or separate approach
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "Admins can read all users" ON users;
DROP POLICY IF EXISTS "Users can create their own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Create clean policies without recursion
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
