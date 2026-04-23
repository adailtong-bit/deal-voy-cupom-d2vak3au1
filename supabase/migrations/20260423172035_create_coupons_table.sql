CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    discount TEXT,
    price NUMERIC,
    original_price NUMERIC,
    image_url TEXT,
    store_name TEXT,
    category TEXT,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    latitude NUMERIC,
    longitude NUMERIC,
    location_name TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_coupons" ON public.coupons;
CREATE POLICY "public_read_coupons" ON public.coupons FOR SELECT USING (status = 'active');

DROP POLICY IF EXISTS "auth_insert_coupons" ON public.coupons;
CREATE POLICY "auth_insert_coupons" ON public.coupons FOR INSERT WITH CHECK (auth.uid() = user_id OR EXISTS (
  SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'merchant', 'shopkeeper', 'franchisee')
));

DROP POLICY IF EXISTS "auth_update_coupons" ON public.coupons;
CREATE POLICY "auth_update_coupons" ON public.coupons FOR UPDATE USING (auth.uid() = user_id OR EXISTS (
  SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
));

DROP POLICY IF EXISTS "auth_delete_coupons" ON public.coupons;
CREATE POLICY "auth_delete_coupons" ON public.coupons FOR DELETE USING (auth.uid() = user_id OR EXISTS (
  SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
));

INSERT INTO public.coupons (id, title, description, discount, price, original_price, image_url, store_name, category, start_date, end_date, latitude, longitude, location_name, status)
VALUES 
('c1000000-0000-0000-0000-000000000001'::uuid, '50% Off Burger', 'Delicious burger with fries', '50%', 15.00, 30.00, 'https://img.usecurling.com/p/400/300?q=burger', 'Burger King', 'food', NOW(), NOW() + INTERVAL '30 days', -23.5505, -46.6333, 'São Paulo', 'active'),
('c2000000-0000-0000-0000-000000000002'::uuid, '10% Off Electronics', 'Get the latest smartphone', '10%', 900.00, 1000.00, 'https://img.usecurling.com/p/400/300?q=smartphone', 'Tech Store', 'electronics', NOW(), NOW() + INTERVAL '15 days', -22.9068, -43.1729, 'Rio de Janeiro', 'active'),
('c3000000-0000-0000-0000-000000000003'::uuid, 'Buy 1 Get 1 Free Shoes', 'Running shoes for everyone', 'BOGO', 50.00, 100.00, 'https://img.usecurling.com/p/400/300?q=shoes', 'Shoe Store', 'fashion', NOW(), NOW() + INTERVAL '7 days', -19.9167, -43.9345, 'Belo Horizonte', 'active')
ON CONFLICT (id) DO NOTHING;
