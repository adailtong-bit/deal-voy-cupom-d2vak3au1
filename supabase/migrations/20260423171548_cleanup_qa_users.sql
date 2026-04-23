DO $$
BEGIN
  -- Delete test users from auth.users (cascade will delete them from profiles, affiliate_partners, etc.)
  DELETE FROM auth.users 
  WHERE email IN (
    'franqueado@dealvoy.com',
    'vendor@dealvoy.com',
    'cliente@dealvoy.com',
    'afiliado@dealvoy.com'
  );
  
  -- Also ensure adailtong@gmail.com has super_admin role explicitly
  UPDATE public.profiles
  SET role = 'super_admin'
  WHERE email = 'adailtong@gmail.com';
END $$;
