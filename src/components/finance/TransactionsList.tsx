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
import { Download } from 'lucide-react'
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

  const completedTransactions = useMemo(() => {
    return allData.filter(
      (d) =>
        d.status === 'completed' &&
        (typeFilter === 'all' || d.type === typeFilter) &&
        (entityFilter === 'all' || d.entityId === entityFilter) &&
        (!startDate || d.date >= startDate) &&
        (!endDate || d.date <= endDate + 'T23:59:59.999Z'),
    )
  }, [allData, typeFilter, entityFilter, startDate, endDate])

  const inflows = completedTransactions
    .filter((tr) => tr.type === 'in')
    .reduce((sum, tr) => sum + tr.amount, 0)
  const outflows = completedTransactions
    .filter((tr) => tr.type === 'out')
    .reduce((sum, tr) => sum + tr.amount, 0)
  const balance = inflows - outflows

  const exportGAAP = () => {
    const csvContent =
      'Date,Description,Category,Type,Amount (USD),Status\n' +
      completedTransactions
        .map(
          (tr) =>
            `${new Date(tr.date).toLocaleDateString('en-US')},"${tr.desc}",${tr.category},${tr.type === 'in' ? 'Credit' : 'Debit'},${tr.amount.toFixed(2)},${tr.status}`,
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

  return (
    <div className="space-y-4">
      <FinanceSummaryCards
        balance={balance}
        inflows={inflows}
        outflows={outflows}
        region={franchise?.region}
      />
      <Card className="shadow-sm">
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4">
          <CardTitle className="text-lg">
            {t('finance.statement', 'Financial Statement')}
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-md px-2 py-1">
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-[120px] h-8 text-sm border-0 bg-transparent shadow-none"
              />
              <span className="text-muted-foreground text-sm">-</span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-[120px] h-8 text-sm border-0 bg-transparent shadow-none"
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
                <SelectItem value="in">{t('finance.in', 'Credits')}</SelectItem>
                <SelectItem value="out">
                  {t('finance.out', 'Debits')}
                </SelectItem>
              </SelectContent>
            </Select>
            {!franchiseId && (
              <Select value={entityFilter} onValueChange={setEntityFilter}>
                <SelectTrigger className="w-[160px] h-10">
                  <SelectValue placeholder="Entity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Entities</SelectItem>
                  {franchises.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button variant="outline" onClick={exportGAAP} className="h-10">
              <Download className="h-4 w-4 mr-2" />{' '}
              {t('finance.export_qb', 'QuickBooks')}
            </Button>
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
                <TableHead>{t('finance.category', 'Category')}</TableHead>
                <TableHead>{t('finance.status', 'Status')}</TableHead>
                <TableHead className="text-right pr-6">
                  {t('finance.amount', 'Amount')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {completedTransactions.map((tItem) => (
                <TableRow key={tItem.id} className="hover:bg-slate-50/50">
                  <TableCell className="whitespace-nowrap pl-6 text-sm text-slate-600">
                    {formatDate(tItem.date)}
                  </TableCell>
                  <TableCell className="min-w-[200px] font-medium text-slate-800">
                    {tItem.desc}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className="bg-slate-100 text-slate-600 hover:bg-slate-200"
                    >
                      {tItem.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100 shadow-none border-transparent capitalize">
                      {tItem.status}
                    </Badge>
                  </TableCell>
                  <TableCell
                    className={`text-right font-bold whitespace-nowrap pr-6 ${tItem.type === 'in' ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {tItem.type === 'in' ? '+' : '-'}
                    {formatCurrency(tItem.amount)}
                  </TableCell>
                </TableRow>
              ))}
              {completedTransactions.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
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
