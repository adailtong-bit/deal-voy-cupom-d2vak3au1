ALTER TABLE public.affiliate_partners ADD COLUMN IF NOT EXISTS tax_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tax_id TEXT;

CREATE OR REPLACE FUNCTION public.handle_new_user_after()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- 1. Insert into profiles with robust coalescing
  INSERT INTO public.profiles (id, email, name, role, is_affiliate, tax_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    (NEW.raw_user_meta_data->>'role' = 'affiliate'),
    NEW.raw_user_meta_data->>'tax_id'
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, public.profiles.name),
    role = COALESCE(EXCLUDED.role, public.profiles.role),
    is_affiliate = COALESCE(EXCLUDED.is_affiliate, public.profiles.is_affiliate),
    tax_id = COALESCE(EXCLUDED.tax_id, public.profiles.tax_id);

  -- 2. Insert into affiliate_partners if affiliate
  IF NEW.raw_user_meta_data->>'role' = 'affiliate' THEN
    INSERT INTO public.affiliate_partners (id, user_id, email, name, status, tax_id)
    VALUES (
      gen_random_uuid(),
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
      'pending',
      NEW.raw_user_meta_data->>'tax_id'
    )
    ON CONFLICT (email) DO UPDATE 
    SET user_id = EXCLUDED.user_id,
        tax_id = COALESCE(EXCLUDED.tax_id, public.affiliate_partners.tax_id);
  END IF;

  RETURN NEW;
END;
$function$;
