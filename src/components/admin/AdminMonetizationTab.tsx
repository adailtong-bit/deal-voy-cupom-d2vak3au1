import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Line,
  LineChart,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { DollarSign, TrendingUp, Users, Activity } from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'

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

export function AdminMonetizationTab() {
  const { t } = useLanguage()
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
    <div className="space-y-6 animate-fade-in-up">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('admin.margins')}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {totals.margin.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">+12%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('admin.totalCredits')}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {totals.credits.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">+8%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('admin.volume')}
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.coupons}</div>
            <p className="text-xs text-muted-foreground">+24%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('admin.partnerStores')}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dummyData.length}</div>
            <p className="text-xs text-muted-foreground">Ativos</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Desempenho por Parceiro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
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

        <Card>
          <CardHeader>
            <CardTitle>Evolução de Uso e Receita</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
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
