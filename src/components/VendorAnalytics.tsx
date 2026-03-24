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
import { useCouponStore } from '@/stores/CouponContext'

export function VendorAnalytics() {
  const { validationLogs, user, companies } = useCouponStore()
  const myCompany =
    companies.find((c) => c.id === user?.companyId) || companies[0]

  const myLogs = validationLogs.filter((l) => l.companyId === myCompany.id)

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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up">
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
  )
}
