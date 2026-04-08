DO $$
DECLARE
  new_admin_id uuid;
  new_shopkeeper_id uuid;
  new_user_id uuid;
  new_affiliate_id uuid;
BEGIN
  -- Admin Master (adailtong@gmail.com)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'adailtong@gmail.com') THEN
    new_admin_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_admin_id, '00000000-0000-0000-0000-000000000000', 'adailtong@gmail.com', crypt('Skip@Pass', gen_salt('bf')), NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}', '{"name": "Adailton (Master)", "role": "super_admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
    
    INSERT INTO public.profiles (id, email, name, role, is_affiliate)
    VALUES (new_admin_id, 'adailtong@gmail.com', 'Adailton (Master)', 'super_admin', false)
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- Lojista
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'vendor@dealvoy.com') THEN
    new_shopkeeper_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_shopkeeper_id, '00000000-0000-0000-0000-000000000000', 'vendor@dealvoy.com', crypt('Skip@Pass', gen_salt('bf')), NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}', '{"name": "Lojista Teste", "role": "shopkeeper"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
    
    INSERT INTO public.profiles (id, email, name, role, is_affiliate)
    VALUES (new_shopkeeper_id, 'vendor@dealvoy.com', 'Lojista Teste', 'shopkeeper', false)
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- Usuario Normal
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'cliente@dealvoy.com') THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_user_id, '00000000-0000-0000-0000-000000000000', 'cliente@dealvoy.com', crypt('Skip@Pass', gen_salt('bf')), NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}', '{"name": "Cliente Teste", "role": "user"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
    
    INSERT INTO public.profiles (id, email, name, role, is_affiliate)
    VALUES (new_user_id, 'cliente@dealvoy.com', 'Cliente Teste', 'user', false)
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- Afiliado
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'afiliado@dealvoy.com') THEN
    new_affiliate_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_affiliate_id, '00000000-0000-0000-0000-000000000000', 'afiliado@dealvoy.com', crypt('Skip@Pass', gen_salt('bf')), NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}', '{"name": "Afiliado Teste", "role": "affiliate"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
    
    INSERT INTO public.profiles (id, email, name, role, is_affiliate)
    VALUES (new_affiliate_id, 'afiliado@dealvoy.com', 'Afiliado Teste', 'affiliate', true)
    ON CONFLICT (id) DO NOTHING;
    
    INSERT INTO public.affiliate_partners (id, user_id, email, name, status, commission_model, commission_rate)
    VALUES (gen_random_uuid(), new_affiliate_id, 'afiliado@dealvoy.com', 'Afiliado Teste', 'active', 'percentage', 30.0)
    ON CONFLICT (email) DO NOTHING;
  END IF;
END $$;
