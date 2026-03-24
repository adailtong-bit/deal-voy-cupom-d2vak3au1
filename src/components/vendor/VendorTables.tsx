import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useLanguage } from '@/stores/LanguageContext'
import { useCouponStore } from '@/stores/CouponContext'

export function OrdersTable({ orders }: any) {
  const { formatDate } = useLanguage()
  const myOrders = orders || []

  if (myOrders.length === 0)
    return (
      <div className="text-center p-12 text-muted-foreground border border-dashed rounded-lg bg-white">
        Nenhum pedido encontrado.
      </div>
    )

  return (
    <div className="rounded-lg border bg-white shadow-sm overflow-hidden animate-fade-in-up">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead className="font-semibold">ID do Pedido</TableHead>
            <TableHead className="font-semibold">Cliente</TableHead>
            <TableHead className="font-semibold">Data</TableHead>
            <TableHead className="font-semibold">Tipo</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {myOrders.map((o: any) => (
            <TableRow key={o.id} className="hover:bg-slate-50/50">
              <TableCell className="font-mono text-xs text-slate-500 uppercase">
                {o.id}
              </TableCell>
              <TableCell className="font-medium text-slate-800">
                {o.userName}
              </TableCell>
              <TableCell className="text-slate-600">
                {formatDate(o.date)}
              </TableCell>
              <TableCell className="capitalize text-slate-600">
                {o.type || 'geral'}
              </TableCell>
              <TableCell>
                <Badge
                  variant={o.status === 'confirmed' ? 'default' : 'secondary'}
                  className={o.status === 'confirmed' ? 'bg-emerald-500' : ''}
                >
                  {o.status === 'confirmed'
                    ? 'Confirmado'
                    : o.status === 'pending'
                      ? 'Pendente'
                      : o.status === 'cancelled'
                        ? 'Cancelado'
                        : o.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export function OffersTable({ offers }: any) {
  const { formatDate } = useLanguage()

  if (!offers || offers.length === 0)
    return (
      <div className="text-center p-12 text-muted-foreground border border-dashed rounded-lg bg-white">
        Nenhuma oferta encontrada.
      </div>
    )

  return (
    <div className="rounded-lg border bg-white shadow-sm overflow-hidden animate-fade-in-up">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead className="font-semibold">Nome da Campanha</TableHead>
            <TableHead className="font-semibold">Desconto</TableHead>
            <TableHead className="font-semibold">Resgatados</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">Expira em</TableHead>
            <TableHead className="font-semibold text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {offers.map((o: any) => (
            <TableRow key={o.id} className="hover:bg-slate-50/50">
              <TableCell className="font-semibold text-slate-800 max-w-[200px] truncate">
                {o.title}
              </TableCell>
              <TableCell className="text-primary font-bold">
                {o.discount}
              </TableCell>
              <TableCell className="text-slate-600">
                <span className="font-medium text-slate-900">
                  {o.reservedCount || 0}
                </span>{' '}
                / {o.totalLimit || o.totalAvailable || '∞'}
              </TableCell>
              <TableCell>
                <Badge
                  variant={o.status === 'active' ? 'default' : 'secondary'}
                >
                  {o.status === 'active'
                    ? 'Ativo'
                    : o.status === 'expired'
                      ? 'Expirado'
                      : o.status === 'used'
                        ? 'Usado'
                        : o.status}
                </Badge>
              </TableCell>
              <TableCell className="text-slate-500 text-sm">
                {o.expiryDate ? formatDate(o.expiryDate) : 'N/D'}
              </TableCell>
              <TableCell className="text-right">
                <Button asChild variant="outline" size="sm" className="h-8">
                  <Link to={`/voucher/${o.id}`} target="_blank">
                    <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> Acessar
                    Página
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export function HistoryTable() {
  const { validationLogs, user, companies } = useCouponStore()
  const myCompany =
    companies.find((c) => c.id === user?.companyId) || companies[0]
  const logs = validationLogs
    .filter((l) => l.companyId === myCompany.id)
    .sort(
      (a, b) =>
        new Date(b.validatedAt).getTime() - new Date(a.validatedAt).getTime(),
    )

  if (logs.length === 0)
    return (
      <div className="text-center p-12 text-muted-foreground border border-dashed rounded-lg bg-white">
        Nenhum histórico de resgates.
      </div>
    )

  return (
    <div className="rounded-lg border bg-white shadow-sm overflow-hidden animate-fade-in-up">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead className="font-semibold">Data & Hora</TableHead>
            <TableHead className="font-semibold">Campanha</TableHead>
            <TableHead className="font-semibold">Cliente</TableHead>
            <TableHead className="font-semibold">Método</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((l: any) => (
            <TableRow key={l.id} className="hover:bg-slate-50/50">
              <TableCell className="whitespace-nowrap text-slate-500 text-sm">
                {new Date(l.validatedAt).toLocaleString('pt-BR')}
              </TableCell>
              <TableCell className="font-medium text-slate-800 max-w-[200px] truncate">
                {l.couponTitle}
              </TableCell>
              <TableCell className="text-slate-700">{l.customerName}</TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className="uppercase text-[10px] tracking-wider font-bold bg-slate-50"
                >
                  {l.method}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
