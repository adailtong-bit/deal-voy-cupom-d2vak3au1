CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_email TEXT,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    details TEXT,
    status TEXT DEFAULT 'success',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_read_audit_logs" ON public.audit_logs;
CREATE POLICY "auth_read_audit_logs" ON public.audit_logs FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_audit_logs" ON public.audit_logs;
CREATE POLICY "auth_insert_audit_logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (true);
