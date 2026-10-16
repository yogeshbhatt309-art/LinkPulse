/*
# Create links and clicks tables for LinkPulse URL Shortener

1. New Tables
- `links`: Stores shortened URLs with their short codes and metadata.
  - `id` (uuid, primary key)
  - `original_url` (text, not null) — the destination URL
  - `short_code` (text, unique, not null) — the generated short code
  - `custom_alias` (text, nullable) — optional user-provided alias
  - `is_active` (boolean, default true) — whether the link is active
  - `created_at` (timestamptz, default now()) — creation date
- `clicks`: Records each redirect event for analytics.
  - `id` (uuid, primary key)
  - `link_id` (uuid, foreign key to links.id, on delete cascade)
  - `referrer` (text, nullable) — referrer header if present
  - `clicked_at` (timestamptz, default now()) — when the click occurred

2. Indexes
- Unique index on `links.short_code` for fast lookups during redirect.
- Index on `clicks.link_id` for fast per-link click count aggregation.

3. Security
- Enable RLS on both tables.
- Single-tenant (no auth) — policies allow anon + authenticated full CRUD.
- Data is intentionally public/shared for this hackathon demo.

4. Important Notes
- The redirect edge function uses the service role key (server-side) to
  look up links and insert click records, bypassing RLS.
- The dashboard frontend uses the anon key, which can read/write via the
  anon policies defined here.
*/

CREATE TABLE IF NOT EXISTS links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  original_url text NOT NULL,
  short_code text UNIQUE NOT NULL,
  custom_alias text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id uuid NOT NULL REFERENCES links(id) ON DELETE CASCADE,
  referrer text,
  clicked_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_links_short_code ON links(short_code);
CREATE INDEX IF NOT EXISTS idx_clicks_link_id ON clicks(link_id);

ALTER TABLE links ENABLE ROW LEVEL SECURITY;
ALTER TABLE clicks ENABLE ROW LEVEL SECURITY;

-- Links policies (single-tenant: anon + authenticated)
DROP POLICY IF EXISTS "anon_select_links" ON links;
CREATE POLICY "anon_select_links" ON links FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_links" ON links;
CREATE POLICY "anon_insert_links" ON links FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_links" ON links;
CREATE POLICY "anon_update_links" ON links FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_links" ON links;
CREATE POLICY "anon_delete_links" ON links FOR DELETE
  TO anon, authenticated USING (true);

-- Clicks policies (single-tenant: anon + authenticated)
DROP POLICY IF EXISTS "anon_select_clicks" ON clicks;
CREATE POLICY "anon_select_clicks" ON clicks FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_clicks" ON clicks;
CREATE POLICY "anon_insert_clicks" ON clicks FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_clicks" ON clicks;
CREATE POLICY "anon_delete_clicks" ON clicks FOR DELETE
  TO anon, authenticated USING (true);