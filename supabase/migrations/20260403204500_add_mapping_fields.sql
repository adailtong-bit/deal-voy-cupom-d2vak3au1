ALTER TABLE public.discovered_promotions
ADD COLUMN IF NOT EXISTS campaign_name TEXT,
ADD COLUMN IF NOT EXISTS coverage TEXT DEFAULT 'toda a rede',
ADD COLUMN IF NOT EXISTS discount_rules TEXT DEFAULT 'percentual';
