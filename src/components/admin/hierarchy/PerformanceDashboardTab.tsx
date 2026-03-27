import { useCouponStore } from '@/stores/CouponContext'
import { useLanguage } from '@/stores/LanguageContext'
import { useRegionFormatting } from '@/hooks/useRegionFormatting'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'
import {
  AlertCircle,
  TrendingUp,
  Building2,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { CouponPerformance } from '@/components/shared/CouponPerformance'

export function PerformanceDashboardTab() {
  const {
    user,
    franchises,
    companies,
    validationLogs,
    coupons,
    seasonalEvents,
  } = useCouponStore()
  const { t } = useLanguage()
  const { formatNumber } = useRegionFormatting(user?.region, user?.country)

  const chartData = franchises
    .map((f) => {
      const fCompanies = companies
        .filter((c) => c.franchiseId === f.id)
        .map((c) => c.id)

      const fCoupons = coupons.filter(
        (c) => c.companyId && fCompanies.includes(c.companyId),
      )
      const fEvents = seasonalEvents.filter(
        (c) => c.companyId && fCompanies.includes(c.companyId),
      )

      const issued =
        fCoupons.reduce((acc, c) => acc + (c.totalAvailable || 100), 0) +
        fEvents.reduce((acc, e) => acc + (e.totalAvailable || 100), 0)

      const redeemed = validationLogs.filter(
        (log) => log.companyId && fCompanies.includes(log.companyId),
      ).length

      return {
        name: f.name.replace('Franchise', 'Fr.'),
        issued,
        redeemed,
      }
    })
    .slice(0, 8)

  const incompleteCompanies = companies.filter(
    (c) =>
      c.status === 'active' && (!c.taxId || !c.billingEmail || !c.bankAccount),
  )

  const pendingCompanies = companies.filter((c) => c.status === 'pending')

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {t('admin.hierarchy.total_franchises', 'Total Franchises')}
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(franchises.length)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {t('admin.hierarchy.total_merchants', 'Total Merchants')}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(companies.length)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {t('admin.hierarchy.pending_approvals', 'Pending Approvals')}
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">
              {formatNumber(pendingCompanies.length)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>
              {t('admin.hierarchy.chart_title', 'Coupons Issued vs. Redeemed')}
            </CardTitle>
            <CardDescription>
              {t(
                'admin.hierarchy.chart_desc',
                'Performance comparison across Top Franchises',
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ChartContainer
                config={{
                  issued: {
                    label: t('admin.hierarchy.issued', 'Issued'),
                    color: 'hsl(var(--primary))',
                  },
                  redeemed: {
                    label: t('admin.hierarchy.redeemed', 'Redeemed'),
                    color: 'hsl(var(--destructive))',
                  },
                }}
              >
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 0, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                    tickFormatter={(value) => formatNumber(value)}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar
                    dataKey="issued"
                    fill="var(--color-issued)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="redeemed"
                    fill="var(--color-redeemed)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-orange-200 bg-orange-50/50 h-full flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-orange-800 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />{' '}
                {t(
                  'admin.hierarchy.alerts_title',
                  'Financial & Registration Alerts',
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-2 flex-1">
              {incompleteCompanies.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-sm text-orange-700 font-medium">
                    {t(
                      'admin.hierarchy.alerts_missing',
                      'Companies with missing billing data:',
                    )}
                  </p>
                  <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2">
                    {incompleteCompanies.map((c) => (
                      <div
                        key={c.id}
                        className="bg-white p-3 rounded-md border border-orange-100 shadow-sm text-xs"
                      >
                        <p className="font-bold text-slate-800 mb-1">
                          {c.name}
                        </p>
                        <p className="text-muted-foreground">
                          {t('admin.hierarchy.missing', 'Missing:')}
                          {!c.taxId && (
                            <span className="text-red-500 font-medium ml-1">
                              CNPJ
                            </span>
                          )}
                          {!c.billingEmail && (
                            <span className="text-red-500 font-medium ml-1">
                              {t(
                                'admin.hierarchy.billing_email',
                                'Billing Email',
                              )}
                            </span>
                          )}
                          {!c.bankAccount && (
                            <span className="text-red-500 font-medium ml-1">
                              {t(
                                'admin.hierarchy.bank_details',
                                'Bank Details',
                              )}
                            </span>
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <Alert className="bg-white border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <AlertTitle className="text-green-700">
                    {t('admin.hierarchy.all_good', 'All Good!')}
                  </AlertTitle>
                  <AlertDescription className="text-green-600 text-xs mt-1">
                    {t(
                      'admin.hierarchy.all_good_desc',
                      'All active companies have complete billing records.',
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <CouponPerformance />
    </div>
  )
}
