import { Card, CardContent } from '@/components/ui/card'
import { Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'
import { useRegionFormatting } from '@/hooks/useRegionFormatting'

interface Props {
  balance: number
  inflows: number
  outflows: number
  isFuture?: boolean
  region?: string
}

export function FinanceSummaryCards({
  balance,
  inflows,
  outflows,
  isFuture,
  region,
}: Props) {
  const { t } = useLanguage()
  const { formatCurrency } = useRegionFormatting(region)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <Card className="min-w-0 overflow-hidden shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-slate-100 rounded-full text-slate-600 shrink-0">
              <Wallet className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-muted-foreground truncate">
              {isFuture
                ? t('finance.expected_balance', 'Expected Balance')
                : t('finance.balance', 'Balance')}
            </p>
          </div>
          <h3 className="text-2xl font-bold truncate text-slate-800">
            {formatCurrency(balance)}
          </h3>
        </CardContent>
      </Card>
      <Card className="min-w-0 overflow-hidden shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-full text-green-600 shrink-0">
              <ArrowUpRight className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-muted-foreground truncate">
              {isFuture
                ? t('finance.future_inflows', 'Future Inflows')
                : t('finance.inflows', 'Inflows')}
            </p>
          </div>
          <h3 className="text-2xl font-bold text-green-600 truncate">
            {formatCurrency(inflows)}
          </h3>
        </CardContent>
      </Card>
      <Card className="min-w-0 overflow-hidden shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 rounded-full text-red-600 shrink-0">
              <ArrowDownRight className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-muted-foreground truncate">
              {isFuture
                ? t('finance.future_outflows', 'Future Outflows')
                : t('finance.outflows', 'Outflows')}
            </p>
          </div>
          <h3 className="text-2xl font-bold text-red-600 truncate">
            {formatCurrency(outflows)}
          </h3>
        </CardContent>
      </Card>
    </div>
  )
}
