-- Fix RLS for profiles and affiliates to allow Adailton (Master) full access
DO $$
BEGIN
  -- Drop existing policies if needed to replace them
  DROP POLICY IF EXISTS "master_all_profiles" ON public.profiles;
  DROP POLICY IF EXISTS "master_all_affiliates" ON public.affiliate_partners;
END $$;

-- Create policy for profiles
CREATE POLICY "master_all_profiles" ON public.profiles
  FOR ALL TO authenticated
  USING (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'adailtong@gmail.com'
    OR role = 'super_admin'
    OR role = 'admin'
  )
  WITH CHECK (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'adailtong@gmail.com'
    OR role = 'super_admin'
    OR role = 'admin'
  );

-- Create policy for affiliate_partners
CREATE POLICY "master_all_affiliates" ON public.affiliate_partners
  FOR ALL TO authenticated
  USING (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'adailtong@gmail.com'
    OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
    OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'adailtong@gmail.com'
    OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
    OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );
