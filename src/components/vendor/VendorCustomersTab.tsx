import { useMemo, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useLanguage } from '@/stores/LanguageContext'
import { useCouponStore } from '@/stores/CouponContext'
import { Company } from '@/lib/types'
import { Star, StarOff, Lock, Unlock, Users, BarChart2 } from 'lucide-react'
import { toast } from 'sonner'

export function VendorCustomersTab({ company }: { company: Company }) {
  const { formatDate } = useLanguage()
  const { validationLogs, coupons, users, togglePreferredCustomer } =
    useCouponStore()
  const [activeTab, setActiveTab] = useState('unlocked')

  const myCoupons = useMemo(
    () => coupons.filter((c) => c.companyId === company.id).map((c) => c.id),
    [coupons, company.id],
  )
  const myLogs = useMemo(
    () =>
      validationLogs.filter(
        (log) => myCoupons.includes(log.couponId) && log.userId,
      ),
    [validationLogs, myCoupons],
  )
  const myCustomerIds = useMemo(
    () => new Set(myLogs.map((log) => log.userId!)),
    [myLogs],
  )

  const customers = useMemo(() => {
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
    myLogs.forEach((log) => {
      if (!log.userId) return
      const existing = map.get(log.userId)
      if (existing) {
        existing.totalUsed += 1
        if (new Date(log.validatedAt) > new Date(existing.lastRedemption))
          existing.lastRedemption = log.validatedAt
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
  }, [myLogs, users])

  const prospects = useMemo(() => {
    const otherUsers = users.filter(
      (u) => u.role === 'user' && !myCustomerIds.has(u.id),
    )
    return otherUsers.map((u) => {
      const uLogs = validationLogs.filter((l) => l.userId === u.id)
      const categories = uLogs
        .map((l) => coupons.find((c) => c.id === l.couponId)?.category)
        .filter(Boolean) as string[]
      const topCat =
        categories.length > 0
          ? categories
              .sort(
                (a, b) =>
                  categories.filter((v) => v === a).length -
                  categories.filter((v) => v === b).length,
              )
              .pop()
          : 'None'
      return { id: u.id, totalRedemptions: uLogs.length, topCategory: topCat }
    })
  }, [users, myCustomerIds, validationLogs, coupons])

  const preferred = company.preferredCustomers || []

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-50 border-dashed">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Users className="h-8 w-8 text-blue-500 mb-2" />
            <h3 className="text-2xl font-bold">
              {users.filter((u) => u.role === 'user').length}
            </h3>
            <p className="text-xs text-muted-foreground">
              Total Active Users in Platform
            </p>
          </CardContent>
        </Card>
        <Card className="bg-slate-50 border-dashed">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Unlock className="h-8 w-8 text-green-500 mb-2" />
            <h3 className="text-2xl font-bold">{customers.length}</h3>
            <p className="text-xs text-muted-foreground">
              Your Unlocked Customers
            </p>
          </CardContent>
        </Card>
        <Card className="bg-slate-50 border-dashed">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <BarChart2 className="h-8 w-8 text-purple-500 mb-2" />
            <h3 className="text-2xl font-bold">{prospects.length}</h3>
            <p className="text-xs text-muted-foreground">Potential Prospects</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Customer Management & CRM</CardTitle>
          <CardDescription>
            View detailed profiles of customers who have purchased from you, or
            explore anonymized prospects.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="unlocked" className="gap-2">
                <Unlock className="h-4 w-4" /> My Customers ({customers.length})
              </TabsTrigger>
              <TabsTrigger value="prospects" className="gap-2">
                <Lock className="h-4 w-4" /> Market Prospects (
                {prospects.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="unlocked">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Full Profile</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Last Redemption</TableHead>
                    <TableHead>Store Redemptions</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((c) => {
                    const isPreferred = preferred.includes(c.userId)
                    return (
                      <TableRow key={c.userId}>
                        <TableCell className="font-medium text-primary">
                          {c.name}
                        </TableCell>
                        <TableCell>{c.email}</TableCell>
                        <TableCell>{formatDate(c.lastRedemption)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {c.totalUsed} purchases
                          </Badge>
                        </TableCell>
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
                            {isPreferred ? 'Preferred' : 'Mark Preferred'}
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
            </TabsContent>

            <TabsContent value="prospects">
              <div className="bg-amber-50 text-amber-800 p-3 rounded-md mb-4 text-sm flex items-center gap-2 border border-amber-200">
                <Lock className="h-4 w-4 shrink-0" />
                <p>
                  <strong>Privacy Protected:</strong> Full user details are
                  hidden until they redeem one of your coupons. Use this data to
                  understand market potential.
                </p>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Anonymous User</TableHead>
                    <TableHead>Platform Engagement</TableHead>
                    <TableHead>Top Interest Category</TableHead>
                    <TableHead>Access Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prospects.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-muted-foreground">
                        Shopper #{p.id.substring(0, 5).toUpperCase()}
                      </TableCell>
                      <TableCell>
                        {p.totalRedemptions} total redemptions
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{p.topCategory}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                          <Lock className="h-3 w-3" /> Locked
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                  {prospects.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center text-muted-foreground py-8"
                      >
                        No prospects available.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
