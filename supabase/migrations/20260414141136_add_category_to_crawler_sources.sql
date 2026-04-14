ALTER TABLE public.crawler_sources ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.crawler_sources ADD COLUMN IF NOT EXISTS max_results INTEGER DEFAULT 200;

DROP POLICY IF EXISTS "auth_all_sources" ON public.crawler_sources;
CREATE POLICY "auth_all_sources" ON public.crawler_sources
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
