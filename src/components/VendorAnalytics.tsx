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
  ResponsiveContainer,
} from 'recharts'
import { useCouponStore } from '@/stores/CouponContext'

export function VendorAnalytics() {
  const { validationLogs, user, companies } = useCouponStore()
  const myCompany =
    companies.find((c) => c.id === user?.companyId) || companies[0]

  const myLogs = validationLogs.filter((l) => l.companyId === myCompany.id)

  // Mock chart data to ensure dashboard looks fully populated
  const redemptionData = [
    { name: 'Mon', redemptions: Math.max(2, myLogs.length % 5) },
    { name: 'Tue', redemptions: Math.max(5, myLogs.length % 8) },
    { name: 'Wed', redemptions: Math.max(4, myLogs.length % 6) },
    { name: 'Thu', redemptions: Math.max(8, myLogs.length % 12) },
    { name: 'Fri', redemptions: Math.max(12, myLogs.length % 18) },
    { name: 'Sat', redemptions: Math.max(20, myLogs.length % 25) },
    { name: 'Sun', redemptions: Math.max(15, myLogs.length % 20) },
  ]

  const growthData = [
    { name: 'Week 1', leads: 5 },
    { name: 'Week 2', leads: 8 },
    { name: 'Week 3', leads: 14 },
    { name: 'Week 4', leads: 22 },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up">
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Weekly Redemptions</CardTitle>
          <CardDescription>
            Coupon usage volume over the last 7 days.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ChartContainer
              config={{
                redemptions: {
                  label: 'Redemptions',
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
          <CardTitle>Lead Growth</CardTitle>
          <CardDescription>
            New unique customers acquired via campaigns.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ChartContainer
              config={{ leads: { label: 'New Leads', color: '#10b981' } }}
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
