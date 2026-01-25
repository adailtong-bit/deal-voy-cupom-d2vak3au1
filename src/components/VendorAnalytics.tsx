import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from 'recharts'

const performanceData = [
  { day: 'Seg', visitors: 120, redeems: 45 },
  { day: 'Ter', visitors: 150, redeems: 52 },
  { day: 'Qua', visitors: 180, redeems: 68 },
  { day: 'Qui', visitors: 220, redeems: 85 },
  { day: 'Sex', visitors: 350, redeems: 145 },
  { day: 'Sab', visitors: 420, redeems: 180 },
  { day: 'Dom', visitors: 380, redeems: 160 },
]

const benchmarkData = [
  { metric: 'Visualizações', you: 120, market: 110, fullMark: 150 },
  { metric: 'Cliques', you: 98, market: 90, fullMark: 150 },
  { metric: 'Conversão', you: 86, market: 80, fullMark: 150 },
  { metric: 'Retenção', you: 99, market: 70, fullMark: 150 },
  { metric: 'Ticket Médio', you: 65, market: 85, fullMark: 150 },
]

const chartConfig = {
  visitors: {
    label: 'Visitantes',
    color: 'hsl(var(--chart-1))',
  },
  redeems: {
    label: 'Resgates',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig

const radarConfig = {
  you: {
    label: 'Sua Loja',
    color: 'hsl(var(--primary))',
  },
  market: {
    label: 'Média Mercado',
    color: 'hsl(var(--muted-foreground))',
  },
} satisfies ChartConfig

export function VendorAnalytics() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle>Desempenho Semanal</CardTitle>
          <CardDescription>
            Visualizações vs Resgates de Ofertas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <AreaChart
              data={performanceData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="fillVisitors" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-visitors)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-visitors)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id="fillRedeems" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-redeems)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-redeems)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="visitors"
                stroke="var(--color-visitors)"
                fillOpacity={1}
                fill="url(#fillVisitors)"
              />
              <Area
                type="monotone"
                dataKey="redeems"
                stroke="var(--color-redeems)"
                fillOpacity={1}
                fill="url(#fillRedeems)"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Benchmarking de Mercado</CardTitle>
          <CardDescription>Sua performance vs Concorrentes</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={radarConfig}
            className="h-[250px] w-full mx-auto"
          >
            <RadarChart
              cx="50%"
              cy="50%"
              outerRadius="80%"
              data={benchmarkData}
            >
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Radar
                name="Sua Loja"
                dataKey="you"
                stroke="var(--color-you)"
                fill="var(--color-you)"
                fillOpacity={0.6}
              />
              <Radar
                name="Mercado"
                dataKey="market"
                stroke="var(--color-market)"
                fill="var(--color-market)"
                fillOpacity={0.3}
              />
            </RadarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Perfil do Consumidor</CardTitle>
          <CardDescription>Categorias de maior interesse</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="h-[250px] w-full">
            <BarChart
              data={[
                { category: 'Alimentação', value: 450 },
                { category: 'Lazer', value: 320 },
                { category: 'Moda', value: 210 },
                { category: 'Serviços', value: 150 },
              ]}
              layout="vertical"
              margin={{ left: 0 }}
            >
              <CartesianGrid horizontal={false} />
              <XAxis type="number" hide />
              <Bar
                dataKey="value"
                fill="hsl(var(--primary))"
                radius={4}
                barSize={32}
              />
            </BarChart>
          </ChartContainer>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Alimentação</span>
              <span className="font-bold">40%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Lazer</span>
              <span className="font-bold">28%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Moda</span>
              <span className="font-bold">19%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
