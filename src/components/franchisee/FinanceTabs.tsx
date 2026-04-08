import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Receipt,
  Download,
  TrendingUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function FinanceTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Visão Financeira</h2>
        <p className="text-muted-foreground">
          Acompanhe as métricas financeiras gerais da sua franquia.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 45.231,89</div>
            <p className="text-xs text-emerald-600 flex items-center mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" /> +20.1% este mês
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 12.034,50</div>
            <p className="text-xs text-red-600 flex items-center mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" /> +4.5% este mês
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
            <TrendingUp className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 33.197,39</div>
            <p className="text-xs text-emerald-600 flex items-center mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" /> +12.3% este mês
            </p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Últimas Transações</CardTitle>
          <CardDescription>
            Histórico de repasses e recebimentos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-none">
                      Repasse Lojista #{1000 + i}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Hoje às 14:32
                    </p>
                  </div>
                </div>
                <div className="font-medium text-emerald-600">
                  + R$ {(Math.random() * 1000).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function BillingTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Faturamento e Cobranças
          </h2>
          <p className="text-muted-foreground">
            Gerencie faturas e métodos de pagamento.
          </p>
        </div>
        <Button>
          <CreditCard className="w-4 h-4 mr-2" /> Novo Cartão
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Faturas Recentes</CardTitle>
          <CardDescription>
            Visualize ou baixe o histórico de cobranças.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                id: 'FAT-2023-10',
                status: 'Pago',
                amount: 'R$ 1.500,00',
                date: '01/10/2023',
              },
              {
                id: 'FAT-2023-09',
                status: 'Pago',
                amount: 'R$ 1.500,00',
                date: '01/09/2023',
              },
              {
                id: 'FAT-2023-08',
                status: 'Pago',
                amount: 'R$ 1.500,00',
                date: '01/08/2023',
              },
            ].map((f) => (
              <div
                key={f.id}
                className="flex items-center justify-between border p-4 rounded-lg bg-slate-50/50"
              >
                <div className="flex items-center gap-4">
                  <Receipt className="h-8 w-8 text-slate-400" />
                  <div>
                    <p className="text-sm font-bold">{f.id}</p>
                    <p className="text-xs text-slate-500">
                      Vencimento em {f.date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-medium">{f.amount}</span>
                  <Badge
                    variant="default"
                    className="bg-emerald-500 hover:bg-emerald-600"
                  >
                    {f.status}
                  </Badge>
                  <Button variant="ghost" size="icon">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function MonetizationTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Monetização</h2>
        <p className="text-muted-foreground">
          Configuração de taxas e comissões da sua rede.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Taxa de Setup Lojista</CardTitle>
            <CardDescription>
              Valor cobrado na adesão de novos estabelecimentos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-4 text-slate-800">
              R$ 299,00
            </div>
            <Button variant="outline" className="w-full">
              Ajustar Valor
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Comissão sobre Vendas</CardTitle>
            <CardDescription>
              Percentual retido por transação via app.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-4 text-slate-800">12%</div>
            <Button variant="outline" className="w-full">
              Ajustar Margem
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export function AdsRoyaltiesTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Ads & Royalties</h2>
        <p className="text-muted-foreground">
          Receitas de publicidade e repasses da franqueadora.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Ganhos com Anúncios (Rede)</CardTitle>
          <CardDescription>
            Receita gerada por banners e espaços patrocinados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-primary mb-2">
            R$ 8.450,00
          </div>
          <p className="text-sm text-slate-500 mb-6">
            Acumulado no mês atual. O repasse será realizado dia 05.
          </p>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm border-b pb-2">
              <span className="text-slate-600">Banner Principal App</span>
              <span className="font-bold text-slate-800">R$ 4.200,00</span>
            </div>
            <div className="flex justify-between items-center text-sm border-b pb-2">
              <span className="text-slate-600">Destaque na Busca</span>
              <span className="font-bold text-slate-800">R$ 3.100,00</span>
            </div>
            <div className="flex justify-between items-center text-sm pb-2">
              <span className="text-slate-600">Notificações Push</span>
              <span className="font-bold text-slate-800">R$ 1.150,00</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
