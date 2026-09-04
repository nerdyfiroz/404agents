-- 404Agents Database Schema
-- Run this SQL in your Neon dashboard to create the required tables.

CREATE TABLE IF NOT EXISTS whitelist (
  id            SERIAL PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  twitter       TEXT,
  comment       TEXT,
  submitted_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_tasks (
  id          SERIAL PRIMARY KEY,
  description TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Key-value settings for admin controls
CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Default settings
INSERT INTO settings (key, value) VALUES
  ('twitter_follow_link', '')
ON CONFLICT (key) DO NOTHING;

INSERT INTO settings (key, value) VALUES
  ('tweet_engage_link', '')
ON CONFLICT (key) DO NOTHING;

INSERT INTO settings (key, value) VALUES
  ('whitelist_paused', 'false')
ON CONFLICT (key) DO NOTHING;
