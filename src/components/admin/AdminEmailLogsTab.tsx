import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { supabase } from '@/lib/supabase/client'
import { Loader2, Mail } from 'lucide-react'
import { format } from 'date-fns'
import { useLanguage } from '@/stores/LanguageContext'

export function AdminEmailLogsTab() {
  const { t } = useLanguage()
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLogs = async () => {
      const { data } = await supabase
        .from('email_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (data) setLogs(data)
      setLoading(false)
    }
    fetchLogs()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-slate-500" />
          <CardTitle>
            {t('admin.emails_logs.title', 'Sent Emails Report')}
          </CardTitle>
        </div>
        <CardDescription>
          {t(
            'admin.emails_logs.desc',
            'Track the history of communications sent by the platform to users.',
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            {t('admin.emails_logs.empty', 'No emails recorded yet.')}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-md border border-slate-200">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">
                    {t('admin.emails_logs.date', 'Date')}
                  </th>
                  <th className="px-4 py-3">
                    {t('admin.emails_logs.recipient', 'Recipient')}
                  </th>
                  <th className="px-4 py-3">
                    {t('admin.emails_logs.subject', 'Subject')}
                  </th>
                  <th className="px-4 py-3">
                    {t('admin.emails_logs.type', 'Type')}
                  </th>
                  <th className="px-4 py-3">
                    {t('admin.emails_logs.status', 'Status')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                      {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm')}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-700">
                      {log.recipient}
                    </td>
                    <td
                      className="px-4 py-3 max-w-[250px] truncate text-slate-600"
                      title={log.subject}
                    >
                      {log.subject}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-[10px] font-semibold text-slate-600">
                        {log.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {log.status === 'success' ? (
                        <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-800 border border-emerald-200">
                          {t('admin.emails_logs.sent', 'Sent')}
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-semibold text-red-800 border border-red-200 cursor-help"
                          title={
                            log.error_message ||
                            t('admin.emails_logs.error', 'Sending error')
                          }
                        >
                          {t('admin.emails_logs.failed', 'Failed')}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
