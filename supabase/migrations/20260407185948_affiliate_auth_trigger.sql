DO $DO$
BEGIN
  -- 1. Function to auto-confirm email (so user can login immediately)
  CREATE OR REPLACE FUNCTION public.handle_new_user_before()
  RETURNS trigger AS $FUNC$
  BEGIN
    NEW.email_confirmed_at := COALESCE(NEW.email_confirmed_at, NOW());
    RETURN NEW;
  END;
  $FUNC$ LANGUAGE plpgsql SECURITY DEFINER;

  DROP TRIGGER IF EXISTS on_auth_user_created_before ON auth.users;
  CREATE TRIGGER on_auth_user_created_before
    BEFORE INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_before();

  -- 2. Function to auto-create affiliate profile
  CREATE OR REPLACE FUNCTION public.handle_new_user_after()
  RETURNS trigger AS $FUNC$
  BEGIN
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
  $FUNC$ LANGUAGE plpgsql SECURITY DEFINER;

  DROP TRIGGER IF EXISTS on_auth_user_created_after ON auth.users;
  CREATE TRIGGER on_auth_user_created_after
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_after();

END $DO$;
