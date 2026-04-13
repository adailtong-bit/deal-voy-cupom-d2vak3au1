import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useLanguage } from '@/stores/LanguageContext'
import { useCouponStore } from '@/stores/CouponContext'

export function OrdersTable({ orders }: any) {
  const { formatDate, t } = useLanguage()
  const myOrders = orders || []

  if (myOrders.length === 0)
    return (
      <div className="text-center p-12 text-muted-foreground border border-dashed rounded-lg bg-white">
        {t('vendor.tables.no_orders', 'Nenhum pedido encontrado.')}
      </div>
    )

  return (
    <div className="rounded-lg border bg-white shadow-sm overflow-hidden animate-fade-in-up">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead className="font-semibold">
              {t('vendor.tables.order_id', 'ID do Pedido')}
            </TableHead>
            <TableHead className="font-semibold">
              {t('vendor.tables.customer', 'Cliente')}
            </TableHead>
            <TableHead className="font-semibold">
              {t('vendor.tables.date', 'Data')}
            </TableHead>
            <TableHead className="font-semibold">
              {t('vendor.tables.type', 'Tipo')}
            </TableHead>
            <TableHead className="font-semibold">
              {t('vendor.tables.status', 'Status')}
            </TableHead>
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
                {o.type || t('vendor.tables.general', 'geral')}
              </TableCell>
              <TableCell>
                <Badge
                  variant={o.status === 'confirmed' ? 'default' : 'secondary'}
                  className={o.status === 'confirmed' ? 'bg-emerald-500' : ''}
                >
                  {o.status === 'confirmed'
                    ? t('vendor.tables.confirmed', 'Confirmado')
                    : o.status === 'pending'
                      ? t('vendor.tables.pending', 'Pendente')
                      : o.status === 'cancelled'
                        ? t('vendor.tables.cancelled', 'Cancelado')
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

export function HistoryTable() {
  const { validationLogs, user, companies } = useCouponStore()
  const { t, formatDate } = useLanguage()
  const myCompany =
    companies.find((c) => c.id === user?.companyId) || companies[0]
  const logs = myCompany
    ? validationLogs
        .filter((l) => l.companyId === myCompany.id)
        .sort(
          (a, b) =>
            new Date(b.validatedAt).getTime() -
            new Date(a.validatedAt).getTime(),
        )
    : []

  if (logs.length === 0)
    return (
      <div className="text-center p-12 text-muted-foreground border border-dashed rounded-lg bg-white">
        {t('vendor.tables.no_history', 'Nenhum histórico de resgates.')}
      </div>
    )

  return (
    <div className="rounded-lg border bg-white shadow-sm overflow-hidden animate-fade-in-up">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead className="font-semibold">
              {t('vendor.tables.datetime', 'Data & Hora')}
            </TableHead>
            <TableHead className="font-semibold">
              {t('vendor.tables.campaign', 'Campanha')}
            </TableHead>
            <TableHead className="font-semibold">
              {t('vendor.tables.customer', 'Cliente')}
            </TableHead>
            <TableHead className="font-semibold">
              {t('vendor.tables.method', 'Método')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((l: any) => (
            <TableRow key={l.id} className="hover:bg-slate-50/50">
              <TableCell className="whitespace-nowrap text-slate-500 text-sm">
                {formatDate(l.validatedAt)} {t('common.at', 'às')}{' '}
                {new Date(l.validatedAt).toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
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
