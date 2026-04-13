DO $$
BEGIN
  -- Add new columns for merchant campaigns into discovered_promotions
  ALTER TABLE public.discovered_promotions ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ;
  ALTER TABLE public.discovered_promotions ADD COLUMN IF NOT EXISTS end_date TIMESTAMPTZ;
  ALTER TABLE public.discovered_promotions ADD COLUMN IF NOT EXISTS limit_type TEXT;
  ALTER TABLE public.discovered_promotions ADD COLUMN IF NOT EXISTS total_limit INTEGER;
  ALTER TABLE public.discovered_promotions ADD COLUMN IF NOT EXISTS enable_proximity_alerts BOOLEAN DEFAULT false;
  ALTER TABLE public.discovered_promotions ADD COLUMN IF NOT EXISTS alert_radius NUMERIC;
  ALTER TABLE public.discovered_promotions ADD COLUMN IF NOT EXISTS is_seasonal BOOLEAN DEFAULT false;
  ALTER TABLE public.discovered_promotions ADD COLUMN IF NOT EXISTS enable_trigger BOOLEAN DEFAULT false;
  ALTER TABLE public.discovered_promotions ADD COLUMN IF NOT EXISTS trigger_type TEXT;
  ALTER TABLE public.discovered_promotions ADD COLUMN IF NOT EXISTS trigger_threshold NUMERIC;
  ALTER TABLE public.discovered_promotions ADD COLUMN IF NOT EXISTS reward_id TEXT;
  ALTER TABLE public.discovered_promotions ADD COLUMN IF NOT EXISTS company_id TEXT;

  -- Ensure RLS policies exist and allow authenticated inserts
  DROP POLICY IF EXISTS "auth_insert_promotions" ON public.discovered_promotions;
  CREATE POLICY "auth_insert_promotions" ON public.discovered_promotions
    FOR INSERT TO authenticated WITH CHECK (true);

  DROP POLICY IF EXISTS "auth_update_promotions" ON public.discovered_promotions;
  CREATE POLICY "auth_update_promotions" ON public.discovered_promotions
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
END $$;
