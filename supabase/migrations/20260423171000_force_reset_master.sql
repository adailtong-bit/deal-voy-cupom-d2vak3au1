DO $$
BEGIN
  -- Force reset password to 123456 and confirm email for adailtong@gmail.com
  -- This bypasses any email confirmation restrictions for the master user
  UPDATE auth.users
  SET 
    encrypted_password = crypt('123456', gen_salt('bf')),
    email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
    raw_user_meta_data = jsonb_set(COALESCE(raw_user_meta_data, '{}'::jsonb), '{role}', '"super_admin"')
  WHERE email = 'adailtong@gmail.com';

  -- Ensure profile has super_admin role
  UPDATE public.profiles
  SET role = 'super_admin'
  WHERE email = 'adailtong@gmail.com';
END $$;
