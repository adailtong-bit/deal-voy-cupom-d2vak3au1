DO $$
BEGIN
  -- Insert reliable seed URLs to ensure high-quality organic deals
  IF NOT EXISTS (SELECT 1 FROM public.crawler_sources WHERE url = 'https://www.pelando.com.br') THEN
    INSERT INTO public.crawler_sources (name, url, type, status, category, max_results)
    VALUES ('Pelando', 'https://www.pelando.com.br', 'web', 'active', 'Geral', 50);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.crawler_sources WHERE url = 'https://www.promobit.com.br') THEN
    INSERT INTO public.crawler_sources (name, url, type, status, category, max_results)
    VALUES ('Promobit', 'https://www.promobit.com.br', 'web', 'active', 'Geral', 50);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.crawler_sources WHERE url = 'https://www.amazon.com.br/deals') THEN
    INSERT INTO public.crawler_sources (name, url, type, status, category, max_results)
    VALUES ('Amazon Ofertas', 'https://www.amazon.com.br/deals', 'web', 'active', 'Geral', 50);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.crawler_sources WHERE url = 'https://www.mercadolivre.com.br/ofertas') THEN
    INSERT INTO public.crawler_sources (name, url, type, status, category, max_results)
    VALUES ('Mercado Livre Ofertas', 'https://www.mercadolivre.com.br/ofertas', 'web', 'active', 'Geral', 50);
  END IF;

  -- Clean up previously discovered promotions with invalid, broken or missing links
  DELETE FROM public.discovered_promotions 
  WHERE product_link IS NULL 
     OR product_link = '' 
     OR product_link NOT LIKE 'http%'
     OR product_link ILIKE '%duckduckgo.com%'
     OR product_link ILIKE '%bing.com%'
     OR product_link ILIKE '%google.com%';
END $$;
