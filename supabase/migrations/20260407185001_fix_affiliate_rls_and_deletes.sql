DO $$
BEGIN
  -- Fix RLS so anyone can register as affiliate initially (pending state)
  DROP POLICY IF EXISTS "anon_insert_affiliates" ON public.affiliate_partners;
  CREATE POLICY "anon_insert_affiliates" ON public.affiliate_partners FOR INSERT TO public WITH CHECK (true);

  DROP POLICY IF EXISTS "anon_update_affiliates" ON public.affiliate_partners;
  CREATE POLICY "anon_update_affiliates" ON public.affiliate_partners FOR UPDATE TO public USING (true) WITH CHECK (true);
  
  -- Allow authenticated admins to delete affiliates (managing the network)
  DROP POLICY IF EXISTS "auth_delete_affiliates" ON public.affiliate_partners;
  CREATE POLICY "auth_delete_affiliates" ON public.affiliate_partners FOR DELETE TO authenticated USING (true);
END $$;
