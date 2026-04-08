DO $$
DECLARE
  new_admin_id uuid;
  new_shopkeeper_id uuid;
  new_user_id uuid;
  new_affiliate_id uuid;
BEGIN
  -- Fix possible NULLs in auth.users tokens for all test users first
  UPDATE auth.users
  SET
    confirmation_token = COALESCE(confirmation_token, ''),
    recovery_token = COALESCE(recovery_token, ''),
    email_change_token_new = COALESCE(email_change_token_new, ''),
    email_change = COALESCE(email_change, ''),
    email_change_token_current = COALESCE(email_change_token_current, ''),
    phone_change = COALESCE(phone_change, ''),
    phone_change_token = COALESCE(phone_change_token, ''),
    reauthentication_token = COALESCE(reauthentication_token, '')
  WHERE email IN ('adailtong@gmail.com', 'vendor@dealvoy.com', 'cliente@dealvoy.com', 'afiliado@dealvoy.com');

  -- Admin Master
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
    ON CONFLICT (id) DO UPDATE SET role = 'super_admin';
  ELSE
    UPDATE public.profiles SET role = 'super_admin' WHERE email = 'adailtong@gmail.com';
    UPDATE auth.users SET raw_user_meta_data = '{"name": "Adailton (Master)", "role": "super_admin"}' WHERE email = 'adailtong@gmail.com';
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
    ON CONFLICT (id) DO UPDATE SET role = 'shopkeeper';
  ELSE
    UPDATE public.profiles SET role = 'shopkeeper' WHERE email = 'vendor@dealvoy.com';
    UPDATE auth.users SET raw_user_meta_data = '{"name": "Lojista Teste", "role": "shopkeeper"}' WHERE email = 'vendor@dealvoy.com';
  END IF;

  -- Cliente
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
    ON CONFLICT (id) DO UPDATE SET role = 'user';
  ELSE
    UPDATE public.profiles SET role = 'user' WHERE email = 'cliente@dealvoy.com';
    UPDATE auth.users SET raw_user_meta_data = '{"name": "Cliente Teste", "role": "user"}' WHERE email = 'cliente@dealvoy.com';
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
    ON CONFLICT (id) DO UPDATE SET role = 'affiliate';
    
    INSERT INTO public.affiliate_partners (id, user_id, email, name, status, commission_model, commission_rate)
    VALUES (gen_random_uuid(), new_affiliate_id, 'afiliado@dealvoy.com', 'Afiliado Teste', 'active', 'percentage', 30.0)
    ON CONFLICT (email) DO NOTHING;
  ELSE
    UPDATE public.profiles SET role = 'affiliate' WHERE email = 'afiliado@dealvoy.com';
    UPDATE auth.users SET raw_user_meta_data = '{"name": "Afiliado Teste", "role": "affiliate"}' WHERE email = 'afiliado@dealvoy.com';
  END IF;
END $$;
