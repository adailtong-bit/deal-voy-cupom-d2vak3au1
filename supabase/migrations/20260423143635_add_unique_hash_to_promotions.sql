-- Adiciona a coluna unique_hash para de-duplicação de ofertas baseada em link, titulo e valor
ALTER TABLE public.discovered_promotions ADD COLUMN IF NOT EXISTS unique_hash TEXT;

-- Cria um índice único para garantir que não haja duplicidade a nível de banco de dados
-- O WHERE unique_hash IS NOT NULL permite que ofertas legadas fiquem sem hash caso não sejam retroativamente processadas
CREATE UNIQUE INDEX IF NOT EXISTS discovered_promotions_unique_hash_idx 
ON public.discovered_promotions (unique_hash) 
WHERE unique_hash IS NOT NULL;
