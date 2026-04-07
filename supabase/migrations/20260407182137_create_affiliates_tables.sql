CREATE TABLE IF NOT EXISTS public.affiliate_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  commission_model TEXT DEFAULT 'percentage',
  commission_rate NUMERIC DEFAULT 30.0,
  monthly_fee NUMERIC DEFAULT 0.0,
  api_keys JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.affiliate_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID REFERENCES public.affiliate_partners(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  sale_amount NUMERIC NOT NULL,
  total_commission NUMERIC NOT NULL,
  platform_fee NUMERIC NOT NULL,
  affiliate_earnings NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.affiliate_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_all_affiliates" ON public.affiliate_partners;
CREATE POLICY "auth_all_affiliates" ON public.affiliate_partners FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_all_transactions" ON public.affiliate_transactions;
CREATE POLICY "auth_all_transactions" ON public.affiliate_transactions FOR ALL TO authenticated USING (true) WITH CHECK (true);

DO $$
DECLARE
  new_affiliate_id UUID;
  new_affiliate_id2 UUID;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.affiliate_partners WHERE email = 'joao@afiliado.com') THEN
    new_affiliate_id := gen_random_uuid();
    INSERT INTO public.affiliate_partners (id, name, email, status, commission_model, commission_rate, monthly_fee)
    VALUES (new_affiliate_id, 'João Silva (Afiliado Pro)', 'joao@afiliado.com', 'active', 'percentage', 20.0, 0.0);

    INSERT INTO public.affiliate_transactions (affiliate_id, product_name, sale_amount, total_commission, platform_fee, affiliate_earnings, status)
    VALUES 
      (new_affiliate_id, 'Smartphone XYZ 128GB', 1500.00, 150.00, 30.00, 120.00, 'paid'),
      (new_affiliate_id, 'Notebook Pro 16"', 4500.00, 450.00, 90.00, 360.00, 'pending');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.affiliate_partners WHERE email = 'maria@afiliado.com') THEN
    new_affiliate_id2 := gen_random_uuid();
    INSERT INTO public.affiliate_partners (id, name, email, status, commission_model, commission_rate, monthly_fee)
    VALUES (new_affiliate_id2, 'Maria Santos', 'maria@afiliado.com', 'active', 'monthly', 0.0, 99.90);

    INSERT INTO public.affiliate_transactions (affiliate_id, product_name, sale_amount, total_commission, platform_fee, affiliate_earnings, status)
    VALUES 
      (new_affiliate_id2, 'Fone Bluetooth', 200.00, 16.00, 0.00, 16.00, 'paid'),
      (new_affiliate_id2, 'Cadeira Gamer', 800.00, 80.00, 0.00, 80.00, 'paid');
  END IF;
END $$;
