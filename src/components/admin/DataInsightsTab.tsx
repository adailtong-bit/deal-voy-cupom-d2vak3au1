import { useCouponStore } from '@/stores/CouponContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useLanguage } from '@/stores/LanguageContext'
import { DollarSign, Users, ShoppingCart, TrendingUp } from 'lucide-react'

export function DataInsightsTab() {
  const { validationLogs, users, adInvoices } = useCouponStore()
  const { formatCurrency } = useLanguage()

  // Calculate stats based on logs and users
  const totalCommissions = validationLogs.reduce(
    (sum, log) => sum + (log.commissionAmount || 0),
    0,
  )
  const totalCashbackDistributed = validationLogs.reduce(
    (sum, log) => sum + (log.cashbackAmount || 0),
    0,
  )

  const activeSubscriptions = users.filter(
    (u) => u.subscriptionTier && u.subscriptionTier !== 'free',
  ).length
  const premiumUsers = users.filter(
    (u) => u.subscriptionTier === 'premium',
  ).length
  const vipUsers = users.filter((u) => u.subscriptionTier === 'vip').length

  const adRevenue = adInvoices
    .filter((i) => i.status === 'paid')
    .reduce((sum, i) => sum + i.amount, 0)

  // Mock referral payouts for demo
  const referralPayouts = totalCashbackDistributed * 0.15

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-full text-green-600">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              Total Commissions
            </p>
            <h3 className="text-2xl font-bold">
              {formatCurrency(totalCommissions)}
            </h3>
            <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" /> +12% this month
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
              Active Subscriptions
            </p>
            <h3 className="text-2xl font-bold">{activeSubscriptions}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {premiumUsers} Premium, {vipUsers} VIP
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
              Ad Revenue
            </p>
            <h3 className="text-2xl font-bold">{formatCurrency(adRevenue)}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              From internal campaigns
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
              Referral Payouts
            </p>
            <h3 className="text-2xl font-bold">
              {formatCurrency(referralPayouts)}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Distributed to referrers
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="h-80 flex flex-col justify-center items-center bg-slate-50 border-dashed">
          <p className="text-muted-foreground">
            Consumption Trends Chart Placeholder
          </p>
        </Card>
        <Card className="h-80 flex flex-col justify-center items-center bg-slate-50 border-dashed">
          <p className="text-muted-foreground">
            Brand Preferences Chart Placeholder
          </p>
        </Card>
      </div>
    </div>
  )
}
