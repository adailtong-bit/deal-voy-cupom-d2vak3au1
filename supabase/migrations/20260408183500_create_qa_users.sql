DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- 1. Garantir Usuário Lojista (Teste)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'lojista@dealvoy.com') THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_user_id, '00000000-0000-0000-0000-000000000000', 'lojista@dealvoy.com',
      crypt('Skip@Pass', gen_salt('bf')), NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}', '{"name": "Lojista (Teste)", "role": "shopkeeper"}',
      false, 'authenticated', 'authenticated', '', '', '', '', '', NULL, '', '', ''
    );
    INSERT INTO public.profiles (id, email, name, role) 
    VALUES (new_user_id, 'lojista@dealvoy.com', 'Lojista (Teste)', 'shopkeeper') 
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- 2. Garantir Usuário Franqueado (Teste)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'franqueado@dealvoy.com') THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_user_id, '00000000-0000-0000-0000-000000000000', 'franqueado@dealvoy.com',
      crypt('Skip@Pass', gen_salt('bf')), NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}', '{"name": "Franqueado (Teste)", "role": "franchisee"}',
      false, 'authenticated', 'authenticated', '', '', '', '', '', NULL, '', '', ''
    );
    INSERT INTO public.profiles (id, email, name, role) 
    VALUES (new_user_id, 'franqueado@dealvoy.com', 'Franqueado (Teste)', 'franchisee') 
    ON CONFLICT (id) DO NOTHING;
  END IF;
  
  -- 3. Forçar a atualização das senhas e metadados caso os usuários já existissem mas estivessem corrompidos
  UPDATE auth.users 
  SET 
    encrypted_password = crypt('Skip@Pass', gen_salt('bf')),
    raw_user_meta_data = '{"name": "Lojista (Teste)", "role": "shopkeeper"}'::jsonb
  WHERE email = 'lojista@dealvoy.com';

  UPDATE public.profiles SET role = 'shopkeeper' WHERE email = 'lojista@dealvoy.com';

  UPDATE auth.users 
  SET 
    encrypted_password = crypt('Skip@Pass', gen_salt('bf')),
    raw_user_meta_data = '{"name": "Franqueado (Teste)", "role": "franchisee"}'::jsonb
  WHERE email = 'franqueado@dealvoy.com';

  UPDATE public.profiles SET role = 'franchisee' WHERE email = 'franqueado@dealvoy.com';

END $$;
