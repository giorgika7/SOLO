/*
  # Add Notifications and Webhook Logs Tables

  1. New Tables
    - `notifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `type` (text) - notification type: low_data, expiring_soon, order_ready, low_balance
      - `message` (text) - notification message content
      - `related_iccid` (text, optional) - related eSIM ICCID
      - `related_order_no` (text, optional) - related order number
      - `read` (boolean) - whether notification has been read
      - `created_at` (timestamptz)

    - `webhook_logs`
      - `id` (uuid, primary key)
      - `event_type` (text) - webhook event type
      - `payload` (jsonb) - full webhook payload
      - `processed` (boolean) - whether webhook was successfully processed
      - `error` (text, optional) - error message if processing failed
      - `created_at` (timestamptz)

  2. Updates to Existing Tables
    - Add `order_no` column to `orders` table
    - Add `order_no` column to `esims` table
    - Add `last_checked_usage` column to `esims` table

  3. Security
    - Enable RLS on new tables
    - Add policies for authenticated users
*/

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  message text NOT NULL,
  related_iccid text,
  related_order_no text,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create webhook_logs table
CREATE TABLE IF NOT EXISTS webhook_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  payload jsonb NOT NULL,
  processed boolean DEFAULT false,
  error text,
  created_at timestamptz DEFAULT now()
);

-- Add columns to orders table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'order_no'
  ) THEN
    ALTER TABLE orders ADD COLUMN order_no text UNIQUE;
  END IF;
END $$;

-- Add columns to esims table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'esims' AND column_name = 'order_no'
  ) THEN
    ALTER TABLE esims ADD COLUMN order_no text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'esims' AND column_name = 'last_checked_usage'
  ) THEN
    ALTER TABLE esims ADD COLUMN last_checked_usage timestamptz;
  END IF;
END $$;

-- Enable RLS on notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Enable RLS on webhook_logs (admin only)
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only service role can access webhook logs"
  ON webhook_logs FOR ALL
  TO authenticated
  USING (false);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_processed ON webhook_logs(processed);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_created_at ON webhook_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_order_no ON orders(order_no);
CREATE INDEX IF NOT EXISTS idx_esims_order_no ON esims(order_no);
