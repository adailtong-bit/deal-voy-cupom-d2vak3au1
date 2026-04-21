DO $$
BEGIN
  -- Clean up any fictitious/mock offers that might have been created by previous AI steps
  DELETE FROM public.discovered_promotions 
  WHERE title ILIKE '%mock%' 
     OR title ILIKE '%teste%'
     OR title ILIKE '%fictícia%'
     OR title ILIKE '%fictício%'
     OR title ILIKE '%fake%'
     OR title ILIKE '%exemplo%'
     OR description ILIKE '%mock%'
     OR description ILIKE '%teste%';
END $$;
