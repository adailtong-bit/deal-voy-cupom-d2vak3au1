import { useState } from 'react'
import { useCouponStore } from '@/stores/CouponContext'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Button } from '@/components/ui/button'
import { Download, Filter, Search } from 'lucide-react'
import { format } from 'date-fns'

export function MerchantReports() {
  const { transactions } = useCouponStore()
  const [dateStart, setDateStart] = useState('')
  const [dateEnd, setDateEnd] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  const filteredTransactions = transactions.filter((tx) => {
    // Filter by date range
    if (dateStart && new Date(tx.date) < new Date(dateStart)) return false
    if (dateEnd) {
      const end = new Date(dateEnd)
      end.setHours(23, 59, 59)
      if (new Date(tx.date) > end) return false
    }

    // Filter by search query (Customer name or Coupon title)
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const customerMatch = tx.customerName?.toLowerCase().includes(query)
      const couponMatch = tx.couponTitle?.toLowerCase().includes(query)
      if (!customerMatch && !couponMatch) return false
    }

    // Filter by type (method)
    if (typeFilter !== 'all' && tx.method !== typeFilter) return false

    return true
  })

  const totalPoints = filteredTransactions.reduce(
    (acc, curr) => acc + (curr.pointsAwarded || 0),
    0,
  )
  const totalRevenue = filteredTransactions.reduce(
    (acc, curr) => acc + curr.amount,
    0,
  )

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-white p-4 rounded-lg shadow-sm border">
        <div className="space-y-2">
          <Label>Data Início</Label>
          <Input
            type="date"
            value={dateStart}
            onChange={(e) => setDateStart(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Data Fim</Label>
          <Input
            type="date"
            value={dateEnd}
            onChange={(e) => setDateEnd(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Buscar</Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cliente ou Cupom..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Método</Label>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="card">Cartão</SelectItem>
              <SelectItem value="wallet">Carteira Digital</SelectItem>
              <SelectItem value="fetch">Pontos Fetch</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-[#4CAF50]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pontos Distribuídos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#4CAF50]">
              {totalPoints} pts
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-[#2196F3]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Transações Filtradas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#2196F3]">
              {filteredTransactions.length}
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-[#FF5722]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Volume Financeiro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#FF5722]">
              R$ {totalRevenue.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Relatório de Transações</CardTitle>
            <CardDescription>
              Detalhamento de consumo e pontuação por cliente.
            </CardDescription>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" /> Exportar CSV
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Cupom Utilizado</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Parcelas</TableHead>
                <TableHead className="text-right">Pontos</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Nenhum dado encontrado para os filtros selecionados.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>
                      {format(new Date(tx.date), 'dd/MM/yyyy HH:mm')}
                    </TableCell>
                    <TableCell className="font-medium">
                      {tx.customerName || 'N/A'}
                    </TableCell>
                    <TableCell>{tx.couponTitle}</TableCell>
                    <TableCell className="capitalize">
                      {tx.method === 'wallet' ? 'Carteira Digital' : tx.method}
                    </TableCell>
                    <TableCell>{tx.installments || 1}x</TableCell>
                    <TableCell className="text-right text-[#4CAF50] font-bold">
                      +{tx.pointsAwarded || 0}
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      R$ {tx.amount.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
