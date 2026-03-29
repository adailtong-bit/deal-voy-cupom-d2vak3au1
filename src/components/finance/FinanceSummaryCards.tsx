import { Card, CardContent } from '@/components/ui/card'
import { Wallet, TrendingUp, Clock } from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'
import { useRegionFormatting } from '@/hooks/useRegionFormatting'

interface Props {
  currentBalance: number
  projectedBalance: number
  totalPending: number
  region?: string
}

export function FinanceSummaryCards({
  currentBalance,
  projectedBalance,
  totalPending,
  region,
}: Props) {
  const { t } = useLanguage()
  const { formatCurrency } = useRegionFormatting(region)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <Card className="min-w-0 overflow-hidden shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-full text-blue-600 shrink-0">
              <Wallet className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-muted-foreground truncate">
              {t('finance.current_balance', 'Current Balance')}
            </p>
          </div>
          <h3 className="text-2xl font-bold text-slate-800 truncate">
            {formatCurrency(currentBalance)}
          </h3>
        </CardContent>
      </Card>

      <Card className="min-w-0 overflow-hidden shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-100 rounded-full text-emerald-600 shrink-0">
              <TrendingUp className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-muted-foreground truncate">
              {t('finance.projected_balance', 'Projected Balance')}
            </p>
          </div>
          <h3 className="text-2xl font-bold text-emerald-600 truncate">
            {formatCurrency(projectedBalance)}
          </h3>
        </CardContent>
      </Card>

      <Card className="min-w-0 overflow-hidden shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-100 rounded-full text-amber-600 shrink-0">
              <Clock className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-muted-foreground truncate">
              {t('finance.total_pending', 'Total Pending')}
            </p>
          </div>
          <h3 className="text-2xl font-bold text-amber-600 truncate">
            {formatCurrency(totalPending)}
          </h3>
        </CardContent>
      </Card>
    </div>
  )
}
