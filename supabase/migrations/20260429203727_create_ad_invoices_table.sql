CREATE TABLE IF NOT EXISTS public.ad_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_number TEXT NOT NULL,
  ad_id UUID REFERENCES public.ad_campaigns(id) ON DELETE CASCADE,
  advertiser_id UUID REFERENCES public.ad_advertisers(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  issue_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  due_date TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.ad_invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_all_ad_invoices" ON public.ad_invoices;
CREATE POLICY "public_all_ad_invoices" ON public.ad_invoices
  FOR ALL USING (true) WITH CHECK (true);
