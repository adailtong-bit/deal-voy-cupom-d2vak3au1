DO $$
BEGIN

  CREATE TABLE IF NOT EXISTS public.ad_pricing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    placement TEXT NOT NULL,
    billing_type TEXT NOT NULL,
    duration_days INT,
    price NUMERIC NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  ALTER TABLE public.ad_pricing ENABLE ROW LEVEL SECURITY;

  DROP POLICY IF EXISTS "public_read_ad_pricing" ON public.ad_pricing;
  CREATE POLICY "public_read_ad_pricing" ON public.ad_pricing FOR SELECT TO public USING (true);

  DROP POLICY IF EXISTS "admin_all_ad_pricing" ON public.ad_pricing;
  CREATE POLICY "admin_all_ad_pricing" ON public.ad_pricing FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))
  );

  -- Seed ad advertisers
  IF NOT EXISTS (SELECT 1 FROM public.ad_advertisers LIMIT 1) THEN
    INSERT INTO public.ad_advertisers (id, company_name, contact_name, email, status) VALUES
      (gen_random_uuid(), 'Routevoy (Parceiro Interno)', 'Administração', 'admin@routevoy.com', 'active'),
      (gen_random_uuid(), 'Anunciante Demonstração', 'Cliente', 'anunciante@exemplo.com', 'active');
  END IF;

  -- Seed initial data if table is empty
  IF NOT EXISTS (SELECT 1 FROM public.ad_pricing LIMIT 1) THEN
    INSERT INTO public.ad_pricing (id, placement, billing_type, duration_days, price) VALUES
      (gen_random_uuid(), 'top', 'cpc', NULL, 0.5),
      (gen_random_uuid(), 'top', 'fixed', 7, 150.0),
      (gen_random_uuid(), 'bottom', 'cpc', NULL, 0.3),
      (gen_random_uuid(), 'sidebar', 'fixed', 30, 500.0),
      (gen_random_uuid(), 'search', 'cpc', NULL, 0.4),
      (gen_random_uuid(), 'offer_of_the_day', 'fixed', 1, 100.0),
      (gen_random_uuid(), 'top_ranking', 'fixed', 7, 250.0),
      (gen_random_uuid(), 'sponsored_push', 'cpa', NULL, 5.0);
  END IF;

END $$;
