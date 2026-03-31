import { useState, useEffect } from 'react'
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
import { fetchCrawlerLogs } from '@/lib/api'
import { format } from 'date-fns'
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  Search,
  RefreshCw,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'

export function CrawlerHistoryTab() {
  const { t } = useLanguage()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [logs, setLogs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadLogs = async () => {
    setIsLoading(true)
    try {
      const data = await fetchCrawlerLogs()
      setLogs(data || [])
    } catch (e) {
      setLogs([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadLogs()
  }, [])

  const filteredHistory = logs
    .filter((log) => {
      if (
        search &&
        !log.storeName?.toLowerCase().includes(search.toLowerCase())
      ) {
        return false
      }
      if (statusFilter !== 'all' && log.status !== statusFilter) {
        return false
      }
      return true
    })
    .sort(
      (a, b) =>
        new Date(b.date || a.created).getTime() -
        new Date(a.date || b.created).getTime(),
    )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            {t('common.success', 'Sucesso')}
          </Badge>
        )
      case 'warning':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            <AlertTriangle className="w-3 h-3 mr-1" />
            {t('common.warning', 'Aviso')}
          </Badge>
        )
      case 'error':
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            {t('common.error', 'Erro')}
          </Badge>
        )
      case 'scanning':
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            {t('common.scanning', 'Verificando')}
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-bold">
            {t('franchisee.crawler.history_title', 'Histórico de Buscas')}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t(
              'franchisee.crawler.history_desc',
              'Controle e auditoria das execuções do web crawler.',
            )}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <Button
            variant="outline"
            size="icon"
            onClick={loadLogs}
            disabled={isLoading}
            className="shrink-0"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
            />
          </Button>
          <div className="relative w-full sm:w-[200px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('common.search_store', 'Buscar loja...')}
              className="pl-8 bg-background"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[150px] bg-background">
              <SelectValue placeholder={t('common.status', 'Status')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t('common.all_status', 'Todos os Status')}
              </SelectItem>
              <SelectItem value="success">
                {t('common.success', 'Sucesso')}
              </SelectItem>
              <SelectItem value="warning">
                {t('common.warning', 'Aviso')}
              </SelectItem>
              <SelectItem value="error">{t('common.error', 'Erro')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('common.date', 'Data / Hora')}</TableHead>
              <TableHead>{t('common.store', 'Loja Alvo')}</TableHead>
              <TableHead>{t('common.status', 'Status')}</TableHead>
              <TableHead className="text-right">
                {t('franchisee.crawler.found', 'Encontrados')}
              </TableHead>
              <TableHead className="text-right">
                {t('franchisee.crawler.imported', 'Importados')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredHistory.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="whitespace-nowrap font-medium">
                  {format(
                    new Date(log.date || log.created),
                    'dd/MM/yyyy HH:mm',
                  )}
                </TableCell>
                <TableCell className="font-semibold text-primary">
                  {log.storeName}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span className="w-fit">{getStatusBadge(log.status)}</span>
                    {log.errorMessage && (
                      <span className="text-xs text-red-500 max-w-[250px] truncate">
                        {log.errorMessage}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <span className="font-medium">{log.itemsFound}</span>
                </TableCell>
                <TableCell className="text-right">
                  <span className="font-medium text-green-600">
                    {log.itemsImported}
                  </span>
                </TableCell>
              </TableRow>
            ))}
            {filteredHistory.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                >
                  {t(
                    'common.no_records_found',
                    'Nenhum registro encontrado para estes filtros.',
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
