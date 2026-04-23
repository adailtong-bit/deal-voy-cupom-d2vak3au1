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
import { Target } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

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

    if (viewLevel === 'franchise') {
      result = franchises.map((f) => {
        const fLogs = validationLogs.filter(
          (l) =>
            l.franchiseId === f.id ||
            companies.find((c) => c.id === l.companyId)?.franchiseId === f.id,
        )
        return {
          id: f.id,
          name: f.name,
          redemptions: fLogs.length,
          clicks: fLogs.length * 3 + Math.floor(Math.random() * 50),
          revenue: fLogs.length * 45,
        }
      })
    } else if (viewLevel === 'merchant') {
      const targetCompanies = franchiseId
        ? companies.filter((c) => c.franchiseId === franchiseId)
        : companies
      result = targetCompanies
        .map((c) => {
          const cLogs = baseLogs.filter((l) => l.companyId === c.id)
          return {
            id: c.id,
            name: c.name,
            redemptions: cLogs.length,
            clicks: cLogs.length * 4 + Math.floor(Math.random() * 20),
            revenue: cLogs.length * 50,
          }
        })
        .sort((a, b) => b.redemptions - a.redemptions)
        .slice(0, 20)
    } else if (viewLevel === 'campaign') {
      result = baseCoupons
        .map((c) => {
          const cLogs = baseLogs.filter((l) => l.couponId === c.id)
          const clicks = c.visitCount || c.clickCount || cLogs.length * 5 + 10
          return {
            id: c.id,
            name: c.title,
            category: c.category,
            redemptions: cLogs.length,
            clicks: clicks,
            revenue: cLogs.length * (c.price || 30),
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
          const clicks =
            catCoupons.reduce((sum, c) => sum + (c.visitCount || 0), 0) ||
            cLogs.length * 5 + 50
          return {
            id: cat,
            name: cat || 'Geral',
            redemptions: cLogs.length,
            clicks: clicks,
            revenue: cLogs.length * 40,
          }
        })
        .sort((a, b) => b.redemptions - a.redemptions)
    } else if (viewLevel === 'affiliate') {
      result = affiliates
        .map((a) => {
          const aTx = affiliateTx.filter((tx) => tx.affiliate_id === a.id)
          const sales = aTx.reduce(
            (sum, tx) => sum + (Number(tx.sale_amount) || 0),
            0,
          )
          return {
            id: a.id,
            name: a.name,
            redemptions: aTx.length,
            clicks: aTx.length * 10 + Math.floor(Math.random() * 100),
            revenue: sales,
          }
        })
        .sort((a, b) => b.revenue - a.revenue)
    } else {
      result = [
        {
          id: 'global',
          name: 'Visão Global',
          redemptions: baseLogs.length,
          clicks:
            baseCoupons.reduce((sum, c) => sum + (c.visitCount || 0), 0) ||
            baseLogs.length * 4 + 100,
          revenue: baseLogs.length * 40,
        },
      ]
    }

    return result
  }, [
    viewLevel,
    franchises,
    companies,
    coupons,
    validationLogs,
    affiliates,
    affiliateTx,
    franchiseId,
  ])

  const chartData = data.slice(0, 10)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border shadow-sm">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Desempenho Granular (CRM)
          </h3>
          <p className="text-sm text-slate-500">
            Meça o desempenho geral ou individual por nicho, campanha, lojista
            ou afiliado.
          </p>
        </div>
        <div className="w-full sm:w-64">
          <Select value={viewLevel} onValueChange={(v: any) => setViewLevel(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a visão" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="global">Visão Geral Global</SelectItem>
              {!franchiseId && (
                <SelectItem value="franchise">Por Franqueado</SelectItem>
              )}
              <SelectItem value="merchant">Por Lojista</SelectItem>
              {!franchiseId && (
                <SelectItem value="affiliate">Por Afiliado</SelectItem>
              )}
              <SelectItem value="campaign">Por Campanha (Oferta)</SelectItem>
              <SelectItem value="category">Por Nicho / Categoria</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Engajamento vs Conversão</CardTitle>
            <CardDescription>
              Comparativo de Cliques e Resgates no nível selecionado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ChartContainer
                config={{
                  clicks: { label: 'Cliques', color: 'hsl(var(--primary))' },
                  redemptions: {
                    label: 'Resgates/Vendas',
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
            <CardTitle>Ranking de Receita</CardTitle>
            <CardDescription>Top geradores de volume (R$)</CardDescription>
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
                      <p className="text-xs text-slate-500">
                        {item.redemptions} conversões
                      </p>
                    </div>
                    <div className="font-bold text-emerald-600 whitespace-nowrap">
                      R${' '}
                      {item.revenue.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                      })}
                    </div>
                  </div>
                ))}
              {chartData.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">
                  Sem dados para exibir.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalhamento Analítico</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Nome / Título</TableHead>
                  {viewLevel === 'campaign' && (
                    <TableHead>Nicho/Categoria</TableHead>
                  )}
                  <TableHead className="text-right">
                    Cliques (Tráfego)
                  </TableHead>
                  <TableHead className="text-right">Conversões</TableHead>
                  <TableHead className="text-right">Taxa (CR)</TableHead>
                  <TableHead className="text-right">Receita Estimada</TableHead>
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
                      <TableCell className="text-right font-bold">
                        R${' '}
                        {item.revenue.toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                        })}
                      </TableCell>
                    </TableRow>
                  )
                })}
                {data.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-6 text-slate-500"
                    >
                      Nenhum registro encontrado para esta visão.
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
