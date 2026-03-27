import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  CheckCircle,
  Clock,
  XCircle,
  Download,
  AlertCircle,
} from 'lucide-react'
import { useCouponStore } from '@/stores/CouponContext'
import { useRegionFormatting } from '@/hooks/useRegionFormatting'
import { useLanguage } from '@/stores/LanguageContext'
import { PartnerInvoice } from '@/lib/types'

export function BillingHistoryTab({ franchiseId }: { franchiseId?: string }) {
  const { t } = useLanguage()
  const { partnerInvoices, companies, franchises, updatePartnerInvoiceStatus } =
    useCouponStore()
  const myFranchise = franchises.find((f) => f.id === franchiseId)
  const { formatCurrency, formatShortDate, formatDate } = useRegionFormatting(
    myFranchise?.region,
  )

  const [searchQuery, setSearchQuery] = useState('')
  const [periodFilter, setPeriodFilter] = useState('all')
  const [revenueTypeFilter, setRevenueTypeFilter] = useState('all')

  const companyIds = franchiseId
    ? companies.filter((c) => c.franchiseId === franchiseId).map((c) => c.id)
    : companies.map((c) => c.id)

  const getTargetName = (inv: PartnerInvoice) => {
    if (inv.targetType === 'franchise') {
      return franchises.find((f) => f.id === inv.franchiseId)?.name || inv.id
    }
    return companies.find((c) => c.id === inv.companyId)?.name || inv.id
  }

  const viewableInvoices = partnerInvoices.filter((i) => {
    if (i.status === 'draft') return false
    if (franchiseId) {
      return i.targetType === 'merchant' && companyIds.includes(i.companyId)
    }
    return true
  })

  const historyInvoices = viewableInvoices.filter((i) => {
    if (
      searchQuery &&
      !i.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !getTargetName(i).toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false

    if (revenueTypeFilter !== 'all') {
      const revType = i.targetType === 'franchise' ? 'royalties' : 'commissions'
      if (revType !== revenueTypeFilter) return false
    }

    if (periodFilter !== 'all') {
      const d = new Date(i.issueDate)
      const now = new Date()
      if (periodFilter === 'month')
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        )
      if (periodFilter === 'quarter')
        return (
          Math.floor(d.getMonth() / 3) === Math.floor(now.getMonth() / 3) &&
          d.getFullYear() === now.getFullYear()
        )
      if (periodFilter === 'semester')
        return (
          Math.floor(d.getMonth() / 6) === Math.floor(now.getMonth() / 6) &&
          d.getFullYear() === now.getFullYear()
        )
      if (periodFilter === 'year') return d.getFullYear() === now.getFullYear()
      if (periodFilter === 'fiscal_period') {
        const fiscalYearStart = new Date(now.getFullYear(), 3, 1)
        if (now < fiscalYearStart)
          fiscalYearStart.setFullYear(now.getFullYear() - 1)
        return d >= fiscalYearStart
      }
    }
    return true
  })

  const handleExport = (
    standard: 'BR' | 'US' | 'Global',
    format: 'csv' | 'json' = 'csv',
  ) => {
    if (format === 'json') {
      let data: any[] = []
      if (standard === 'BR') {
        data = historyInvoices.map((i) => ({
          Referencia: i.referenceNumber,
          Destinatario: getTargetName(i),
          TipoReceita: i.targetType === 'franchise' ? 'Royalties' : 'Comissoes',
          PeriodoInicio: formatDate(i.periodStart),
          PeriodoFim: formatDate(i.periodEnd),
          ValorBRL: i.totalCommission,
          Status: i.status,
        }))
      } else {
        data = historyInvoices.map((i) => ({
          Reference: i.referenceNumber,
          Recipient: getTargetName(i),
          RevenueType:
            i.targetType === 'franchise' ? 'Royalties' : 'Commissions',
          PeriodStart: formatDate(i.periodStart),
          PeriodEnd: formatDate(i.periodEnd),
          Amount: i.totalCommission,
          Status: i.status,
        }))
      }
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json;charset=utf-8;',
      })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.setAttribute('download', `export_faturas_${standard}.json`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      return
    }

    let csv = ''
    if (standard === 'BR') {
      csv =
        'Ref,Destinatario,Tipo_Receita,Periodo_Inicio,Periodo_Fim,Valor_BRL,Status\n'
      csv += historyInvoices
        .map((i) => {
          const revType =
            i.targetType === 'franchise' ? 'Royalties' : 'Comissoes'
          return `"${i.referenceNumber}","${getTargetName(i)}","${revType}",${formatDate(i.periodStart)},${formatDate(i.periodEnd)},${i.totalCommission.toFixed(2).replace('.', ',')},${i.status}`
        })
        .join('\n')
    } else {
      csv = 'Ref,Recipient,Revenue_Type,Period_Start,Period_End,Amount,Status\n'
      csv += historyInvoices
        .map((i) => {
          const revType =
            i.targetType === 'franchise' ? 'Royalties' : 'Commissions'
          return `"${i.referenceNumber}","${getTargetName(i)}","${revType}",${formatDate(i.periodStart)},${formatDate(i.periodEnd)},${i.totalCommission.toFixed(2)},${i.status}`
        })
        .join('\n')
    }
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', `export_faturas_${standard}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <Badge className="bg-green-500 text-white">
            <CheckCircle className="mr-1 h-3 w-3" /> Pago
          </Badge>
        )
      case 'pending':
      case 'sent':
        return (
          <Badge className="bg-yellow-500 text-white">
            <Clock className="mr-1 h-3 w-3" /> Pendente
          </Badge>
        )
      case 'overdue':
        return (
          <Badge className="bg-red-500 text-white">
            <AlertCircle className="mr-1 h-3 w-3" /> Atrasado
          </Badge>
        )
      case 'canceled':
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" /> Cancelado
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <Card className="min-w-0 w-full animate-fade-in-up">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between gap-4 sm:items-center">
          <div>
            <CardTitle>Histórico e Gestão</CardTitle>
            <CardDescription>
              Acompanhe as faturas enviadas e seu status de pagamento.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Input
              placeholder="Buscar Ref ou Empresa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-[180px]"
            />
            <Select
              value={revenueTypeFilter}
              onValueChange={setRevenueTypeFilter}
            >
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Receitas</SelectItem>
                <SelectItem value="royalties">Royalties</SelectItem>
                <SelectItem value="commissions">Comissões</SelectItem>
              </SelectContent>
            </Select>
            <Select value={periodFilter} onValueChange={setPeriodFilter}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todo o período</SelectItem>
                <SelectItem value="month">Este Mês</SelectItem>
                <SelectItem value="quarter">Este Trimestre</SelectItem>
                <SelectItem value="semester">Este Semestre</SelectItem>
                <SelectItem value="year">Este Ano</SelectItem>
                <SelectItem value="fiscal_period">Período Fiscal</SelectItem>
              </SelectContent>
            </Select>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  <Download className="mr-2 h-4 w-4" />
                  Exportar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Padrão BR (SPED)</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleExport('BR', 'csv')}>
                  Exportar CSV (BR)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('BR', 'json')}>
                  Exportar JSON (BR)
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Padrão US (GAAP)</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleExport('US', 'csv')}>
                  Exportar CSV (US)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('US', 'json')}>
                  Exportar JSON (US)
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Padrão Global (IFRS)</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleExport('Global', 'csv')}>
                  Exportar CSV (Global)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleExport('Global', 'json')}
                >
                  Exportar JSON (Global)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ref</TableHead>
                <TableHead>Destinatário</TableHead>
                <TableHead>Emissão</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {historyInvoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-medium text-xs">
                    {inv.referenceNumber}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {getTargetName(inv)}
                  </TableCell>
                  <TableCell>{formatShortDate(inv.issueDate)}</TableCell>
                  <TableCell className="font-bold">
                    {formatCurrency(inv.totalCommission)}
                  </TableCell>
                  <TableCell>{getStatusBadge(inv.status)}</TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    {inv.status === 'pending' ||
                    inv.status === 'sent' ||
                    inv.status === 'overdue' ? (
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600 hover:bg-green-50"
                          onClick={() =>
                            updatePartnerInvoiceStatus(inv.id, 'paid')
                          }
                        >
                          <CheckCircle className="w-3 h-3 mr-1" /> Marcar Pago
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:bg-red-50 hover:text-red-600"
                          onClick={() =>
                            updatePartnerInvoiceStatus(inv.id, 'canceled')
                          }
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">--</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {historyInvoices.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Nenhuma fatura encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
