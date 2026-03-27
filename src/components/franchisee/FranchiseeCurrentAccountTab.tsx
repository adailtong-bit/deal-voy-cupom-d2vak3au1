import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useLanguage } from '@/stores/LanguageContext'
import { useRegionFormatting } from '@/hooks/useRegionFormatting'
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
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
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
import { ArrowDownRight, ArrowUpRight, Wallet, Download } from 'lucide-react'
import { useCouponStore } from '@/stores/CouponContext'

export function FranchiseeCurrentAccountTab({
  franchiseId,
}: {
  franchiseId: string
}) {
  const { t } = useLanguage()
  const { partnerInvoices, ads, platformSettings, franchises } =
    useCouponStore()
  const [searchParams, setSearchParams] = useSearchParams()
  const searchQuery = (searchParams.get('q') || '').toLowerCase()

  const [periodFilter, setPeriodFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  const franchise = franchises.find((f) => f.id === franchiseId)
  const { formatCurrency, formatDate } = useRegionFormatting(franchise?.region)

  const royaltyRate = platformSettings.franchiseRoyaltyRate || 15

  const regionalAds = ads.filter((a) => a.franchiseId === franchiseId)

  const adIncomes = regionalAds.map((ad) => ({
    id: `ad_inc_${ad.id}`,
    date: ad.startDate || new Date().toISOString(),
    desc: `${t('franchisee.current_account.ad_sales', 'Venda de Anúncio')}: ${ad.title}`,
    amount: ad.price || ad.budget || 0,
    type: 'in',
    status: 'completed',
  }))

  const royaltyPayments = regionalAds.map((ad) => ({
    id: `royalty_${ad.id}`,
    date: ad.startDate || new Date().toISOString(),
    desc: `${t('franchisee.current_account.royalty_payment', 'Pagamento de Royalties')} (${royaltyRate}%): ${ad.title}`,
    amount: (ad.price || ad.budget || 0) * (royaltyRate / 100),
    type: 'out',
    status: 'completed',
  }))

  const paidInvoices = partnerInvoices
    .filter((inv) => inv.status === 'paid')
    .map((inv) => ({
      id: `inv_${inv.id}`,
      date: inv.issueDate,
      desc: `${t('franchisee.current_account.merchant_invoice', 'Fatura de Lojista')}: ${inv.referenceNumber}`,
      amount: inv.totalCommission,
      type: 'in',
      status: 'completed',
    }))

  const allTransactionsUnfiltered = [
    ...adIncomes,
    ...royaltyPayments,
    ...paidInvoices,
  ]

  if (allTransactionsUnfiltered.length === 0) {
    allTransactionsUnfiltered.push({
      id: 'initial',
      date: new Date(Date.now() - 30 * 86400000).toISOString(),
      desc: t('franchisee.current_account.initial_deposit', 'Depósito Inicial'),
      amount: 1000,
      type: 'in',
      status: 'completed',
    })
  }

  const now = new Date()

  const allTransactions = allTransactionsUnfiltered
    .filter((t) => t.amount > 0)
    .filter((t) => {
      if (!searchQuery) return true
      return t.desc.toLowerCase().includes(searchQuery)
    })
    .filter((t) => {
      if (typeFilter !== 'all') return t.type === typeFilter
      return true
    })
    .filter((tItem) => {
      if (periodFilter === 'all') return true
      const date = new Date(tItem.date)
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
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const inflows = allTransactions
    .filter((t) => t.type === 'in')
    .reduce((acc, t) => acc + t.amount, 0)
  const outflows = allTransactions
    .filter((t) => t.type === 'out')
    .reduce((acc, t) => acc + t.amount, 0)
  const balance = inflows - outflows

  const exportData = (standard: 'BR' | 'US' | 'Global') => {
    let csvContent = ''
    if (standard === 'BR') {
      csvContent = 'Data,Descrição,Tipo,Valor (R$),Status\n'
      csvContent += allTransactions
        .map(
          (t) =>
            `${formatDate(t.date)},"${t.desc}",${t.type === 'in' ? 'Entrada' : 'Saida'},${t.amount.toFixed(2).replace('.', ',')},${t.status}`,
        )
        .join('\n')
    } else if (standard === 'US') {
      csvContent = 'Date,Description,Type,Amount (USD),Status\n'
      csvContent += allTransactions
        .map(
          (t) =>
            `${new Date(t.date).toLocaleDateString('en-US')},"${t.desc}",${t.type === 'in' ? 'Credit' : 'Debit'},${t.amount.toFixed(2)},${t.status}`,
        )
        .join('\n')
    } else {
      csvContent = 'Date,Description,Type,Amount,Status\n'
      csvContent += allTransactions
        .map(
          (t) =>
            `${new Date(t.date).toISOString().split('T')[0]},"${t.desc}",${t.type},${t.amount.toFixed(2)},${t.status}`,
        )
        .join('\n')
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', `statement_${standard}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6 animate-fade-in-up w-full max-w-full">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="min-w-0 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-slate-100 rounded-full text-slate-600 shrink-0">
                <Wallet className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-muted-foreground truncate">
                {t('franchisee.current_account.balance', 'Saldo')}
              </p>
            </div>
            <h3 className="text-2xl font-bold truncate">
              {formatCurrency(balance)}
            </h3>
          </CardContent>
        </Card>
        <Card className="min-w-0 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-full text-green-600 shrink-0">
                <ArrowUpRight className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-muted-foreground truncate">
                {t('franchisee.current_account.inflows', 'Entradas')}
              </p>
            </div>
            <h3 className="text-2xl font-bold text-green-600 truncate">
              {formatCurrency(inflows)}
            </h3>
          </CardContent>
        </Card>
        <Card className="min-w-0 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-red-100 rounded-full text-red-600 shrink-0">
                <ArrowDownRight className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-muted-foreground truncate">
                {t('franchisee.current_account.outflows', 'Saídas')}
              </p>
            </div>
            <h3 className="text-2xl font-bold text-red-600 truncate">
              {formatCurrency(outflows)}
            </h3>
          </CardContent>
        </Card>
      </div>

      <Card className="min-w-0 w-full overflow-hidden">
        <CardHeader className="min-w-0 pb-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <CardTitle className="truncate">
              {t('franchisee.current_account.statement', 'Extrato Financeiro')}
            </CardTitle>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
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
                <SelectTrigger className="w-full sm:w-[140px] bg-white">
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
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[140px] bg-white">
                  <SelectValue placeholder={t('filter.type', 'Tipo')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t('filter.all_types', 'Todos os Tipos')}
                  </SelectItem>
                  <SelectItem value="in">
                    {t('franchisee.current_account.in', 'Entradas')}
                  </SelectItem>
                  <SelectItem value="out">
                    {t('franchisee.current_account.out', 'Saídas')}
                  </SelectItem>
                </SelectContent>
              </Select>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto">
                    <Download className="mr-2 h-4 w-4" />
                    {t('common.export', 'Exportar')}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => exportData('BR')}>
                    Padrão BR (ERP)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => exportData('US')}>
                    Padrão US (GAAP)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => exportData('Global')}>
                    Padrão Global (IFRS)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">
                  {t('franchisee.current_account.date', 'Data')}
                </TableHead>
                <TableHead className="whitespace-nowrap">
                  {t('franchisee.current_account.description', 'Descrição')}
                </TableHead>
                <TableHead className="whitespace-nowrap">
                  {t('franchisee.current_account.type', 'Tipo')}
                </TableHead>
                <TableHead className="whitespace-nowrap">
                  {t('franchisee.current_account.status', 'Status')}
                </TableHead>
                <TableHead className="text-right whitespace-nowrap">
                  {t('franchisee.current_account.amount', 'Valor')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allTransactions.map((tItem) => (
                <TableRow key={tItem.id}>
                  <TableCell className="text-sm whitespace-nowrap">
                    {formatDate(tItem.date)}
                  </TableCell>
                  <TableCell className="font-medium whitespace-nowrap min-w-[200px]">
                    <span className="truncate block max-w-[250px] sm:max-w-xs">
                      {tItem.desc}
                    </span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {tItem.type === 'in' ? (
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200"
                      >
                        {t('franchisee.current_account.in', 'Entrada')}
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-red-50 text-red-700 border-red-200"
                      >
                        {t('franchisee.current_account.out', 'Saída')}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100">
                      {t('franchisee.current_account.completed', 'Concluído')}
                    </Badge>
                  </TableCell>
                  <TableCell
                    className={`text-right font-bold whitespace-nowrap ${tItem.type === 'in' ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {tItem.type === 'in' ? '+' : '-'}
                    {formatCurrency(tItem.amount)}
                  </TableCell>
                </TableRow>
              ))}
              {allTransactions.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                  >
                    {t('common.none', 'Nenhum registro encontrado.')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
