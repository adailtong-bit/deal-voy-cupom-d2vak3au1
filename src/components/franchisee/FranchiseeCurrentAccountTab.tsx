import { useLanguage } from '@/stores/LanguageContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ArrowDownRight, ArrowUpRight, Wallet } from 'lucide-react'
import { useCouponStore } from '@/stores/CouponContext'

export function FranchiseeCurrentAccountTab({
  franchiseId,
}: {
  franchiseId: string
}) {
  const { formatCurrency, formatDate } = useLanguage()
  const { partnerInvoices, ads, platformSettings } = useCouponStore()

  const royaltyRate = platformSettings.franchiseRoyaltyRate || 15

  // Generate dynamic transactions based on actual franchise activity
  const regionalAds = ads.filter((a) => a.franchiseId === franchiseId)

  // 1. Ad Sales Income
  const adIncomes = regionalAds.map((ad, i) => ({
    id: `ad_inc_${ad.id}`,
    date: ad.startDate || new Date().toISOString(),
    desc: `Venda de Publicidade Regional: ${ad.title}`,
    amount: ad.price || ad.budget || 0,
    type: 'in',
    status: 'completed',
  }))

  // 2. Royalty Payments (Outflow)
  const royaltyPayments = regionalAds.map((ad, i) => ({
    id: `royalty_${ad.id}`,
    date: ad.startDate || new Date().toISOString(),
    desc: `Repasse de Royalties (${royaltyRate}%): ${ad.title}`,
    amount: (ad.price || ad.budget || 0) * (royaltyRate / 100),
    type: 'out',
    status: 'completed',
  }))

  // 3. Optional: Paid Invoices from local merchants
  const paidInvoices = partnerInvoices
    .filter((inv) => inv.status === 'paid')
    .map((inv) => ({
      id: `inv_${inv.id}`,
      date: inv.issueDate,
      desc: `Faturamento Lojista: ${inv.referenceNumber}`,
      amount: inv.totalCommission,
      type: 'in',
      status: 'completed',
    }))

  const allTransactions = [...adIncomes, ...royaltyPayments, ...paidInvoices]
    .filter((t) => t.amount > 0)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // Add dummy initial balance if empty for better visualization
  if (allTransactions.length === 0) {
    allTransactions.push({
      id: 'initial',
      date: new Date(Date.now() - 30 * 86400000).toISOString(),
      desc: 'Depósito Inicial / Saldo Anterior',
      amount: 1000,
      type: 'in',
      status: 'completed',
    })
  }

  const inflows = allTransactions
    .filter((t) => t.type === 'in')
    .reduce((acc, t) => acc + t.amount, 0)
  const outflows = allTransactions
    .filter((t) => t.type === 'out')
    .reduce((acc, t) => acc + t.amount, 0)
  const balance = inflows - outflows

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-slate-100 rounded-full text-slate-600">
                <Wallet className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                Saldo Atual
              </p>
            </div>
            <h3 className="text-2xl font-bold">{formatCurrency(balance)}</h3>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-full text-green-600">
                <ArrowUpRight className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                Entradas
              </p>
            </div>
            <h3 className="text-2xl font-bold text-green-600">
              {formatCurrency(inflows)}
            </h3>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-red-100 rounded-full text-red-600">
                <ArrowDownRight className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                Saídas
              </p>
            </div>
            <h3 className="text-2xl font-bold text-red-600">
              {formatCurrency(outflows)}
            </h3>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Extrato Financeiro</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allTransactions.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="text-sm">
                    {formatDate(t.date)}
                  </TableCell>
                  <TableCell className="font-medium">{t.desc}</TableCell>
                  <TableCell>
                    {t.type === 'in' ? (
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200"
                      >
                        Entrada
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-red-50 text-red-700 border-red-200"
                      >
                        Saída
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100">
                      Concluído
                    </Badge>
                  </TableCell>
                  <TableCell
                    className={`text-right font-bold ${t.type === 'in' ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {t.type === 'in' ? '+' : '-'}
                    {formatCurrency(t.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
