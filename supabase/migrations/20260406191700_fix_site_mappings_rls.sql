DO $$
BEGIN
    -- Allow public access to site_mappings so mapping wizard works and fetches correctly even if user is anon
    DROP POLICY IF EXISTS "public_all_site_mappings" ON public.site_mappings;
    CREATE POLICY "public_all_site_mappings" ON public.site_mappings
        FOR ALL TO public USING (true) WITH CHECK (true);
        
    -- Ensure crawler logs can be written/read to debug blockages
    DROP POLICY IF EXISTS "public_all_crawler_logs" ON public.crawler_logs;
    CREATE POLICY "public_all_crawler_logs" ON public.crawler_logs
        FOR ALL TO public USING (true) WITH CHECK (true);
        
    -- Ensure discovered promotions can be fetched seamlessly
    DROP POLICY IF EXISTS "public_all_discovered_promotions" ON public.discovered_promotions;
    CREATE POLICY "public_all_discovered_promotions" ON public.discovered_promotions
        FOR ALL TO public USING (true) WITH CHECK (true);
        
    -- Ensure crawler sources can be written/read
    DROP POLICY IF EXISTS "public_all_crawler_sources" ON public.crawler_sources;
    CREATE POLICY "public_all_crawler_sources" ON public.crawler_sources
        FOR ALL TO public USING (true) WITH CHECK (true);
END $$;
