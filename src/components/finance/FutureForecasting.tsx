import { useMemo } from 'react'
import { useLanguage } from '@/stores/LanguageContext'
import { useRegionFormatting } from '@/hooks/useRegionFormatting'
import { useCouponStore } from '@/stores/CouponContext'
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
import { Badge } from '@/components/ui/badge'
import { useFinanceData } from '@/hooks/useFinanceData'
import { FinanceSummaryCards } from './FinanceSummaryCards'

export function FutureForecasting({ franchiseId }: { franchiseId?: string }) {
  const { t } = useLanguage()
  const { franchises } = useCouponStore()
  const franchise = franchises.find((f) => f.id === franchiseId)
  const { formatCurrency, formatDate } = useRegionFormatting(franchise?.region)

  const allData = useFinanceData(franchiseId)
  const futureTransactions = useMemo(
    () => allData.filter((d) => d.status === 'future'),
    [allData],
  )

  const inflows = futureTransactions
    .filter((tr) => tr.type === 'in')
    .reduce((sum, tr) => sum + tr.amount, 0)
  const outflows = futureTransactions
    .filter((tr) => tr.type === 'out')
    .reduce((sum, tr) => sum + tr.amount, 0)
  const balance = inflows - outflows

  return (
    <div className="space-y-4 animate-fade-in">
      <FinanceSummaryCards
        balance={balance}
        inflows={inflows}
        outflows={outflows}
        isFuture
        region={franchise?.region}
      />
      <Card className="shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-white pb-4">
          <CardTitle className="text-lg text-slate-800">
            {t('finance.future_credits', 'Future Credits & Debits')}
          </CardTitle>
          <CardDescription>
            {t(
              'finance.future_desc',
              'Projected earnings such as scheduled invoices and future royalties.',
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="pl-6">
                  {t('finance.date', 'Expected Date')}
                </TableHead>
                <TableHead>{t('finance.description', 'Description')}</TableHead>
                <TableHead>{t('finance.category', 'Category')}</TableHead>
                <TableHead className="text-right pr-6">
                  {t('finance.amount', 'Amount')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {futureTransactions.map((tItem) => (
                <TableRow key={tItem.id} className="hover:bg-slate-50/50">
                  <TableCell className="whitespace-nowrap pl-6 text-sm text-slate-600">
                    {formatDate(tItem.date)}
                  </TableCell>
                  <TableCell className="min-w-[200px] font-medium text-slate-800">
                    {tItem.desc}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-slate-600">
                      {tItem.category}
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
              {futureTransactions.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-10 text-muted-foreground"
                  >
                    {t('common.none', 'No projected records found.')}
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
