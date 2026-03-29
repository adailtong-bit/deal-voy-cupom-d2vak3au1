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
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Activity, Server, Users, Database, Heart } from 'lucide-react'

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
  const [data, setData] = useState(generateData())

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
    { title: '50% Nike', favorites: 1420 },
    { title: 'Compre 1 Leve 2 - Brooklyn Coffee', favorites: 950 },
    { title: 'Echo Dot (5ª Geração)', favorites: 834 },
    { title: '20% Off Queens Pizza', favorites: 521 },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          System Performance
        </h2>
        <p className="text-muted-foreground">
          Real-time visualization of server metrics and active sessions.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Server Latency
            </CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data[data.length - 1].latency} ms
            </div>
            <p className="text-xs text-muted-foreground">Optimal &lt; 100ms</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Database Latency
            </CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data[data.length - 1].dbLatency} ms
            </div>
            <p className="text-xs text-muted-foreground">Optimal &lt; 50ms</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Sessions
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data[data.length - 1].users.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Concurrent Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">99.99%</div>
            <p className="text-xs text-muted-foreground">Uptime this month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Response Times (ms)</CardTitle>
            <CardDescription>Server & DB Latency</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ChartContainer
                config={{
                  latency: {
                    label: 'Server Latency',
                    color: 'hsl(var(--primary))',
                  },
                  dbLatency: {
                    label: 'DB Latency',
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
            <CardTitle>Concurrent Users</CardTitle>
            <CardDescription>Active Sessions over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ChartContainer
                config={{
                  users: { label: 'Users', color: 'hsl(var(--chart-2))' },
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
          <CardTitle>Top Favorited Offers</CardTitle>
          <CardDescription>Most popular items saved by users.</CardDescription>
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
