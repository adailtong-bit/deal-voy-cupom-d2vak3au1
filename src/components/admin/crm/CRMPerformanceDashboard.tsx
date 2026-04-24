import { useState, useMemo, useEffect } from 'react'
import { useCouponStore } from '@/stores/CouponContext'
import { useLanguage } from '@/stores/LanguageContext'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { supabase } from '@/lib/supabase/client'
import { Target, TrendingUp, TrendingDown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export function CRMPerformanceDashboard({
  franchiseId,
}: {
  franchiseId?: string
}) {
  const { t } = useLanguage()
  const { franchises, companies, coupons, validationLogs } = useCouponStore()
  const [viewLevel, setViewLevel] = useState<
    'global' | 'franchise' | 'merchant' | 'affiliate' | 'campaign' | 'category'
  >('campaign')
  const [period, setPeriod] = useState('this_month')
  const [affiliates, setAffiliates] = useState<any[]>([])
  const [affiliateTx, setAffiliateTx] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: aff }, { data: tx }] = await Promise.all([
        supabase.from('affiliate_partners').select('*'),
        supabase.from('affiliate_transactions').select('*'),
      ])
      if (aff) setAffiliates(aff)
      if (tx) setAffiliateTx(tx)
    }
    fetchData()
  }, [])

  const data = useMemo(() => {
    let result: any[] = []

    const baseLogs = franchiseId
      ? validationLogs.filter(
          (l) =>
            l.franchiseId === franchiseId ||
            companies.find((c) => c.id === l.companyId)?.franchiseId ===
              franchiseId,
        )
      : validationLogs
    const baseCoupons = franchiseId
      ? coupons.filter(
          (c) =>
            c.franchiseId === franchiseId ||
            companies.find((comp) => comp.id === c.companyId)?.franchiseId ===
              franchiseId,
        )
      : coupons

    // Simulating period effects
    const multiplier =
      period === 'this_month' ? 1 : period === 'last_month' ? 0.8 : 4.5

    if (viewLevel === 'franchise') {
      result = franchises.map((f) => {
        const fLogs = validationLogs.filter(
          (l) =>
            l.franchiseId === f.id ||
            companies.find((c) => c.id === l.companyId)?.franchiseId === f.id,
        )
        const redemptions = Math.floor(fLogs.length * multiplier)
        return {
          id: f.id,
          name: f.name,
          redemptions: redemptions,
          clicks: redemptions * 3 + Math.floor(Math.random() * 50),
          revenue: redemptions * 45,
          trend: Math.random() * 30 - 10, // Mock trend
        }
      })
    } else if (viewLevel === 'merchant') {
      const targetCompanies = franchiseId
        ? companies.filter((c) => c.franchiseId === franchiseId)
        : companies
      result = targetCompanies
        .map((c) => {
          const cLogs = baseLogs.filter((l) => l.companyId === c.id)
          const redemptions = Math.floor(cLogs.length * multiplier)
          return {
            id: c.id,
            name: c.name,
            redemptions: redemptions,
            clicks: redemptions * 4 + Math.floor(Math.random() * 20),
            revenue: redemptions * 50,
            trend: Math.random() * 30 - 10,
          }
        })
        .sort((a, b) => b.redemptions - a.redemptions)
        .slice(0, 20)
    } else if (viewLevel === 'campaign') {
      result = baseCoupons
        .map((c) => {
          const cLogs = baseLogs.filter((l) => l.couponId === c.id)
          const redemptions = Math.floor(cLogs.length * multiplier)
          const clicks = Math.floor(
            (c.visitCount || c.clickCount || cLogs.length * 5 + 10) *
              multiplier,
          )
          return {
            id: c.id,
            name: c.title,
            category: c.category,
            redemptions: redemptions,
            clicks: clicks,
            revenue: redemptions * (c.price || 30),
            trend: Math.random() * 40 - 15,
          }
        })
        .sort((a, b) => b.redemptions - a.redemptions)
        .slice(0, 30)
    } else if (viewLevel === 'category') {
      const categories = Array.from(new Set(baseCoupons.map((c) => c.category)))
      result = categories
        .map((cat) => {
          const cLogs = baseLogs.filter(
            (l) =>
              baseCoupons.find((c) => c.id === l.couponId)?.category === cat,
          )
          const catCoupons = baseCoupons.filter((c) => c.category === cat)
          const redemptions = Math.floor(cLogs.length * multiplier)
          const clicks = Math.floor(
            (catCoupons.reduce((sum, c) => sum + (c.visitCount || 0), 0) ||
              cLogs.length * 5 + 50) * multiplier,
          )
          return {
            id: cat,
            name: cat || t('common.general', 'General'),
            redemptions: redemptions,
            clicks: clicks,
            revenue: redemptions * 40,
            trend: Math.random() * 20 - 5,
          }
        })
        .sort((a, b) => b.redemptions - a.redemptions)
    } else if (viewLevel === 'affiliate') {
      result = affiliates
        .map((a) => {
          const aTx = affiliateTx.filter((tx) => tx.affiliate_id === a.id)
          const sales =
            aTx.reduce((sum, tx) => sum + (Number(tx.sale_amount) || 0), 0) *
            multiplier
          const redemptions = Math.floor(aTx.length * multiplier)
          return {
            id: a.id,
            name: a.name,
            redemptions: redemptions,
            clicks: redemptions * 10 + Math.floor(Math.random() * 100),
            revenue: sales,
            trend: Math.random() * 50 - 20,
          }
        })
        .sort((a, b) => b.revenue - a.revenue)
    } else {
      const redemptions = Math.floor(baseLogs.length * multiplier)
      const clicks = Math.floor(
        (baseCoupons.reduce((sum, c) => sum + (c.visitCount || 0), 0) ||
          baseLogs.length * 4 + 100) * multiplier,
      )
      result = [
        {
          id: 'global',
          name: t('crm.performance.global_view', 'Global View'),
          redemptions: redemptions,
          clicks: clicks,
          revenue: redemptions * 40,
          trend: 12.5,
        },
      ]
    }

    return result
  }, [
    viewLevel,
    period,
    franchises,
    companies,
    coupons,
    validationLogs,
    affiliates,
    affiliateTx,
    franchiseId,
    t,
  ])

  const chartData = data.slice(0, 10)

  const TrendBadge = ({ value }: { value: number }) => {
    const isPositive = value >= 0
    return (
      <Badge
        variant="outline"
        className={cn(
          'ml-2 font-mono text-[10px]',
          isPositive
            ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
            : 'text-rose-600 bg-rose-50 border-rose-200',
        )}
      >
        {isPositive ? (
          <TrendingUp className="w-3 h-3 mr-1 inline" />
        ) : (
          <TrendingDown className="w-3 h-3 mr-1 inline" />
        )}
        {Math.abs(value).toFixed(1)}%
      </Badge>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl border shadow-sm">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            {t('crm.performance.title', 'Granular Performance (CRM)')}
          </h3>
          <p className="text-sm text-slate-500">
            {t(
              'crm.performance.desc',
              'Measure overall or individual performance by niche, campaign, merchant, or affiliate.',
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="w-full sm:w-40">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="bg-slate-50">
                <SelectValue
                  placeholder={t('dashboard.period.this_month', 'This Month')}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this_month">
                  {t('dashboard.period.this_month', 'This Month')}
                </SelectItem>
                <SelectItem value="last_month">
                  {t('dashboard.period.last_month', 'Last Month')}
                </SelectItem>
                <SelectItem value="this_year">
                  {t('dashboard.period.this_year', 'This Year')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full sm:w-56">
            <Select
              value={viewLevel}
              onValueChange={(v: any) => setViewLevel(v)}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={t('crm.performance.select_view', 'Select view')}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="global">
                  {t('crm.performance.global_view', 'Global View')}
                </SelectItem>
                {!franchiseId && (
                  <SelectItem value="franchise">
                    {t('crm.performance.by_franchise', 'By Franchise')}
                  </SelectItem>
                )}
                <SelectItem value="merchant">
                  {t('crm.performance.by_merchant', 'By Merchant')}
                </SelectItem>
                {!franchiseId && (
                  <SelectItem value="affiliate">
                    {t('crm.performance.by_affiliate', 'By Affiliate')}
                  </SelectItem>
                )}
                <SelectItem value="campaign">
                  {t('crm.performance.by_campaign', 'By Campaign (Offer)')}
                </SelectItem>
                <SelectItem value="category">
                  {t('crm.performance.by_category', 'By Niche / Category')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>
              {t(
                'crm.performance.engagement_vs_conversion',
                'Engagement vs Conversion',
              )}
            </CardTitle>
            <CardDescription>
              {t(
                'crm.performance.engagement_desc',
                'Comparison of Clicks and Redemptions at the selected level',
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ChartContainer
                config={{
                  clicks: {
                    label: t('crm.performance.clicks', 'Clicks'),
                    color: 'hsl(var(--primary))',
                  },
                  redemptions: {
                    label: t(
                      'crm.performance.redemptions',
                      'Redemptions/Sales',
                    ),
                    color: 'hsl(var(--emerald-500))',
                  },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
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
                      tickFormatter={(val) =>
                        String(val).substring(0, 12) + '...'
                      }
                    />
                    <YAxis tickLine={false} axisLine={false} fontSize={12} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar
                      dataKey="clicks"
                      fill="var(--color-clicks)"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="redemptions"
                      fill="var(--color-redemptions)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {t('crm.performance.revenue_ranking', 'Revenue Ranking')}
            </CardTitle>
            <CardDescription>
              {t('crm.performance.revenue_desc', 'Top volume generators ($)')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {chartData
                .sort((a, b) => b.revenue - a.revenue)
                .slice(0, 5)
                .map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0"
                  >
                    <div className="min-w-0 flex-1 pr-4">
                      <p className="text-sm font-medium text-slate-800 truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-slate-500 flex items-center">
                        {item.redemptions}{' '}
                        {t('crm.performance.conversions', 'conversions')}
                        <TrendBadge value={item.trend} />
                      </p>
                    </div>
                    <div className="font-bold text-emerald-600 whitespace-nowrap">
                      ${' '}
                      {item.revenue.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                      })}
                    </div>
                  </div>
                ))}
              {chartData.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">
                  {t('common.no_data', 'No data to display.')}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {t('crm.performance.analytical_details', 'Analytical Breakdown')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>
                    {t('crm.performance.name_title', 'Name / Title')}
                  </TableHead>
                  {viewLevel === 'campaign' && (
                    <TableHead>
                      {t('crm.performance.niche_category', 'Niche/Category')}
                    </TableHead>
                  )}
                  <TableHead className="text-right">
                    {t('crm.performance.clicks_traffic', 'Clicks (Traffic)')}
                  </TableHead>
                  <TableHead className="text-right">
                    {t('crm.performance.conversions_col', 'Conversions')}
                  </TableHead>
                  <TableHead className="text-right">
                    {t('crm.performance.cr_rate', 'Rate (CR)')}
                  </TableHead>
                  <TableHead className="text-right">Trend</TableHead>
                  <TableHead className="text-right">
                    {t('crm.performance.est_revenue', 'Estimated Revenue')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item, i) => {
                  const cr =
                    item.clicks > 0
                      ? ((item.redemptions / item.clicks) * 100).toFixed(1)
                      : '0.0'
                  return (
                    <TableRow key={i}>
                      <TableCell className="font-medium text-slate-800">
                        {item.name}
                      </TableCell>
                      {viewLevel === 'campaign' && (
                        <TableCell>
                          <Badge variant="outline">{item.category}</Badge>
                        </TableCell>
                      )}
                      <TableCell className="text-right text-blue-600 font-medium">
                        {item.clicks}
                      </TableCell>
                      <TableCell className="text-right text-emerald-600 font-bold">
                        {item.redemptions}
                      </TableCell>
                      <TableCell className="text-right font-medium text-purple-600">
                        {cr}%
                      </TableCell>
                      <TableCell className="text-right">
                        <TrendBadge value={item.trend} />
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        ${' '}
                        {item.revenue.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                        })}
                      </TableCell>
                    </TableRow>
                  )
                })}
                {data.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-6 text-slate-500"
                    >
                      {t(
                        'crm.performance.no_records',
                        'No records found for this view.',
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
