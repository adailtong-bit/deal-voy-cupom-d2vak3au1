import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  FileText,
  Plus,
  CheckCircle,
  Clock,
  Send,
  AlertCircle,
  XCircle,
  Download,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useLanguage } from '@/stores/LanguageContext'
import { useRegionFormatting } from '@/hooks/useRegionFormatting'
import { useCouponStore } from '@/stores/CouponContext'

export function PartnerBillingTab({ franchiseId }: { franchiseId?: string }) {
  const { t } = useLanguage()
  const {
    partnerInvoices,
    updatePartnerInvoiceStatus,
    companies,
    generatePartnerInvoice,
    franchises,
  } = useCouponStore()
  const [searchParams, setSearchParams] = useSearchParams()
  const searchQuery = (searchParams.get('q') || '').toLowerCase()

  const [periodFilter, setPeriodFilter] = useState('all')

  const franchise = franchises.find((f) => f.id === franchiseId)
  const { formatCurrency, formatShortDate } = useRegionFormatting(
    franchise?.region,
  )

  const displayCompanies = franchiseId
    ? companies.filter((c) => c.franchiseId === franchiseId)
    : companies
  const companyIds = displayCompanies.map((c) => c.id)

  const getCompanyName = (id: string) =>
    displayCompanies.find((c) => c.id === id)?.name || id

  const now = new Date()

  const displayInvoices = (
    franchiseId
      ? partnerInvoices.filter((i) => companyIds.includes(i.companyId))
      : partnerInvoices
  )
    .filter((i) => {
      if (!searchQuery) return true
      const compName = getCompanyName(i.companyId).toLowerCase()
      return (
        compName.includes(searchQuery) ||
        i.referenceNumber.toLowerCase().includes(searchQuery)
      )
    })
    .filter((i) => {
      if (periodFilter === 'all') return true
      const date = new Date(i.issueDate || i.periodStart)
      if (periodFilter === 'month') {
        return (
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()
        )
      }
      if (periodFilter === 'quarter') {
        return (
          Math.floor(date.getMonth() / 3) === Math.floor(now.getMonth() / 3) &&
          date.getFullYear() === now.getFullYear()
        )
      }
      if (periodFilter === 'semester') {
        return (
          Math.floor(date.getMonth() / 6) === Math.floor(now.getMonth() / 6) &&
          date.getFullYear() === now.getFullYear()
        )
      }
      if (periodFilter === 'year') {
        return date.getFullYear() === now.getFullYear()
      }
      return true
    })

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newInvoice, setNewInvoice] = useState({
    companyId: '',
    periodStart: '',
    periodEnd: '',
  })

  const handleCreate = () => {
    generatePartnerInvoice(
      newInvoice.companyId,
      newInvoice.periodStart,
      newInvoice.periodEnd,
    )
    setIsDialogOpen(false)
    setNewInvoice({ companyId: '', periodStart: '', periodEnd: '' })
  }

  const updateStatus = (id: string, newStatus: any) => {
    updatePartnerInvoiceStatus(id, newStatus)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <Badge className="bg-green-500 hover:bg-green-600 text-white">
            <CheckCircle className="mr-1 h-3 w-3" /> {t('admin.paid', 'Pago')}
          </Badge>
        )
      case 'pending':
      case 'sent':
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">
            <Clock className="mr-1 h-3 w-3" /> {t('admin.pending', 'Pendente')}
          </Badge>
        )
      case 'overdue':
        return (
          <Badge className="bg-red-500 hover:bg-red-600 text-white">
            <AlertCircle className="mr-1 h-3 w-3" />{' '}
            {t('admin.overdue', 'Atrasado')}
          </Badge>
        )
      case 'canceled':
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" />{' '}
            {t('admin.canceled', 'Cancelado')}
          </Badge>
        )
      case 'draft':
      default:
        return (
          <Badge variant="secondary">
            <FileText className="mr-1 h-3 w-3" /> {t('admin.draft', 'Rascunho')}
          </Badge>
        )
    }
  }

  const paidAmount = displayInvoices
    .filter((i) => i.status === 'paid')
    .reduce((acc, i) => acc + i.totalCommission, 0)
  const pendingAmount = displayInvoices
    .filter(
      (i) =>
        i.status === 'pending' || i.status === 'sent' || i.status === 'overdue',
    )
    .reduce((acc, i) => acc + i.totalCommission, 0)
  const draftAmount = displayInvoices
    .filter((i) => i.status === 'draft')
    .reduce((acc, i) => acc + i.totalCommission, 0)

  const exportInvoices = (standard: 'BR' | 'US' | 'Global') => {
    let csvContent = ''
    if (standard === 'BR') {
      csvContent = 'ID,Parceiro,Período Inicio,Período Fim,Valor (R$),Status\n'
      csvContent += displayInvoices
        .map(
          (i) =>
            `"${i.referenceNumber}","${getCompanyName(i.companyId)}",${formatShortDate(i.periodStart)},${formatShortDate(i.periodEnd)},${i.totalCommission.toFixed(2).replace('.', ',')},${t(`admin.${i.status}`, i.status)}`,
        )
        .join('\n')
    } else if (standard === 'US') {
      csvContent = 'ID,Partner,Period Start,Period End,Amount (USD),Status\n'
      csvContent += displayInvoices
        .map(
          (i) =>
            `"${i.referenceNumber}","${getCompanyName(i.companyId)}",${new Date(i.periodStart).toLocaleDateString('en-US')},${new Date(i.periodEnd).toLocaleDateString('en-US')},${i.totalCommission.toFixed(2)},${i.status}`,
        )
        .join('\n')
    } else {
      csvContent = 'ID,Partner,Period Start,Period End,Amount,Status\n'
      csvContent += displayInvoices
        .map(
          (i) =>
            `"${i.referenceNumber}","${getCompanyName(i.companyId)}",${i.periodStart.split('T')[0]},${i.periodEnd.split('T')[0]},${i.totalCommission.toFixed(2)},${i.status}`,
        )
        .join('\n')
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', `invoices_${standard}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6 animate-fade-in-up w-full max-w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 min-w-0">
        <h2 className="text-xl font-semibold tracking-tight truncate">
          {t('admin.invoices', 'Faturas e Cobranças')}
        </h2>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Input
            placeholder={t('common.search', 'Buscar...')}
            value={searchQuery}
            onChange={(e) =>
              setSearchParams((prev) => {
                if (e.target.value) prev.set('q', e.target.value)
                else prev.delete('q')
                return prev
              })
            }
            className="w-full md:w-[150px]"
          />
          <Select value={periodFilter} onValueChange={setPeriodFilter}>
            <SelectTrigger className="w-[140px] bg-white">
              <SelectValue placeholder={t('admin.period', 'Período')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t('filter.all_time', 'Todo o período')}
              </SelectItem>
              <SelectItem value="month">
                {t('filter.this_month', 'Este Mês')}
              </SelectItem>
              <SelectItem value="quarter">
                {t('filter.this_quarter', 'Este Trimestre')}
              </SelectItem>
              <SelectItem value="semester">
                {t('filter.this_semester', 'Este Semestre')}
              </SelectItem>
              <SelectItem value="year">
                {t('filter.this_year', 'Este Ano')}
              </SelectItem>
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="shrink-0 w-full sm:w-auto">
                <Download className="mr-2 h-4 w-4" />
                {t('common.export', 'Exportar')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => exportInvoices('BR')}>
                Padrão BR (ERP)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportInvoices('US')}>
                Padrão US (GAAP)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportInvoices('Global')}>
                Padrão Global (IFRS)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            onClick={() => setIsDialogOpen(true)}
            className="shrink-0 w-full sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            {t('admin.createInvoice', 'Nova Fatura')}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 min-w-0">
        <Card className="min-w-0 overflow-hidden">
          <CardHeader className="pb-2 min-w-0">
            <CardTitle className="text-sm font-medium text-muted-foreground truncate">
              {t('admin.paid', 'Pago')}
            </CardTitle>
          </CardHeader>
          <CardContent className="min-w-0">
            <div className="text-2xl font-bold text-green-600 truncate">
              {formatCurrency(paidAmount)}
            </div>
          </CardContent>
        </Card>
        <Card className="min-w-0 overflow-hidden">
          <CardHeader className="pb-2 min-w-0">
            <CardTitle className="text-sm font-medium text-muted-foreground truncate">
              {t('admin.pending', 'Pendente (A Receber)')}
            </CardTitle>
          </CardHeader>
          <CardContent className="min-w-0">
            <div className="text-2xl font-bold text-yellow-600 truncate">
              {formatCurrency(pendingAmount)}
            </div>
          </CardContent>
        </Card>
        <Card className="min-w-0 overflow-hidden">
          <CardHeader className="pb-2 min-w-0">
            <CardTitle className="text-sm font-medium text-muted-foreground truncate">
              {t('admin.draft', 'Rascunho')}
            </CardTitle>
          </CardHeader>
          <CardContent className="min-w-0">
            <div className="text-2xl font-bold text-muted-foreground truncate">
              {formatCurrency(draftAmount)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="min-w-0 w-full overflow-hidden">
        <CardContent className="p-0 overflow-x-auto w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">ID</TableHead>
                <TableHead className="whitespace-nowrap">
                  {t('admin.partner', 'Parceiro')}
                </TableHead>
                <TableHead className="whitespace-nowrap">
                  {t('admin.period', 'Período')}
                </TableHead>
                <TableHead className="whitespace-nowrap">
                  {t('admin.amount', 'Valor')}
                </TableHead>
                <TableHead className="whitespace-nowrap">
                  {t('admin.status', 'Status')}
                </TableHead>
                <TableHead className="text-right whitespace-nowrap">
                  {t('admin.action', 'Ação')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium text-xs whitespace-nowrap">
                    {invoice.referenceNumber}
                  </TableCell>
                  <TableCell
                    className="whitespace-nowrap max-w-[150px] truncate"
                    title={getCompanyName(invoice.companyId)}
                  >
                    {getCompanyName(invoice.companyId)}
                  </TableCell>
                  <TableCell className="text-xs whitespace-nowrap">
                    {formatShortDate(invoice.periodStart)} -{' '}
                    {formatShortDate(invoice.periodEnd)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap font-medium">
                    {formatCurrency(invoice.totalCommission)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {getStatusBadge(invoice.status)}
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <div className="flex justify-end gap-2">
                      {invoice.status === 'draft' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateStatus(invoice.id, 'pending')}
                        >
                          <Send className="w-3 h-3 mr-1" />
                          {t('admin.send', 'Enviar')}
                        </Button>
                      )}
                      {(invoice.status === 'pending' ||
                        invoice.status === 'sent' ||
                        invoice.status === 'overdue') && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600 border-green-200 hover:bg-green-50"
                          onClick={() => updateStatus(invoice.id, 'paid')}
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {t('admin.mark_paid', 'Marcar Pago')}
                        </Button>
                      )}
                      {invoice.status !== 'paid' &&
                        invoice.status !== 'canceled' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => updateStatus(invoice.id, 'canceled')}
                            title={t('admin.cancel', 'Cancelar')}
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {displayInvoices.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    {t('common.none', 'Nenhuma fatura encontrada.')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('admin.createInvoice', 'Nova Fatura')}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>{t('admin.partner', 'Parceiro')}</Label>
              <Select
                onValueChange={(v) =>
                  setNewInvoice({ ...newInvoice, companyId: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('admin.partner', 'Parceiro')} />
                </SelectTrigger>
                <SelectContent>
                  {displayCompanies.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('common.start', 'Início')}</Label>
                <Input
                  type="date"
                  value={newInvoice.periodStart}
                  onChange={(e) =>
                    setNewInvoice({
                      ...newInvoice,
                      periodStart: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{t('common.end', 'Fim')}</Label>
                <Input
                  type="date"
                  value={newInvoice.periodEnd}
                  onChange={(e) =>
                    setNewInvoice({ ...newInvoice, periodEnd: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {t('admin.cancel', 'Cancelar')}
            </Button>
            <Button
              onClick={handleCreate}
              disabled={
                !newInvoice.companyId ||
                !newInvoice.periodStart ||
                !newInvoice.periodEnd
              }
            >
              {t('admin.save', 'Salvar')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
