DO $$
DECLARE
  adv_id uuid := '00000000-0000-0000-0000-000000000001'::uuid;
  adv_id_2 uuid := '00000000-0000-0000-0000-000000000002'::uuid;
BEGIN
  -- Insert default advertisers safely
  INSERT INTO public.ad_advertisers (id, company_name, contact_name, email, status)
  VALUES 
    (adv_id, 'Routevoy (Parceiro Interno)', 'Administração', 'admin@routevoy.com', 'active'),
    (adv_id_2, 'Anunciante Demonstração', 'Cliente', 'anunciante@exemplo.com', 'active')
  ON CONFLICT (id) DO NOTHING;

  -- Seed an initial ad campaign to ensure dashboard is not entirely empty
  INSERT INTO public.ad_campaigns (
    id, title, company_id, advertiser_id, region, category, billing_type, placement, 
    status, views, clicks, start_date, end_date, image, link, price, currency
  ) VALUES (
    '00000000-0000-0000-0000-000000000003'::uuid,
    'Oferta Especial de Lançamento',
    'admin_created',
    adv_id::text,
    'Global',
    'all',
    'fixed',
    'top',
    'active',
    0,
    0,
    NOW(),
    NOW() + INTERVAL '30 days',
    'https://img.usecurling.com/p/800/200?q=banner',
    'https://routevoy.com',
    150.0,
    'BRL'
  ) ON CONFLICT (id) DO NOTHING;
END $$;
