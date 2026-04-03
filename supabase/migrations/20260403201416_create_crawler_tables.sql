CREATE TABLE IF NOT EXISTS public.discovered_promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    price NUMERIC,
    original_price NUMERIC,
    currency TEXT DEFAULT 'BRL',
    discount TEXT,
    discount_percentage NUMERIC,
    image_url TEXT,
    product_link TEXT,
    source_url TEXT,
    store_name TEXT,
    category TEXT,
    country TEXT,
    status TEXT DEFAULT 'pending',
    captured_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.discovered_promotions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_promotions" ON public.discovered_promotions;
CREATE POLICY "public_read_promotions" ON public.discovered_promotions FOR SELECT USING (true);
DROP POLICY IF EXISTS "auth_all_promotions" ON public.discovered_promotions;
CREATE POLICY "auth_all_promotions" ON public.discovered_promotions FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.crawler_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    type TEXT DEFAULT 'web',
    region TEXT,
    country TEXT,
    state TEXT,
    city TEXT,
    scan_radius NUMERIC,
    status TEXT DEFAULT 'active',
    last_scan TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.crawler_sources ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_sources" ON public.crawler_sources;
CREATE POLICY "public_read_sources" ON public.crawler_sources FOR SELECT USING (true);
DROP POLICY IF EXISTS "auth_all_sources" ON public.crawler_sources;
CREATE POLICY "auth_all_sources" ON public.crawler_sources FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.crawler_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date TIMESTAMPTZ DEFAULT NOW(),
    store_name TEXT,
    status TEXT,
    items_found INTEGER DEFAULT 0,
    items_imported INTEGER DEFAULT 0,
    source_id TEXT,
    error_message TEXT,
    error_details JSONB,
    category TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.crawler_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_logs" ON public.crawler_logs;
CREATE POLICY "public_read_logs" ON public.crawler_logs FOR SELECT USING (true);
DROP POLICY IF EXISTS "auth_insert_logs" ON public.crawler_logs;
CREATE POLICY "auth_insert_logs" ON public.crawler_logs FOR INSERT TO authenticated WITH CHECK (true);
