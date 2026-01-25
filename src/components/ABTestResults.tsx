import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ABTest } from '@/lib/types'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'

interface ABTestResultsProps {
  test: ABTest
}

export function ABTestResults({ test }: ABTestResultsProps) {
  const totalViews = test.variantA.views + test.variantB.views
  const totalClicks = test.variantA.clicks + test.variantB.clicks

  const data = [
    { name: 'Views', A: test.variantA.views, B: test.variantB.views },
    { name: 'Clicks', A: test.variantA.clicks, B: test.variantB.clicks },
    {
      name: 'Resgates',
      A: test.variantA.redemptions,
      B: test.variantB.redemptions,
    },
  ]

  const conversionA =
    (test.variantA.redemptions / test.variantA.views) * 100 || 0
  const conversionB =
    (test.variantB.redemptions / test.variantB.views) * 100 || 0
  const winner = conversionA > conversionB ? 'A' : 'B'
  const improvement =
    winner === 'A'
      ? (((conversionA - conversionB) / conversionB) * 100).toFixed(1)
      : (((conversionB - conversionA) / conversionA) * 100).toFixed(1)

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-bold">
              Teste: {test.variantB.name}
            </CardTitle>
            <CardDescription>
              Iniciado em {new Date(test.startDate).toLocaleDateString()}
            </CardDescription>
          </div>
          <Badge variant={test.status === 'active' ? 'default' : 'secondary'}>
            {test.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Tráfego Total
            </p>
            <p className="text-2xl font-bold">{totalViews}</p>
            <Progress value={50} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>A: 50%</span>
              <span>B: 50%</span>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Engajamento (Clicks)
            </p>
            <p className="text-2xl font-bold">{totalClicks}</p>
            <div className="flex gap-2 items-center text-sm">
              <span className="text-blue-600 font-bold">
                A: {test.variantA.clicks}
              </span>
              <span className="text-purple-600 font-bold">
                B: {test.variantB.clicks}
              </span>
            </div>
          </div>
          <div className="space-y-2 bg-green-50 p-3 rounded-lg border border-green-100">
            <p className="text-sm font-medium text-green-800">
              Melhor Performance
            </p>
            <p className="text-2xl font-bold text-green-700">Versão {winner}</p>
            <p className="text-xs text-green-600">
              Taxa de conversão +{improvement}% superior
            </p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ChartContainer
            config={{
              A: { label: 'Versão A', color: 'hsl(var(--primary))' },
              B: { label: 'Versão B', color: '#8b5cf6' },
            }}
            className="h-full w-full"
          >
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip content={<ChartTooltipContent />} />
              <Bar dataKey="A" fill="var(--color-A)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="B" fill="var(--color-B)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}
