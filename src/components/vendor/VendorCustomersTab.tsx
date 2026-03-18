import { useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/stores/LanguageContext'
import { useCouponStore } from '@/stores/CouponContext'
import { Company } from '@/lib/types'
import { Star, StarOff } from 'lucide-react'
import { toast } from 'sonner'

export function VendorCustomersTab({ company }: { company: Company }) {
  const { formatDate } = useLanguage()
  const { validationLogs, coupons, users, togglePreferredCustomer } =
    useCouponStore()

  const myCoupons = useMemo(
    () => coupons.filter((c) => c.companyId === company.id).map((c) => c.id),
    [coupons, company.id],
  )

  const customers = useMemo(() => {
    const logs = validationLogs.filter(
      (log) => myCoupons.includes(log.couponId) && log.userId,
    )
    const map = new Map<
      string,
      {
        userId: string
        name: string
        email: string
        lastRedemption: string
        totalUsed: number
      }
    >()

    logs.forEach((log) => {
      if (!log.userId) return
      const existing = map.get(log.userId)
      if (existing) {
        existing.totalUsed += 1
        if (new Date(log.validatedAt) > new Date(existing.lastRedemption)) {
          existing.lastRedemption = log.validatedAt
        }
      } else {
        const u = users.find((u) => u.id === log.userId)
        map.set(log.userId, {
          userId: log.userId,
          name: u?.name || log.customerName,
          email: u?.email || 'Walk-in',
          lastRedemption: log.validatedAt,
          totalUsed: 1,
        })
      }
    })

    return Array.from(map.values())
  }, [validationLogs, myCoupons, users])

  const preferred = company.preferredCustomers || []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Consumption Users</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Last Redemption</TableHead>
              <TableHead>Total Coupons Used</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((c) => {
              const isPreferred = preferred.includes(c.userId)
              return (
                <TableRow key={c.userId}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>{c.email}</TableCell>
                  <TableCell>{formatDate(c.lastRedemption)}</TableCell>
                  <TableCell>{c.totalUsed}</TableCell>
                  <TableCell>
                    <Button
                      variant={isPreferred ? 'default' : 'outline'}
                      size="sm"
                      className="gap-2"
                      onClick={() => {
                        togglePreferredCustomer(company.id, c.userId)
                        toast.success(
                          isPreferred
                            ? 'Removed Preferred Status'
                            : 'Marked as Preferred',
                        )
                      }}
                    >
                      {isPreferred ? (
                        <Star className="h-4 w-4 fill-current" />
                      ) : (
                        <StarOff className="h-4 w-4" />
                      )}
                      {isPreferred ? 'Preferred' : 'Mark as Preferred'}
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
            {customers.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground py-8"
                >
                  No customers have redeemed offers yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
