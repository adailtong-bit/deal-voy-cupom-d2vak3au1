-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'user',
  is_affiliate BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow reading all profiles
DROP POLICY IF EXISTS "public_read_profiles" ON public.profiles;
CREATE POLICY "public_read_profiles" ON public.profiles FOR SELECT USING (true);

-- Allow updates by the user
DROP POLICY IF EXISTS "auth_update_profiles" ON public.profiles;
CREATE POLICY "auth_update_profiles" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Create or replace the handle_new_user_after trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user_after()
RETURNS trigger AS $function$
BEGIN
  -- 1. Insert into profiles
  INSERT INTO public.profiles (id, email, name, role, is_affiliate)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    (NEW.raw_user_meta_data->>'role' = 'affiliate')
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    is_affiliate = EXCLUDED.is_affiliate;

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
    SET user_id = EXCLUDED.user_id, name = EXCLUDED.name;
  END IF;

  RETURN NEW;
END;
$function$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_after();

-- Backfill existing users into profiles
DO $$
DECLARE
  u record;
BEGIN
  FOR u IN SELECT * FROM auth.users LOOP
    INSERT INTO public.profiles (id, email, name, role, is_affiliate)
    VALUES (
      u.id,
      u.email,
      u.raw_user_meta_data->>'name',
      COALESCE(u.raw_user_meta_data->>'role', 'user'),
      (u.raw_user_meta_data->>'role' = 'affiliate')
    )
    ON CONFLICT (id) DO NOTHING;
  END LOOP;
END $$;
