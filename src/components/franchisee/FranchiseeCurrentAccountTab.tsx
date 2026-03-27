import { useSearchParams, useLocation } from 'react-router-dom'
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
import { ArrowDownRight, ArrowUpRight, Wallet } from 'lucide-react'
import { useCouponStore } from '@/stores/CouponContext'
import { cn } from '@/lib/utils'

export function FranchiseeCurrentAccountTab({
  franchiseId,
}: {
  franchiseId: string
}) {
  const { t } = useLanguage()
  const { partnerInvoices, ads, platformSettings, franchises } =
    useCouponStore()
  const [searchParams] = useSearchParams()
  const searchQuery = (searchParams.get('q') || '').toLowerCase()
  const location = useLocation()
  const isFranchisee = location.pathname.includes('/franchisee')

  const franchise = franchises.find((f) => f.id === franchiseId)
  const { formatCurrency, formatDate } = useRegionFormatting(franchise?.region)

  const royaltyRate = platformSettings.franchiseRoyaltyRate || 15

  // Generate dynamic transactions based on actual franchise activity
  const regionalAds = ads.filter((a) => a.franchiseId === franchiseId)

  // 1. Ad Sales Income
  const adIncomes = regionalAds.map((ad, i) => ({
    id: `ad_inc_${ad.id}`,
    date: ad.startDate || new Date().toISOString(),
    desc: `${t('franchisee.current_account.ad_sales')}: ${ad.title}`,
    amount: ad.price || ad.budget || 0,
    type: 'in',
    status: 'completed',
  }))

  // 2. Royalty Payments (Outflow)
  const royaltyPayments = regionalAds.map((ad, i) => ({
    id: `royalty_${ad.id}`,
    date: ad.startDate || new Date().toISOString(),
    desc: `${t('franchisee.current_account.royalty_payment')} (${royaltyRate}%): ${ad.title}`,
    amount: (ad.price || ad.budget || 0) * (royaltyRate / 100),
    type: 'out',
    status: 'completed',
  }))

  // 3. Optional: Paid Invoices from local merchants
  const paidInvoices = partnerInvoices
    .filter((inv) => inv.status === 'paid')
    .map((inv) => ({
      id: `inv_${inv.id}`,
      date: inv.issueDate,
      desc: `${t('franchisee.current_account.merchant_invoice')}: ${inv.referenceNumber}`,
      amount: inv.totalCommission,
      type: 'in',
      status: 'completed',
    }))

  const allTransactionsUnfiltered = [
    ...adIncomes,
    ...royaltyPayments,
    ...paidInvoices,
  ]

  // Add dummy initial balance if empty for better visualization
  if (allTransactionsUnfiltered.length === 0) {
    allTransactionsUnfiltered.push({
      id: 'initial',
      date: new Date(Date.now() - 30 * 86400000).toISOString(),
      desc: t('franchisee.current_account.initial_deposit'),
      amount: 1000,
      type: 'in',
      status: 'completed',
    })
  }

  const allTransactions = allTransactionsUnfiltered
    .filter((t) => t.amount > 0)
    .filter((t) => {
      if (!searchQuery) return true
      return t.desc.toLowerCase().includes(searchQuery)
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const inflows = allTransactions
    .filter((t) => t.type === 'in')
    .reduce((acc, t) => acc + t.amount, 0)
  const outflows = allTransactions
    .filter((t) => t.type === 'out')
    .reduce((acc, t) => acc + t.amount, 0)
  const balance = inflows - outflows

  return (
    <div className="space-y-6 animate-fade-in-up min-w-0 w-full max-w-full">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 min-w-0">
        <Card className="min-w-0 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-slate-100 rounded-full text-slate-600 shrink-0">
                <Wallet className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-muted-foreground truncate">
                {t('franchisee.current_account.balance')}
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
                {t('franchisee.current_account.inflows')}
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
                {t('franchisee.current_account.outflows')}
              </p>
            </div>
            <h3 className="text-2xl font-bold text-red-600 truncate">
              {formatCurrency(outflows)}
            </h3>
          </CardContent>
        </Card>
      </div>

      <Card
        className={cn('min-w-0 w-full', !isFranchisee && 'overflow-hidden')}
      >
        <CardHeader className="min-w-0">
          <CardTitle className="truncate">
            {t('franchisee.current_account.statement')}
          </CardTitle>
        </CardHeader>
        <CardContent
          className={cn(
            'p-0 sm:p-6 sm:pt-0',
            !isFranchisee && 'overflow-x-auto',
          )}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">
                  {t('franchisee.current_account.date')}
                </TableHead>
                <TableHead className="whitespace-nowrap">
                  {t('franchisee.current_account.description')}
                </TableHead>
                <TableHead className="whitespace-nowrap">
                  {t('franchisee.current_account.type')}
                </TableHead>
                <TableHead className="whitespace-nowrap">
                  {t('franchisee.current_account.status')}
                </TableHead>
                <TableHead className="text-right whitespace-nowrap">
                  {t('franchisee.current_account.amount')}
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
                        {t('franchisee.current_account.in')}
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-red-50 text-red-700 border-red-200"
                      >
                        {t('franchisee.current_account.out')}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100">
                      {t('franchisee.current_account.completed')}
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
