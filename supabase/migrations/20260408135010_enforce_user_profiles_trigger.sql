-- Make sure the trigger and function exist and are properly defined

CREATE OR REPLACE FUNCTION public.handle_new_user_after()
RETURNS trigger AS $function$
BEGIN
  -- 1. Insert into profiles with robust coalescing
  INSERT INTO public.profiles (id, email, name, role, is_affiliate)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    (NEW.raw_user_meta_data->>'role' = 'affiliate')
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, public.profiles.name),
    role = COALESCE(EXCLUDED.role, public.profiles.role),
    is_affiliate = COALESCE(EXCLUDED.is_affiliate, public.profiles.is_affiliate);

  -- 2. Insert into affiliate_partners if affiliate
  IF NEW.raw_user_meta_data->>'role' = 'affiliate' THEN
    INSERT INTO public.affiliate_partners (id, user_id, email, name, status)
    VALUES (
      gen_random_uuid(),
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
      'pending'
    )
    ON CONFLICT (email) DO UPDATE 
    SET user_id = EXCLUDED.user_id;
  END IF;

  RETURN NEW;
END;
$function$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if it already exists to replace it cleanly
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_after();
  
-- Also make sure the admin user exists in profiles and auth.users
DO $block$
DECLARE
  v_admin_id uuid;
BEGIN
  -- Check for existing admin
  SELECT id INTO v_admin_id FROM auth.users WHERE email = 'adailtong@gmail.com';
  
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
      crypt('Skip@Pass123', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Adailton", "role": "admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
  END IF;

  -- Ensure profile exists
  INSERT INTO public.profiles (id, email, name, role, is_affiliate)
  VALUES (v_admin_id, 'adailtong@gmail.com', 'Adailton', 'admin', false)
  ON CONFLICT (id) DO UPDATE 
  SET role = 'admin', is_affiliate = false;
END $block$;
