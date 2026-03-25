import { useCouponStore } from '@/stores/CouponContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useLanguage } from '@/stores/LanguageContext'
import { useRegionFormatting } from '@/hooks/useRegionFormatting'
import { DollarSign, Users, ShoppingCart, TrendingUp } from 'lucide-react'

export function DataInsightsTab({ franchiseId }: { franchiseId?: string }) {
  const { validationLogs, users, adInvoices, companies, franchises } =
    useCouponStore()
  const { t } = useLanguage()

  const franchise = franchises.find((f) => f.id === franchiseId)
  const { formatCurrency, formatNumber } = useRegionFormatting(
    franchise?.region,
  )

  const displayCompanies = franchiseId
    ? companies.filter((c) => c.franchiseId === franchiseId)
    : companies
  const companyIds = displayCompanies.map((c) => c.id)

  const displayLogs = franchiseId
    ? validationLogs.filter(
        (l) => l.companyId && companyIds.includes(l.companyId),
      )
    : validationLogs

  const userIds = new Set(displayLogs.map((l) => l.userId))
  const displayUsers = franchiseId
    ? users.filter((u) => userIds.has(u.id))
    : users

  // Calculate stats based on logs and users
  const totalCommissions = displayLogs.reduce(
    (sum, log) => sum + (log.commissionAmount || 0),
    0,
  )
  const totalCashbackDistributed = displayLogs.reduce(
    (sum, log) => sum + (log.cashbackAmount || 0),
    0,
  )

  const activeSubscriptions = displayUsers.filter(
    (u) => u.subscriptionTier && u.subscriptionTier !== 'free',
  ).length
  const premiumUsers = displayUsers.filter(
    (u) => u.subscriptionTier === 'premium',
  ).length
  const vipUsers = displayUsers.filter(
    (u) => u.subscriptionTier === 'vip',
  ).length

  const displayInvoices = franchiseId
    ? adInvoices.filter((i) => i.status === 'paid') // Ideally filter by franchise if adInvoices had it
    : adInvoices.filter((i) => i.status === 'paid')

  const adRevenue = displayInvoices.reduce((sum, i) => sum + i.amount, 0)

  // Mock referral payouts for demo
  const referralPayouts = totalCashbackDistributed * 0.15

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-full text-green-600">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              {t('franchisee.insights.total_commissions', 'Comissões Totais')}
            </p>
            <h3 className="text-2xl font-bold">
              {formatCurrency(totalCommissions)}
            </h3>
            <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" />{' '}
              {t('franchisee.insights.this_month', '+12% este mês')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                <Users className="h-6 w-6" />
              </div>
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              {t('franchisee.insights.active_subs', 'Assinaturas Ativas')}
            </p>
            <h3 className="text-2xl font-bold">
              {formatNumber(activeSubscriptions)}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {t(
                'franchisee.insights.premium_vip',
                '{premium} Premium, {vip} VIP',
              )
                .replace('{premium}', String(premiumUsers))
                .replace('{vip}', String(vipUsers))}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-full text-purple-600">
                <ShoppingCart className="h-6 w-6" />
              </div>
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              {t('franchisee.insights.ad_revenue', 'Receita de Anúncios')}
            </p>
            <h3 className="text-2xl font-bold">{formatCurrency(adRevenue)}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {t('franchisee.insights.ad_desc', 'De campanhas internas')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-full text-orange-600">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              {t('franchisee.insights.referral', 'Pagamentos de Indicação')}
            </p>
            <h3 className="text-2xl font-bold">
              {formatCurrency(referralPayouts)}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {t(
                'franchisee.insights.referral_desc',
                'Distribuído aos indicadores',
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="h-80 flex flex-col justify-center items-center bg-slate-50 border-dashed">
          <p className="text-muted-foreground">
            {t(
              'franchisee.insights.chart_consumption',
              'Gráfico de Tendências de Consumo (Placeholder)',
            )}
          </p>
        </Card>
        <Card className="h-80 flex flex-col justify-center items-center bg-slate-50 border-dashed">
          <p className="text-muted-foreground">
            {t(
              'franchisee.insights.chart_brand',
              'Gráfico de Preferências de Marca (Placeholder)',
            )}
          </p>
        </Card>
      </div>
    </div>
  )
}
