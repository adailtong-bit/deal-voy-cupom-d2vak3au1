CREATE TABLE IF NOT EXISTS ad_advertisers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ad_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  company_id TEXT,
  advertiser_id TEXT,
  region TEXT,
  category TEXT,
  billing_type TEXT,
  placement TEXT,
  status TEXT DEFAULT 'active',
  views INT DEFAULT 0,
  clicks INT DEFAULT 0,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  image TEXT,
  link TEXT,
  price NUMERIC,
  budget NUMERIC,
  cost_per_click NUMERIC,
  currency TEXT DEFAULT 'BRL',
  duration_days INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE ad_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_advertisers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_all_ad_campaigns" ON ad_campaigns;
CREATE POLICY "public_all_ad_campaigns" ON ad_campaigns
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_all_ad_advertisers" ON ad_advertisers;
CREATE POLICY "public_all_ad_advertisers" ON ad_advertisers
  FOR ALL USING (true) WITH CHECK (true);

-- Ensure there's at least one advertiser to avoid empty dropdowns
INSERT INTO ad_advertisers (id, company_name, email)
VALUES ('00000000-0000-0000-0000-000000000001'::uuid, 'Advertiser Mock', 'mock@ads.com')
ON CONFLICT DO NOTHING;
