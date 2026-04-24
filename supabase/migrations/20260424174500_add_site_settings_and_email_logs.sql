CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_site_settings" ON public.site_settings;
CREATE POLICY "public_read_site_settings" ON public.site_settings
  FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "admin_all_site_settings" ON public.site_settings;
CREATE POLICY "admin_all_site_settings" ON public.site_settings
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')));

INSERT INTO public.site_settings (key, value)
VALUES (
  'footer_content',
  '{"about": "We are a platform dedicated to bringing the best deals and opportunities to our users through geolocation.", "company": "Routevoy Inc. is a technology company focused on connecting local businesses with consumers.", "mission": "Our mission is to empower local commerce and help users save money on their everyday purchases.", "contact": "Email: contact@routevoy.com\nPhone: +1 234 567 8900\nAddress: 123 Tech Street, Suite 456, City, Country"}'::jsonb
) ON CONFLICT (key) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient TEXT NOT NULL,
  subject TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  provider TEXT NOT NULL,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_all_email_logs" ON public.email_logs;
CREATE POLICY "admin_all_email_logs" ON public.email_logs
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')));
