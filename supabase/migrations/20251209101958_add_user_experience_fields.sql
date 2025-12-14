/*
  # Add User Experience and Admin Management Fields

  1. Changes to esims table
    - Add `order_no` field to link with API orders
    - Add `country_name` for display purposes
    - Add `package_name` for display purposes
    - Make country_id and package_id nullable since they may not always be linked

  2. Changes to users table
    - Add `name` field for user profile
    - Add `is_admin` boolean flag for admin access

  3. Changes to orders table
    - Add `order_no` field to store API order reference

  4. Security
    - Add admin policies for viewing all users and orders
    - Update RLS policies as needed
*/

-- Add order_no to esims table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'esims' AND column_name = 'order_no'
  ) THEN
    ALTER TABLE esims ADD COLUMN order_no text;
    CREATE INDEX IF NOT EXISTS idx_esims_order_no ON esims(order_no);
  END IF;
END $$;

-- Add display fields to esims table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'esims' AND column_name = 'country_name'
  ) THEN
    ALTER TABLE esims ADD COLUMN country_name text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'esims' AND column_name = 'package_name'
  ) THEN
    ALTER TABLE esims ADD COLUMN package_name text;
  END IF;
END $$;

-- Make country_id and package_id nullable
ALTER TABLE esims ALTER COLUMN country_id DROP NOT NULL;
ALTER TABLE esims ALTER COLUMN package_id DROP NOT NULL;

-- Add name field to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'name'
  ) THEN
    ALTER TABLE users ADD COLUMN name text;
  END IF;
END $$;

-- Add is_admin field to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE users ADD COLUMN is_admin boolean DEFAULT false;
  END IF;
END $$;

-- Add order_no to orders table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'order_no'
  ) THEN
    ALTER TABLE orders ADD COLUMN order_no text;
    CREATE INDEX IF NOT EXISTS idx_orders_order_no ON orders(order_no);
  END IF;
END $$;

-- Add admin policies for users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Admins can read all users'
  ) THEN
    CREATE POLICY "Admins can read all users"
      ON users FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM users
          WHERE users.id = auth.uid() AND users.is_admin = true
        )
      );
  END IF;
END $$;

-- Add admin policies for orders table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Admins can read all orders'
  ) THEN
    CREATE POLICY "Admins can read all orders"
      ON orders FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM users
          WHERE users.id = auth.uid() AND users.is_admin = true
        )
      );
  END IF;
END $$;

-- Add admin policies for esims table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'esims' AND policyname = 'Admins can read all esims'
  ) THEN
    CREATE POLICY "Admins can read all esims"
      ON esims FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM users
          WHERE users.id = auth.uid() AND users.is_admin = true
        )
      );
  END IF;
END $$;
