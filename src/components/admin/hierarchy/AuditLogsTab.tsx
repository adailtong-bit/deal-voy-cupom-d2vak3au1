import { useState } from 'react'
import { useCouponStore } from '@/stores/CouponContext'
import { useLanguage } from '@/stores/LanguageContext'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

export function AuditLogsTab() {
  const { systemLogs } = useCouponStore()
  const { locale, t } = useLanguage()
  const [search, setSearch] = useState('')

  const filtered = systemLogs.filter(
    (log) =>
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase()) ||
      log.user.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-card p-4 rounded-lg border gap-4">
        <div>
          <h3 className="text-lg font-bold">
            {t('admin.hierarchy.audit_title', 'System Audit Logs')}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t(
              'admin.hierarchy.audit_desc',
              'Track user actions, creations, edits, and deletions across the platform.',
            )}
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('common.search', 'Search...')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                {t('admin.hierarchy.timestamp', 'Timestamp')}
              </TableHead>
              <TableHead>
                {t('admin.hierarchy.user', 'User / Entity')}
              </TableHead>
              <TableHead>{t('admin.hierarchy.action', 'Action')}</TableHead>
              <TableHead>{t('admin.hierarchy.details', 'Details')}</TableHead>
              <TableHead>{t('admin.status', 'Status')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.slice(0, 50).map((log) => (
              <TableRow key={log.id}>
                <TableCell className="text-xs whitespace-nowrap">
                  {new Date(log.date).toLocaleString(locale)}
                </TableCell>
                <TableCell className="font-mono text-xs">{log.user}</TableCell>
                <TableCell className="font-medium">{log.action}</TableCell>
                <TableCell
                  className="text-sm text-muted-foreground max-w-[300px] truncate"
                  title={log.details}
                >
                  {log.details}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      log.status === 'success'
                        ? 'default'
                        : log.status === 'warning'
                          ? 'secondary'
                          : 'destructive'
                    }
                  >
                    {log.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                >
                  {t('common.none', 'No logs found.')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
