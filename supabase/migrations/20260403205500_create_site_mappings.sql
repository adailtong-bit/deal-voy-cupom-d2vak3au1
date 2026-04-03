CREATE TABLE IF NOT EXISTS public.site_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    mapping_rules JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP POLICY IF EXISTS "auth_all_site_mappings" ON public.site_mappings;
CREATE POLICY "auth_all_site_mappings" ON public.site_mappings
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_read_site_mappings" ON public.site_mappings;
CREATE POLICY "public_read_site_mappings" ON public.site_mappings
    FOR SELECT TO public USING (true);
