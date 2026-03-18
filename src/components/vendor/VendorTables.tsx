import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useLanguage } from '@/stores/LanguageContext'
import { MOCK_VALIDATION_LOGS } from '@/lib/data'
import { Booking, Coupon } from '@/lib/types'

export function OrdersTable({ orders }: { orders: Booking[] }) {
  const { t, formatDate } = useLanguage()
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('vendor.incoming_orders')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('vendor.date')}</TableHead>
              <TableHead>{t('vendor.customer')}</TableHead>
              <TableHead>{t('vendor.details')}</TableHead>
              <TableHead>{t('vendor.status')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center text-muted-foreground"
                >
                  {t('vendor.no_orders')}
                </TableCell>
              </TableRow>
            )}
            {orders.map((o) => (
              <TableRow key={o.id}>
                <TableCell>{formatDate(o.date)}</TableCell>
                <TableCell>{o.userName || 'Guest'}</TableCell>
                <TableCell>
                  {o.storeName} - {o.guests} guests
                </TableCell>
                <TableCell>
                  <Badge>{o.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export function OffersTable({ offers }: { offers: Coupon[] }) {
  const { t, formatDate } = useLanguage()
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('vendor.active_campaigns')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('vendor.title')}</TableHead>
              <TableHead>{t('vendor.validity')}</TableHead>
              <TableHead>{t('vendor.stock')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {offers.map((c) => (
              <TableRow key={c.id}>
                <TableCell>{c.title}</TableCell>
                <TableCell>{formatDate(c.expiryDate)}</TableCell>
                <TableCell>
                  {c.reservedCount} / {c.totalAvailable}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export function HistoryTable() {
  const { t, formatDate } = useLanguage()
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('vendor.redemption_history')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('vendor.time')}</TableHead>
              <TableHead>{t('vendor.customer')}</TableHead>
              <TableHead>{t('vendor.coupon')}</TableHead>
              <TableHead>{t('vendor.method')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_VALIDATION_LOGS.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{formatDate(log.validatedAt)}</TableCell>
                <TableCell>{log.customerName}</TableCell>
                <TableCell>{log.couponTitle}</TableCell>
                <TableCell className="uppercase">{log.method}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
