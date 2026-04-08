DO $$
DECLARE
  master_id uuid;
BEGIN
  -- Seed adailtong@gmail.com se não existir, para garantir login absoluto do Master User
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'adailtong@gmail.com') THEN
    master_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      master_id,
      '00000000-0000-0000-0000-000000000000',
      'adailtong@gmail.com',
      crypt('123456', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Adailton Granado", "role": "super_admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role)
    VALUES (master_id, 'adailtong@gmail.com', 'Adailton Granado', 'super_admin')
    ON CONFLICT (id) DO UPDATE SET role = 'super_admin';
  ELSE
    -- Se existir, garante que a role dele em profiles é super_admin independentemente de triggers
    UPDATE public.profiles 
    SET role = 'super_admin' 
    WHERE email = 'adailtong@gmail.com';
  END IF;

  -- 1. Remove qualquer política de RLS que bloqueie leitura do Master nos perfis
  DROP POLICY IF EXISTS "master_all_profiles" ON public.profiles;
  
  -- 2. Cria a política de prioridade absoluta para leitura/escrita em profiles
  CREATE POLICY "master_all_profiles" ON public.profiles
    FOR ALL TO authenticated
    USING (
      (SELECT email FROM auth.users WHERE id = auth.uid()) = 'adailtong@gmail.com'
      OR role IN ('super_admin', 'admin')
    )
    WITH CHECK (
      (SELECT email FROM auth.users WHERE id = auth.uid()) = 'adailtong@gmail.com'
      OR role IN ('super_admin', 'admin')
    );

  -- 3. Aplica a mesma proteção para visualização dos afiliados
  DROP POLICY IF EXISTS "master_all_affiliates" ON public.affiliate_partners;
  
  CREATE POLICY "master_all_affiliates" ON public.affiliate_partners
    FOR ALL TO authenticated
    USING (
      (SELECT email FROM auth.users WHERE id = auth.uid()) = 'adailtong@gmail.com'
      OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('super_admin', 'admin')
    )
    WITH CHECK (
      (SELECT email FROM auth.users WHERE id = auth.uid()) = 'adailtong@gmail.com'
      OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('super_admin', 'admin')
    );

END $$;
