-- Эхний migration. Vercel-ийн runtime дээр автоматаар ажиллуулахгүй.
CREATE TABLE IF NOT EXISTS projects (
  id text PRIMARY KEY,
  title_mn text NOT NULL, title_en text NOT NULL,
  summary_mn text NOT NULL, summary_en text NOT NULL,
  content_mn text NOT NULL, content_en text NOT NULL,
  technologies text NOT NULL DEFAULT '', image_key text NOT NULL DEFAULT '',
  github_url text NOT NULL DEFAULT '', demo_url text NOT NULL DEFAULT '',
  published integer NOT NULL DEFAULT 0 CHECK (published IN (0, 1)),
  created_at text NOT NULL, updated_at text NOT NULL
);
CREATE TABLE IF NOT EXISTS admin_login_requests (
  token_hash text PRIMARY KEY,
  admin_email text NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS admin_sessions (
  token_hash text PRIMARY KEY,
  admin_email text NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS admin_email_limits (
  admin_email text PRIMARY KEY,
  window_started_at timestamptz NOT NULL,
  last_sent_at timestamptz NOT NULL,
  request_count integer NOT NULL
);
