DO $$
DECLARE
  u_email TEXT;
  target_emails TEXT[] := ARRAY[
    'adailtong@gmail.com',
    'vendor@dealvoy.com',
    'cliente@dealvoy.com',
    'afiliado@dealvoy.com',
    'franqueado@dealvoy.com'
  ];
BEGIN
  -- 1. Remover usuários de teste existentes para limpar qualquer sujeira
  FOREACH u_email IN ARRAY target_emails
  LOOP
    DELETE FROM auth.users WHERE email = u_email;
  END LOOP;
END $$;

DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- 2. Recriar Admin Master
  new_user_id := gen_random_uuid();
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
    is_super_admin, role, aud,
    confirmation_token, recovery_token, email_change_token_new,
    email_change, email_change_token_current,
    phone, phone_change, phone_change_token, reauthentication_token
  ) VALUES (
    new_user_id, '00000000-0000-0000-0000-000000000000', 'adailtong@gmail.com', crypt('Skip@Pass', gen_salt('bf')), NOW(), NOW(), NOW(),
    '{"provider": "email", "providers": ["email"]}', '{"name": "Admin Master", "role": "super_admin"}',
    false, 'authenticated', 'authenticated', '', '', '', '', '', NULL, '', '', ''
  );
  INSERT INTO public.profiles (id, email, name, role) VALUES (new_user_id, 'adailtong@gmail.com', 'Admin Master', 'super_admin') ON CONFLICT (id) DO UPDATE SET role = 'super_admin';

  -- 3. Recriar Lojista
  new_user_id := gen_random_uuid();
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
    is_super_admin, role, aud,
    confirmation_token, recovery_token, email_change_token_new,
    email_change, email_change_token_current,
    phone, phone_change, phone_change_token, reauthentication_token
  ) VALUES (
    new_user_id, '00000000-0000-0000-0000-000000000000', 'vendor@dealvoy.com', crypt('Skip@Pass', gen_salt('bf')), NOW(), NOW(), NOW(),
    '{"provider": "email", "providers": ["email"]}', '{"name": "Lojista Teste", "role": "shopkeeper"}',
    false, 'authenticated', 'authenticated', '', '', '', '', '', NULL, '', '', ''
  );
  INSERT INTO public.profiles (id, email, name, role) VALUES (new_user_id, 'vendor@dealvoy.com', 'Lojista Teste', 'shopkeeper') ON CONFLICT (id) DO UPDATE SET role = 'shopkeeper';

  -- 4. Recriar Cliente
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
    false, 'authenticated', 'authenticated', '', '', '', '', '', NULL, '', '', ''
  );
  INSERT INTO public.profiles (id, email, name, role) VALUES (new_user_id, 'cliente@dealvoy.com', 'Cliente Teste', 'user') ON CONFLICT (id) DO UPDATE SET role = 'user';

  -- 5. Recriar Afiliado
  new_user_id := gen_random_uuid();
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
    is_super_admin, role, aud,
    confirmation_token, recovery_token, email_change_token_new,
    email_change, email_change_token_current,
    phone, phone_change, phone_change_token, reauthentication_token
  ) VALUES (
    new_user_id, '00000000-0000-0000-0000-000000000000', 'afiliado@dealvoy.com', crypt('Skip@Pass', gen_salt('bf')), NOW(), NOW(), NOW(),
    '{"provider": "email", "providers": ["email"]}', '{"name": "Afiliado Teste", "role": "affiliate"}',
    false, 'authenticated', 'authenticated', '', '', '', '', '', NULL, '', '', ''
  );
  INSERT INTO public.profiles (id, email, name, role, is_affiliate) VALUES (new_user_id, 'afiliado@dealvoy.com', 'Afiliado Teste', 'affiliate', true) ON CONFLICT (id) DO UPDATE SET role = 'affiliate', is_affiliate = true;

  -- 6. Recriar Franqueado
  new_user_id := gen_random_uuid();
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
    is_super_admin, role, aud,
    confirmation_token, recovery_token, email_change_token_new,
    email_change, email_change_token_current,
    phone, phone_change, phone_change_token, reauthentication_token
  ) VALUES (
    new_user_id, '00000000-0000-0000-0000-000000000000', 'franqueado@dealvoy.com', crypt('Skip@Pass', gen_salt('bf')), NOW(), NOW(), NOW(),
    '{"provider": "email", "providers": ["email"]}', '{"name": "Franqueado Teste", "role": "franchisee"}',
    false, 'authenticated', 'authenticated', '', '', '', '', '', NULL, '', '', ''
  );
  INSERT INTO public.profiles (id, email, name, role) VALUES (new_user_id, 'franqueado@dealvoy.com', 'Franqueado Teste', 'franchisee') ON CONFLICT (id) DO UPDATE SET role = 'franchisee';

END $$;
