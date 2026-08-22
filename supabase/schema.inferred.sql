-- ============================================================
-- Love Local Eats POS — inferred database schema
-- Source of truth for what the client code actually reads/writes.
-- Every table is RLS-enabled with an open public policy so an
-- anonymous visitor can build and test a store with no account.
-- (owner_id is nullable; the active shop_id is kept in localStorage.)
-- ============================================================

-- ---------- Shops & menu (src/lib/menuStore.ts) ----------
CREATE TABLE IF NOT EXISTS shops (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id       text,                       -- null for anonymous builder sessions
  owner_email    text,
  name           text NOT NULL DEFAULT 'My Shop',
  slug           text,
  business_type  text DEFAULT 'restaurant',  -- BUSINESS_TYPES id in src/data/platform.ts
  concept_type   text,
  reward_program text DEFAULT 'punch',
  logo_url       text,
  primary_color  text,
  phone          text,
  address        text,
  source_file_name text,
  is_published   boolean DEFAULT true,
  tax_rate       numeric DEFAULT 0.0825,
  metadata       jsonb DEFAULT '{}'::jsonb,
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS menu_categories (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id    uuid REFERENCES shops(id) ON DELETE CASCADE,
  name       text NOT NULL,
  position   integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS menu_items (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id      uuid REFERENCES shops(id) ON DELETE CASCADE,
  category_id  uuid REFERENCES menu_categories(id) ON DELETE SET NULL,
  name         text NOT NULL,
  description  text,
  price        integer DEFAULT 0,            -- cents
  sizes        jsonb DEFAULT '[]'::jsonb,
  modifiers    jsonb DEFAULT '[]'::jsonb,
  tax_class    text DEFAULT 'prepared_food', -- src/data/taxClasses.ts
  image_url    text,
  is_available boolean DEFAULT true,
  position     integer DEFAULT 0,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

-- ---------- Brand vibe & generated website (vibeStore.ts, siteSettings.ts) ----------
CREATE TABLE IF NOT EXISTS shop_vibe_briefs (
  shop_id     uuid PRIMARY KEY,
  vibe_words  text,
  palette     text,
  template_id text,
  tagline     text,
  logo_url    text,
  notes       text,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS shop_site_settings (
  shop_id         uuid PRIMARY KEY,
  headline        text,
  subhead         text,
  about           text,
  phone           text,
  address         text,
  hours           jsonb DEFAULT '[]'::jsonb,
  socials         jsonb DEFAULT '{}'::jsonb,
  hero_image      text,
  logo_url        text,
  show_hiring     boolean DEFAULT true,
  order_enabled   boolean DEFAULT true,
  google_place_id text,
  domain          text,
  metadata        jsonb DEFAULT '{}'::jsonb,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- ---------- Hardware stations (hooks/useDevices.ts, useDeviceHealth.ts) ----------
-- Pairing also mirrors to localStorage so the console works offline / signed out.
CREATE TABLE IF NOT EXISTS devices (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id      uuid REFERENCES shops(id) ON DELETE CASCADE,
  device_kind  text,   -- DeviceKindId in src/data/platform.ts
  device_type  text,
  name         text,
  station      text DEFAULT 'Station 1',
  status       text DEFAULT 'unpaired',  -- unpaired | pairing | ready | busy
  ip_address   text,
  is_paired    boolean DEFAULT false,
  last_seen_at timestamptz,
  metadata     jsonb DEFAULT '{}'::jsonb,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

-- ---------- Floor tickets (src/lib/opsStore.ts, pages/POS.tsx) ----------
CREATE TABLE IF NOT EXISTS orders (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id        uuid REFERENCES shops(id) ON DELETE CASCADE,
  ticket_no      text,
  table_name     text,
  role_station   text DEFAULT 'server',  -- server | bar | kitchen | manager
  channel        text DEFAULT 'pos',     -- pos | online | kiosk | phone
  items          jsonb DEFAULT '[]'::jsonb,
  subtotal       integer DEFAULT 0,
  tax            integer DEFAULT 0,
  tip            integer DEFAULT 0,
  total          integer DEFAULT 0,
  pay_rail       text,                   -- tap | scan | reader | cash
  status         text DEFAULT 'open',    -- open | in-prep | ready | bumped | settled
  server_pin     text,
  server_name    text,
  offline_queued boolean DEFAULT false,
  metadata       jsonb DEFAULT '{}'::jsonb,
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now()
);

-- ---------- Tax engine (src/lib/taxEngine.ts) ----------
CREATE TABLE IF NOT EXISTS tax_jurisdictions (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id    uuid REFERENCES shops(id) ON DELETE CASCADE,
  name       text NOT NULL,
  level      text DEFAULT 'state',   -- state | county | city | special
  rate       numeric DEFAULT 0,
  position   integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tax_class_rules (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  jurisdiction_id uuid REFERENCES tax_jurisdictions(id) ON DELETE CASCADE,
  tax_class       text NOT NULL,
  taxable         boolean DEFAULT true,
  rate_override   numeric,
  created_at      timestamptz DEFAULT now(),
  UNIQUE (jurisdiction_id, tax_class)
);

-- ---------- Copilot transcript (src/lib/copilotHistory.ts) ----------
CREATE TABLE IF NOT EXISTS copilot_messages (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id    uuid,
  user_id    text,
  role       text DEFAULT 'user',
  text       text,
  effects    jsonb DEFAULT '[]'::jsonb,
  payload    jsonb DEFAULT '{}'::jsonb,
  mode       text,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- Hardware storefront (ecom_*) — managed by the Ecommerce admin tab.
-- Product handles referenced by DEVICE_KINDS[].handles and
-- STARTER_PLANS[].handles in src/data/platform.ts.
-- ecom_products, ecom_product_variants, ecom_product_options,
-- ecom_collections, ecom_product_collections, ecom_customers,
-- ecom_orders, ecom_order_items
-- ============================================================

-- ---------- RLS: open anonymous builder sessions ----------
-- Every table above runs:
--   ALTER TABLE <t> ENABLE ROW LEVEL SECURITY;
--   CREATE POLICY <t>_all ON <t> FOR ALL TO public USING (true) WITH CHECK (true);
-- This is deliberate: a visitor with no account can upload a menu, generate a
-- vibe, pair devices, ring test tickets and check out hardware. Tighten these
-- policies to `owner_id = auth.uid()` before storing real customer PII.
