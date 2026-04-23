import { supabase } from '@/lib/supabase/client'

export const logAudit = async (
  action: string,
  entityType: string,
  entityId: string,
  details: string,
  userEmail?: string | null,
) => {
  try {
    const { error } = await supabase.from('audit_logs').insert([
      {
        action,
        entity_type: entityType,
        entity_id: entityId,
        details,
        user_email: userEmail || 'unknown',
      },
    ])

    if (error) {
      console.error('Failed to insert audit log', error)
    }
  } catch (e) {
    console.error('Audit log exception', e)
  }
}

export const fetchAuditLogs = async () => {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    console.error('Error fetching audit logs', error)
    throw error
  }

  // Transform to match UI expectations
  return data.map((log) => ({
    id: log.id,
    date: log.created_at,
    user: log.user_email,
    action: log.action,
    details: log.details,
    status: log.status,
  }))
}
