import { useState, useMemo } from 'react'
import { useLanguage } from '@/stores/LanguageContext'
import { useRegionFormatting } from '@/hooks/useRegionFormatting'
import { useCouponStore } from '@/stores/CouponContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Download, ChevronDown } from 'lucide-react'
import { useFinanceData } from '@/hooks/useFinanceData'
import { FinanceSummaryCards } from './FinanceSummaryCards'

export function TransactionsList({ franchiseId }: { franchiseId?: string }) {
  const { t } = useLanguage()
  const { franchises } = useCouponStore()
  const franchise = franchises.find((f) => f.id === franchiseId)
  const { formatCurrency, formatDate } = useRegionFormatting(franchise?.region)

  const allData = useFinanceData(franchiseId)

  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [entityFilter, setEntityFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredTransactions = useMemo(() => {
    return allData.filter(
      (d) =>
        (typeFilter === 'all' || d.type === typeFilter) &&
        (entityFilter === 'all' || d.entityId === entityFilter) &&
        (statusFilter === 'all' || d.status === statusFilter) &&
        (!startDate || d.date >= startDate) &&
        (!endDate || d.date <= endDate + 'T23:59:59.999Z'),
    )
  }, [allData, typeFilter, entityFilter, statusFilter, startDate, endDate])

  const currentBalance = allData
    .filter((tr) => tr.status === 'paid')
    .reduce((sum, tr) => sum + (tr.type === 'in' ? tr.amount : -tr.amount), 0)

  const projectedBalance = allData
    .filter((tr) => tr.status === 'paid' || tr.status === 'scheduled')
    .reduce((sum, tr) => sum + (tr.type === 'in' ? tr.amount : -tr.amount), 0)

  const totalPending = allData
    .filter((tr) => tr.status === 'pending')
    .reduce((sum, tr) => sum + (tr.type === 'in' ? tr.amount : -tr.amount), 0)

  const exportGAAP = () => {
    const csvContent =
      'Date,Description,Unit/Entity,Category,Type,Amount (USD),Status\n' +
      filteredTransactions
        .map(
          (tr) =>
            `${new Date(tr.date).toLocaleDateString('en-US')},"${tr.desc}","${tr.entityName || ''}",${tr.category},${tr.type === 'in' ? 'Credit' : 'Debit'},${tr.amount.toFixed(2)},${tr.status}`,
        )
        .join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', `statement_US_GAAP.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 shadow-none border-transparent">
            {t('finance.paid', 'Paid')}
          </Badge>
        )
      case 'pending':
        return (
          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 shadow-none border-transparent">
            {t('finance.pending', 'Pending')}
          </Badge>
        )
      case 'scheduled':
        return (
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 shadow-none border-transparent">
            {t('finance.scheduled', 'Scheduled')}
          </Badge>
        )
      case 'canceled':
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100 shadow-none border-transparent">
            {t('finance.canceled', 'Canceled')}
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary" className="capitalize">
            {status}
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-4 animate-fade-in-up">
      <FinanceSummaryCards
        currentBalance={currentBalance}
        projectedBalance={projectedBalance}
        totalPending={totalPending}
        region={franchise?.region}
      />
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4">
          <CardTitle className="text-lg text-slate-800">
            {t('finance.statement', 'Financial Statement')}
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-md px-2 py-1">
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-[120px] h-8 text-sm border-0 bg-transparent shadow-none focus-visible:ring-0"
              />
              <span className="text-muted-foreground text-sm">-</span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-[120px] h-8 text-sm border-0 bg-transparent shadow-none focus-visible:ring-0"
              />
            </div>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[120px] h-10">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t('filter.all', 'All Types')}
                </SelectItem>
                <SelectItem value="in">
                  {t('finance.credit', 'Credit')}
                </SelectItem>
                <SelectItem value="out">
                  {t('finance.debit', 'Debit')}
                </SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[120px] h-10">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t('filter.all', 'All Statuses')}
                </SelectItem>
                <SelectItem value="paid">
                  {t('finance.paid', 'Paid')}
                </SelectItem>
                <SelectItem value="pending">
                  {t('finance.pending', 'Pending')}
                </SelectItem>
                <SelectItem value="scheduled">
                  {t('finance.scheduled', 'Scheduled')}
                </SelectItem>
                <SelectItem value="canceled">
                  {t('finance.canceled', 'Canceled')}
                </SelectItem>
              </SelectContent>
            </Select>

            {!franchiseId && (
              <Select value={entityFilter} onValueChange={setEntityFilter}>
                <SelectTrigger className="w-[160px] h-10">
                  <SelectValue placeholder="Entity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t('filter.all_entities', 'All Entities')}
                  </SelectItem>
                  {franchises.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-10">
                  <Download className="h-4 w-4 mr-2" />
                  {t('finance.export', 'Export')}
                  <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={exportGAAP}>
                  {t('finance.export_us_gaap', 'Padrão US (GAAP) / QuickBooks')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="pl-6">
                  {t('finance.date', 'Date')}
                </TableHead>
                <TableHead>{t('finance.description', 'Description')}</TableHead>
                {!franchiseId && (
                  <TableHead>{t('finance.unit', 'Unit/Entity')}</TableHead>
                )}
                <TableHead>{t('finance.category', 'Category')}</TableHead>
                <TableHead>{t('finance.status', 'Status')}</TableHead>
                <TableHead className="text-right pr-6">
                  {t('finance.amount', 'Amount')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((tItem) => (
                <TableRow
                  key={tItem.id}
                  className={`hover:bg-slate-50/50 ${['scheduled', 'canceled'].includes(tItem.status) ? 'opacity-70' : ''}`}
                >
                  <TableCell className="whitespace-nowrap pl-6 text-sm text-slate-600">
                    {formatDate(tItem.date)}
                  </TableCell>
                  <TableCell className="min-w-[200px] font-medium text-slate-800">
                    {tItem.desc}
                  </TableCell>
                  {!franchiseId && (
                    <TableCell className="text-slate-600 text-sm">
                      {tItem.entityName}
                    </TableCell>
                  )}
                  <TableCell>
                    <Badge variant="outline" className="text-slate-600">
                      {tItem.category}
                    </Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(tItem.status)}</TableCell>
                  <TableCell
                    className={`text-right font-bold whitespace-nowrap pr-6 ${tItem.type === 'in' ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {tItem.type === 'in' ? '+' : '-'}
                    {formatCurrency(tItem.amount)}
                  </TableCell>
                </TableRow>
              ))}
              {filteredTransactions.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={franchiseId ? 5 : 6}
                    className="text-center py-10 text-muted-foreground"
                  >
                    {t(
                      'common.none',
                      'No records found for the selected filters.',
                    )}
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
