ALTER TABLE public.franchises 
ADD COLUMN IF NOT EXISTS coverage_scope TEXT DEFAULT 'national',
ADD COLUMN IF NOT EXISTS coverage_states JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS coverage_cities JSONB DEFAULT '[]'::jsonb;
