DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'affiliate_partners_email_key'
  ) THEN
    ALTER TABLE public.affiliate_partners ADD CONSTRAINT affiliate_partners_email_key UNIQUE (email);
  END IF;
END $$;

ALTER TABLE public.affiliate_partners ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

DROP POLICY IF EXISTS "auth_all_affiliates" ON public.affiliate_partners;
CREATE POLICY "auth_all_affiliates" ON public.affiliate_partners FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Create a dummy affiliate user for testing
DO $$
DECLARE
  new_user_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'afiliado@dealvoy.com') THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'afiliado@dealvoy.com',
      crypt('AfiliadoPass123!', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Afiliado Teste"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL,
      '', '', ''
    );

    INSERT INTO public.affiliate_partners (email, name, status, user_id)
    VALUES ('afiliado@dealvoy.com', 'Afiliado Teste', 'active', new_user_id)
    ON CONFLICT (email) DO UPDATE SET user_id = new_user_id;
  END IF;
END $$;
