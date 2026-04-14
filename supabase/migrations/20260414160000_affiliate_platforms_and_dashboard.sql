CREATE TABLE IF NOT EXISTS public.affiliate_platforms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'active',
  base_commission_rate NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.affiliate_partners ADD COLUMN IF NOT EXISTS platform_commissions JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.affiliate_partners ADD COLUMN IF NOT EXISTS platform_ids JSONB DEFAULT '{}'::jsonb;

ALTER TABLE public.affiliate_platforms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_affiliate_platforms" ON public.affiliate_platforms;
CREATE POLICY "public_read_affiliate_platforms" ON public.affiliate_platforms FOR SELECT USING (true);

DROP POLICY IF EXISTS "admin_all_affiliate_platforms" ON public.affiliate_platforms;
CREATE POLICY "admin_all_affiliate_platforms" ON public.affiliate_platforms FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')
  )
);

INSERT INTO public.affiliate_platforms (name, base_commission_rate) VALUES
  ('Amazon', 8),
  ('AliExpress', 10),
  ('Shopee', 12)
ON CONFLICT (name) DO NOTHING;

DO $$
DECLARE
  affiliate_user_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'afiliado@dealvoy.com') THEN
    affiliate_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      affiliate_user_id, '00000000-0000-0000-0000-000000000000',
      'afiliado@dealvoy.com', crypt('Skip@Pass', gen_salt('bf')), NOW(),
      NOW(), NOW(), '{"provider": "email", "providers": ["email"]}',
      '{"name": "Afiliado Parceiro", "role": "affiliate"}', false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role, is_affiliate)
    VALUES (affiliate_user_id, 'afiliado@dealvoy.com', 'Afiliado Parceiro', 'affiliate', true)
    ON CONFLICT (id) DO NOTHING;
    
    INSERT INTO public.affiliate_partners (id, user_id, email, name, status)
    VALUES (gen_random_uuid(), affiliate_user_id, 'afiliado@dealvoy.com', 'Afiliado Parceiro', 'active')
    ON CONFLICT (email) DO UPDATE SET status = 'active';
  ELSE
    SELECT id INTO affiliate_user_id FROM auth.users WHERE email = 'afiliado@dealvoy.com';
    UPDATE public.affiliate_partners SET status = 'active' WHERE email = 'afiliado@dealvoy.com';
  END IF;
END $$;
