import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import {
  Activity,
  Server,
  Users,
  Database,
  Heart,
  CheckCircle2,
  AlertTriangle,
  Link2,
} from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'
import { useCouponStore } from '@/stores/CouponContext'

const generateData = () => {
  const now = new Date()
  return Array.from({ length: 20 }).map((_, i) => ({
    time: new Date(now.getTime() - (19 - i) * 60000).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    }),
    latency: Math.floor(Math.random() * 50) + 20,
    dbLatency: Math.floor(Math.random() * 30) + 10,
    users: Math.floor(Math.random() * 1000) + 5000,
  }))
}

export function AdminPerformanceTab() {
  const { t } = useLanguage()
  const { coupons } = useCouponStore()
  const [data, setData] = useState(generateData())

  const now = new Date()
  const activeOffers = coupons.filter(
    (c) => c.status === 'active' || c.status === 'approved',
  ).length
  const expiredOffers = coupons.filter((c) => {
    const end = c.endDate || c.expiryDate
    return end && new Date(end) < now
  }).length

  const sourceCounts = coupons.reduce(
    (acc, c) => {
      const source = c.source || 'organic'
      acc[source] = (acc[source] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const sourceChartData = Object.entries(sourceCounts).map(([name, count]) => ({
    source: name.charAt(0).toUpperCase() + name.slice(1),
    count,
  }))

  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) => {
        const newData = [...prev.slice(1)]
        const last = prev[prev.length - 1]
        newData.push({
          time: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          latency: Math.floor(Math.random() * 50) + 20,
          dbLatency: Math.floor(Math.random() * 30) + 10,
          users: last.users + Math.floor(Math.random() * 100) - 50,
        })
        return newData
      })
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const popularOffers = [
    {
      title: t('admin.performance.mock.offer1', '50% OFF Nike'),
      favorites: 1420,
    },
    {
      title: t(
        'admin.performance.mock.offer2',
        'Buy 1 Get 2 - Brooklyn Coffee',
      ),
      favorites: 950,
    },
    {
      title: t('admin.performance.mock.offer3', 'Echo Dot (5th Gen)'),
      favorites: 834,
    },
    {
      title: t('admin.performance.mock.offer4', '20% Off Queens Pizza'),
      favorites: 521,
    },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {t('admin.performance.title', 'System Performance')}
        </h2>
        <p className="text-muted-foreground">
          {t(
            'admin.performance.desc',
            'Real-time visualization of server metrics and active sessions.',
          )}
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4 tracking-tight flex items-center gap-2">
          <Link2 className="h-5 w-5 text-slate-500" />
          {t('admin.performance.sources_title', 'Sources & Offers Performance')}
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card className="bg-primary/5 border-primary/20 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('admin.performance.active_offers', 'Active Offers')}
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {activeOffers}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {t(
                  'admin.performance.active_offers_desc',
                  'Currently valid coupons',
                )}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-amber-500/5 border-amber-500/20 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-amber-900">
                {t('admin.performance.expired_offers', 'Expired Offers')}
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">
                {expiredOffers}
              </div>
              <p className="text-xs text-amber-700/70 mt-1">
                {t(
                  'admin.performance.expired_offers_desc',
                  'Inactive or past coupons',
                )}
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('admin.performance.sources_dist', 'Sources Distribution')}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="h-[60px]">
                <ChartContainer
                  config={{
                    count: {
                      label: t('admin.performance.offers_count', 'Offers'),
                      color: 'hsl(var(--primary))',
                    },
                  }}
                >
                  <BarChart
                    data={sourceChartData}
                    margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                  >
                    <XAxis dataKey="source" hide />
                    <ChartTooltip
                      content={<ChartTooltipContent />}
                      cursor={{ fill: 'var(--color-count)', opacity: 0.1 }}
                    />
                    <Bar
                      dataKey="count"
                      fill="var(--color-count)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('admin.performance.avg_server_latency', 'Avg Server Latency')}
            </CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data[data.length - 1].latency} ms
            </div>
            <p className="text-xs text-muted-foreground">
              {t('admin.performance.optimal_100ms', 'Optimal < 100ms')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('admin.performance.db_latency', 'Database Latency')}
            </CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data[data.length - 1].dbLatency} ms
            </div>
            <p className="text-xs text-muted-foreground">
              {t('admin.performance.optimal_50ms', 'Optimal < 50ms')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('admin.performance.active_sessions', 'Active Sessions')}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data[data.length - 1].users.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('admin.performance.concurrent_users', 'Concurrent Users')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('admin.performance.system_health', 'System Health')}
            </CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">99.99%</div>
            <p className="text-xs text-muted-foreground">
              {t('admin.performance.uptime_month', 'Uptime this month')}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              {t('admin.performance.response_times', 'Response Times (ms)')}
            </CardTitle>
            <CardDescription>
              {t('admin.performance.server_db_latency', 'Server & DB Latency')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ChartContainer
                config={{
                  latency: {
                    label: t(
                      'admin.performance.server_latency_chart',
                      'Server Latency',
                    ),
                    color: 'hsl(var(--primary))',
                  },
                  dbLatency: {
                    label: t(
                      'admin.performance.db_latency_chart',
                      'DB Latency',
                    ),
                    color: 'hsl(var(--destructive))',
                  },
                }}
              >
                <LineChart
                  data={data}
                  margin={{ top: 5, right: 10, left: 10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="time"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="latency"
                    stroke="var(--color-latency)"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="dbLatency"
                    stroke="var(--color-dbLatency)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {t('admin.performance.concurrent_users', 'Concurrent Users')}
            </CardTitle>
            <CardDescription>
              {t(
                'admin.performance.active_sessions_time',
                'Active Sessions over time',
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ChartContainer
                config={{
                  users: {
                    label: t('admin.performance.users_chart', 'Users'),
                    color: 'hsl(var(--chart-2))',
                  },
                }}
              >
                <AreaChart
                  data={data}
                  margin={{ top: 5, right: 10, left: 10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="time"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    domain={['auto', 'auto']}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="users"
                    stroke="var(--color-users)"
                    fill="var(--color-users)"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {t('admin.performance.top_offers', 'Top Favorited Offers')}
          </CardTitle>
          <CardDescription>
            {t(
              'admin.performance.top_offers_desc',
              'Most popular items saved by users.',
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {popularOffers.map((offer, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0"
              >
                <span className="font-medium text-slate-800">
                  {offer.title}
                </span>
                <div className="flex items-center gap-2 text-slate-600">
                  <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                  <span className="font-semibold text-sm">
                    {offer.favorites.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
