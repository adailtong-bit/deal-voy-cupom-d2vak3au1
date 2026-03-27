import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Line,
  LineChart,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { DollarSign, TrendingUp, Users, Activity, Radar } from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'
import { useRegionFormatting } from '@/hooks/useRegionFormatting'
import { useCouponStore } from '@/stores/CouponContext'

const dummyData = [
  { partner: 'Sabor', coupons: 145, credits: 1250, margin: 350 },
  { partner: 'Paraíso', coupons: 89, credits: 3400, margin: 850 },
  { partner: 'Radical', coupons: 210, credits: 1890, margin: 420 },
  { partner: 'Café', coupons: 340, credits: 850, margin: 170 },
]

const timelineData = [
  { date: '01/10', revenue: 450, coupons: 120 },
  { date: '05/10', revenue: 680, coupons: 180 },
  { date: '10/10', revenue: 850, coupons: 240 },
  { date: '15/10', revenue: 1200, coupons: 310 },
  { date: '20/10', revenue: 1450, coupons: 420 },
  { date: '25/10', revenue: 1890, coupons: 580 },
]

export function AdminMonetizationTab({
  franchiseId,
}: {
  franchiseId?: string
}) {
  const { t } = useLanguage()
  const { franchises, platformSettings, updatePlatformSettings } =
    useCouponStore()
  const franchise = franchises.find((f) => f.id === franchiseId)
  const { formatCurrency, formatNumber } = useRegionFormatting(
    franchise?.region,
  )

  const totals = useMemo(() => {
    return dummyData.reduce(
      (acc, curr) => ({
        coupons: acc.coupons + curr.coupons,
        credits: acc.credits + curr.credits,
        margin: acc.margin + curr.margin,
      }),
      { coupons: 0, credits: 0, margin: 0 },
    )
  }, [])

  return (
    <div className="space-y-6 animate-fade-in-up min-w-0 w-full">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="min-w-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('admin.margins')}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totals.margin)}
            </div>
            <p className="text-xs text-muted-foreground">+12%</p>
          </CardContent>
        </Card>
        <Card className="min-w-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('admin.totalCredits')}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totals.credits)}
            </div>
            <p className="text-xs text-muted-foreground">+8%</p>
          </CardContent>
        </Card>
        <Card className="min-w-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('admin.volume')}
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(totals.coupons)}
            </div>
            <p className="text-xs text-muted-foreground">+24%</p>
          </CardContent>
        </Card>
        <Card className="min-w-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('admin.partnerStores')}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(dummyData.length)}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('franchisee.monetization.active_plural', 'Ativos')}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-2 border-slate-200 min-w-0">
          <CardHeader className="bg-slate-50/50 border-b">
            <CardTitle className="flex items-center gap-2">
              <Radar className="h-5 w-5 text-primary" />
              Configurações Globais da Plataforma
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white rounded-lg border border-slate-200 shadow-sm gap-4">
              <div className="space-y-1">
                <Label className="text-base font-semibold text-slate-800">
                  Master Switch de Alertas de Proximidade
                </Label>
                <p className="text-sm text-slate-500">
                  Habilita ou desativa a tecnologia de Geofencing e Radar para
                  toda a base de usuários e lojistas simultaneamente.
                </p>
              </div>
              <Switch
                checked={
                  platformSettings.globalProximityAlertsEnabled !== false
                }
                onCheckedChange={(c) =>
                  updatePlatformSettings({ globalProximityAlertsEnabled: c })
                }
                className="data-[state=checked]:bg-primary shrink-0"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>
              {t(
                'franchisee.monetization.performance',
                'Desempenho por Parceiro',
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full min-w-0">
              <ChartContainer
                config={{
                  margin: {
                    label: t('admin.margins'),
                    color: 'hsl(var(--primary))',
                  },
                  credits: {
                    label: t('admin.totalCredits'),
                    color: 'hsl(var(--secondary))',
                  },
                }}
              >
                <BarChart data={dummyData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    className="stroke-muted"
                  />
                  <XAxis dataKey="partner" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="credits"
                    fill="var(--color-credits)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="margin"
                    fill="var(--color-margin)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>
              {t(
                'franchisee.monetization.evolution',
                'Evolução de Uso e Receita',
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full min-w-0">
              <ChartContainer
                config={{
                  revenue: {
                    label: t('admin.estRevenue'),
                    color: 'hsl(var(--primary))',
                  },
                  coupons: {
                    label: t('admin.volume'),
                    color: 'hsl(var(--destructive))',
                  },
                }}
              >
                <LineChart data={timelineData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    className="stroke-muted"
                  />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left" tickLine={false} axisLine={false} />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tickLine={false}
                    axisLine={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--color-revenue)"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="coupons"
                    stroke="var(--color-coupons)"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
