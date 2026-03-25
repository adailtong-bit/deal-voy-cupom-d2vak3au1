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
import {
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Bar,
  LineChart,
  Line,
} from 'recharts'
import { Radar } from 'lucide-react'
import { useCouponStore } from '@/stores/CouponContext'

export function VendorAnalytics() {
  const { validationLogs, user, companies, coupons } = useCouponStore()
  const myCompany =
    companies.find((c) => c.id === user?.companyId) || companies[0]

  const myLogs = validationLogs.filter((l) => l.companyId === myCompany.id)
  const myCoupons = coupons.filter((c) => c.companyId === myCompany.id)

  const redemptionData = [
    { name: 'Seg', redemptions: Math.max(2, myLogs.length % 5) },
    { name: 'Ter', redemptions: Math.max(5, myLogs.length % 8) },
    { name: 'Qua', redemptions: Math.max(4, myLogs.length % 6) },
    { name: 'Qui', redemptions: Math.max(8, myLogs.length % 12) },
    { name: 'Sex', redemptions: Math.max(12, myLogs.length % 18) },
    { name: 'Sáb', redemptions: Math.max(20, myLogs.length % 25) },
    { name: 'Dom', redemptions: Math.max(15, myLogs.length % 20) },
  ]

  const growthData = [
    { name: 'Semana 1', leads: 5 },
    { name: 'Semana 2', leads: 8 },
    { name: 'Semana 3', leads: 14 },
    { name: 'Semana 4', leads: 22 },
  ]

  const totalAlertsSent = myCoupons.reduce(
    (sum, c) => sum + (c.proximityAlertsSent || 0),
    0,
  )
  const totalAlertsRedeemed = myCoupons.reduce(
    (sum, c) => sum + (c.redeemedViaAlert || 0),
    0,
  )

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Resgates Semanais</CardTitle>
            <CardDescription>
              Volume de uso de cupons nos últimos 7 dias.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ChartContainer
                config={{
                  redemptions: {
                    label: 'Resgates',
                    color: 'hsl(var(--primary))',
                  },
                }}
              >
                <BarChart
                  data={redemptionData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                  />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="redemptions"
                    fill="var(--color-redemptions)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Crescimento de Leads</CardTitle>
            <CardDescription>
              Novos clientes únicos adquiridos via campanhas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ChartContainer
                config={{ leads: { label: 'Novos Leads', color: '#10b981' } }}
              >
                <LineChart
                  data={growthData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                  />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="leads"
                    stroke="var(--color-leads)"
                    strokeWidth={3}
                    dot={{ r: 4, fill: 'var(--color-leads)' }}
                  />
                </LineChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radar className="h-5 w-5 text-blue-500" />
            Marketing de Proximidade (ROI)
          </CardTitle>
          <CardDescription>
            Performance dos alertas de geolocalização disparados aos usuários
            próximos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 text-center sm:text-left flex flex-col items-center sm:items-start">
              <span className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">
                Alertas Disparados
              </span>
              <span className="block text-4xl font-black text-slate-800">
                {totalAlertsSent}
              </span>
            </div>
            <div className="bg-emerald-50/50 p-6 rounded-xl border border-emerald-100 text-center sm:text-left flex flex-col items-center sm:items-start">
              <span className="text-sm font-medium text-emerald-600 uppercase tracking-wider mb-1">
                Cupons Utilizados via Alerta
              </span>
              <span className="block text-4xl font-black text-emerald-600">
                {totalAlertsRedeemed}
              </span>
              <span className="text-xs text-emerald-500 font-medium mt-1">
                {totalAlertsSent > 0
                  ? Math.round((totalAlertsRedeemed / totalAlertsSent) * 100)
                  : 0}
                % de conversão
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
