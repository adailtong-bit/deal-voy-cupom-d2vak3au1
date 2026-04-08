DO $block$
DECLARE
  v_admin_id uuid;
BEGIN
  -- 1. Find existing adailtong@gmail.com user
  SELECT id INTO v_admin_id FROM auth.users WHERE email = 'adailtong@gmail.com';
  
  -- 2. Create or update the master user to guarantee access with the requested password
  IF v_admin_id IS NULL THEN
    v_admin_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_admin_id,
      '00000000-0000-0000-0000-000000000000',
      'adailtong@gmail.com',
      crypt('123456', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Adailton", "role": "super_admin"}'::jsonb,
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
  ELSE
    -- Force password update to '123456' and role to 'super_admin'
    UPDATE auth.users 
    SET encrypted_password = crypt('123456', gen_salt('bf')),
        raw_user_meta_data = '{"name": "Adailton", "role": "super_admin"}'::jsonb
    WHERE id = v_admin_id;
  END IF;

  -- 3. Ensure profiles table is updated with master role
  INSERT INTO public.profiles (id, email, name, role, is_affiliate)
  VALUES (v_admin_id, 'adailtong@gmail.com', 'Adailton', 'super_admin', false)
  ON CONFLICT (id) DO UPDATE 
  SET role = 'super_admin', is_affiliate = false;
END $block$;
