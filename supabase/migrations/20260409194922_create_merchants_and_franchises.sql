CREATE TABLE IF NOT EXISTS public.merchants (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT,
  business_phone TEXT,
  region TEXT,
  region_id TEXT,
  country TEXT,
  address_country TEXT,
  address_state TEXT,
  address_city TEXT,
  address_zip TEXT,
  address_street TEXT,
  address_number TEXT,
  address_complement TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.franchises (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT,
  region TEXT,
  region_id TEXT,
  country TEXT,
  address_country TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.merchants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_all_merchants" ON public.merchants;
CREATE POLICY "auth_all_merchants" ON public.merchants
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_read_merchants" ON public.merchants;
CREATE POLICY "public_read_merchants" ON public.merchants
  FOR SELECT TO public USING (true);

ALTER TABLE public.franchises ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_all_franchises" ON public.franchises;
CREATE POLICY "auth_all_franchises" ON public.franchises
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_read_franchises" ON public.franchises;
CREATE POLICY "public_read_franchises" ON public.franchises
  FOR SELECT TO public USING (true);
