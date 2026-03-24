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
  const { formatDate } = useLanguage()
  const myOrders = orders || []

  if (myOrders.length === 0)
    return (
      <div className="text-center p-12 text-muted-foreground border border-dashed rounded-lg bg-white">
        No orders found.
      </div>
    )

  return (
    <div className="rounded-lg border bg-white shadow-sm overflow-hidden animate-fade-in-up">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead className="font-semibold">Order ID</TableHead>
            <TableHead className="font-semibold">Customer</TableHead>
            <TableHead className="font-semibold">Date</TableHead>
            <TableHead className="font-semibold">Type</TableHead>
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
                {o.type || 'general'}
              </TableCell>
              <TableCell>
                <Badge
                  variant={o.status === 'confirmed' ? 'default' : 'secondary'}
                  className={o.status === 'confirmed' ? 'bg-emerald-500' : ''}
                >
                  {o.status}
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
        No offers found.
      </div>
    )

  return (
    <div className="rounded-lg border bg-white shadow-sm overflow-hidden animate-fade-in-up">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead className="font-semibold">Campaign Name</TableHead>
            <TableHead className="font-semibold">Discount</TableHead>
            <TableHead className="font-semibold">Redeemed</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">Expires</TableHead>
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
                  {o.status}
                </Badge>
              </TableCell>
              <TableCell className="text-slate-500 text-sm">
                {o.expiryDate ? formatDate(o.expiryDate) : 'N/A'}
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
        No redemption history.
      </div>
    )

  return (
    <div className="rounded-lg border bg-white shadow-sm overflow-hidden animate-fade-in-up">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead className="font-semibold">Date & Time</TableHead>
            <TableHead className="font-semibold">Campaign</TableHead>
            <TableHead className="font-semibold">Customer</TableHead>
            <TableHead className="font-semibold">Method</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((l: any) => (
            <TableRow key={l.id} className="hover:bg-slate-50/50">
              <TableCell className="whitespace-nowrap text-slate-500 text-sm">
                {new Date(l.validatedAt).toLocaleString()}
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
