ALTER TABLE public.ad_advertisers ADD COLUMN IF NOT EXISTS tax_id TEXT;
ALTER TABLE public.ad_advertisers ADD COLUMN IF NOT EXISTS street TEXT;
ALTER TABLE public.ad_advertisers ADD COLUMN IF NOT EXISTS address_number TEXT;
ALTER TABLE public.ad_advertisers ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.ad_advertisers ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE public.ad_advertisers ADD COLUMN IF NOT EXISTS zip TEXT;
