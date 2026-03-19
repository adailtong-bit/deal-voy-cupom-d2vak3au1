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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useLanguage } from '@/stores/LanguageContext'
import { useCouponStore } from '@/stores/CouponContext'
import { Company } from '@/lib/types'
import {
  Star,
  StarOff,
  Lock,
  Unlock,
  Users,
  BarChart2,
  Send,
  ArrowUpDown,
} from 'lucide-react'
import { toast } from 'sonner'

export function VendorCustomersTab({ company }: { company: Company }) {
  const { formatDate, formatCurrency } = useLanguage()
  const { validationLogs, coupons, users, togglePreferredCustomer } =
    useCouponStore()
  const [activeTab, setActiveTab] = useState('unlocked')

  const [frequencyFilter, setFrequencyFilter] = useState('all')
  const [spendFilter, setSpendFilter] = useState('all')

  const [offerDialogOpen, setOfferDialogOpen] = useState(false)
  const [offerSegment, setOfferSegment] = useState('all')
  const [offerMessage, setOfferMessage] = useState('')

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
    const map = new Map<string, any>()
    myLogs.forEach((log) => {
      if (!log.userId) return
      const coupon = coupons.find((c) => c.id === log.couponId)
      const spend = coupon?.price || 45.0 // fallback approximate spend

      const existing = map.get(log.userId)
      if (existing) {
        existing.totalUsed += 1
        existing.totalSpend += spend
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
          totalSpend: spend,
        })
      }
    })
    return Array.from(map.values()).sort(
      (a, b) =>
        new Date(b.lastRedemption).getTime() -
        new Date(a.lastRedemption).getTime(),
    )
  }, [myLogs, users, coupons])

  const filteredCustomers = customers.filter((c) => {
    if (frequencyFilter === 'high' && c.totalUsed < 5) return false
    if (frequencyFilter === 'medium' && (c.totalUsed < 2 || c.totalUsed >= 5))
      return false
    if (frequencyFilter === 'low' && c.totalUsed > 1) return false

    if (spendFilter === 'high' && c.totalSpend < 200) return false
    if (spendFilter === 'medium' && (c.totalSpend < 50 || c.totalSpend >= 200))
      return false
    if (spendFilter === 'low' && c.totalSpend >= 50) return false

    return true
  })

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
      return {
        id: u.id,
        totalRedemptions: uLogs.length,
        topCategory: topCat,
        region: u.region || u.state,
      }
    })
  }, [users, myCustomerIds, validationLogs, coupons])

  const preferred = company.preferredCustomers || []
  const companyCategory =
    coupons.find((c) => c.companyId === company.id)?.category || 'Alimentação'
  const interestedProspectsCount = prospects.filter(
    (p) => p.topCategory === companyCategory,
  ).length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-50 border-dashed border-2">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
            <Unlock className="h-8 w-8 text-green-500 mb-2" />
            <h3 className="text-2xl font-bold">{customers.length}</h3>
            <p className="text-xs text-muted-foreground">
              Your Unlocked Customers
            </p>
          </CardContent>
        </Card>
        <Card className="bg-slate-50 border-dashed border-2">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
            <BarChart2 className="h-8 w-8 text-purple-500 mb-2" />
            <h3 className="text-2xl font-bold">{prospects.length}</h3>
            <p className="text-xs text-muted-foreground">
              Market Prospects Available
            </p>
          </CardContent>
        </Card>
        <Card className="bg-slate-50 border-dashed border-2">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
            <Users className="h-8 w-8 text-blue-500 mb-2" />
            <h3 className="text-2xl font-bold">{interestedProspectsCount}</h3>
            <p className="text-xs text-muted-foreground">
              Prospects interested in {companyCategory}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-4 flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <CardTitle>Customer Management & CRM</CardTitle>
            <CardDescription>
              Manage your direct customers or view anonymized potential leads.
              Profile details unlock upon first redemption.
            </CardDescription>
          </div>
          <Button
            onClick={() => setOfferDialogOpen(true)}
            className="gap-2 shrink-0"
          >
            <Send className="h-4 w-4" /> Send Direct Offer
          </Button>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4 flex flex-wrap h-auto">
              <TabsTrigger value="unlocked" className="gap-2">
                <Unlock className="h-4 w-4" /> My Customers ({customers.length})
              </TabsTrigger>
              <TabsTrigger value="prospects" className="gap-2">
                <Lock className="h-4 w-4" /> Potential Hub ({prospects.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="unlocked">
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <Select
                  value={frequencyFilter}
                  onValueChange={setFrequencyFilter}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by Frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Frequencies</SelectItem>
                    <SelectItem value="high">Frequent (5+)</SelectItem>
                    <SelectItem value="medium">Regular (2-4)</SelectItem>
                    <SelectItem value="low">One-time (1)</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={spendFilter} onValueChange={setSpendFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by Spend" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Spend</SelectItem>
                    <SelectItem value="high">
                      High Ticket ({formatCurrency(200)}+)
                    </SelectItem>
                    <SelectItem value="medium">
                      Medium Ticket ({formatCurrency(50)}-{formatCurrency(200)})
                    </SelectItem>
                    <SelectItem value="low">
                      Low Ticket (&lt;{formatCurrency(50)})
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer Profile</TableHead>
                    <TableHead className="cursor-pointer hover:bg-slate-50">
                      <div className="flex items-center gap-1">
                        Last Visit <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead>Visits</TableHead>
                    <TableHead>Est. Spend</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((c) => {
                    const isPreferred = preferred.includes(c.userId)
                    return (
                      <TableRow key={c.userId}>
                        <TableCell>
                          <p className="font-medium text-primary">{c.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {c.email}
                          </p>
                        </TableCell>
                        <TableCell>{formatDate(c.lastRedemption)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{c.totalUsed}</Badge>
                        </TableCell>
                        <TableCell className="font-medium text-green-600">
                          {formatCurrency(
                            c.totalSpend,
                            company.region === 'US-FL' ? 'USD' : 'BRL',
                          )}
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
                  {filteredCustomers.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-muted-foreground py-8"
                      >
                        No customers match these filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="prospects">
              <div className="bg-amber-50 text-amber-800 p-4 rounded-md mb-4 text-sm flex items-start gap-3 border border-amber-200">
                <Lock className="h-5 w-5 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold mb-1">
                    Privacy Protected Prospecting
                  </h4>
                  <p>
                    These users are active on the platform but haven't bought
                    from you yet. You cannot see their personal details until
                    they redeem an offer. Use this data to understand market
                    demand and create targeted campaigns for acquisition.
                  </p>
                </div>
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
                        {p.totalRedemptions} platform redemptions
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            p.topCategory === companyCategory
                              ? 'default'
                              : 'outline'
                          }
                        >
                          {p.topCategory}
                        </Badge>
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

      <Dialog open={offerDialogOpen} onOpenChange={setOfferDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Targeted Offer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Target Segment</Label>
              <Select value={offerSegment} onValueChange={setOfferSegment}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    All My Customers ({customers.length})
                  </SelectItem>
                  <SelectItem value="preferred">
                    Preferred Customers ({preferred.length})
                  </SelectItem>
                  <SelectItem value="frequent">
                    Frequent Buyers (
                    {customers.filter((c) => c.totalUsed >= 3).length})
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notification Title</Label>
              <Input placeholder="Exclusive offer just for you!" />
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                value={offerMessage}
                onChange={(e) => setOfferMessage(e.target.value)}
                placeholder="We miss you! Here is a 20% OFF coupon for your next visit..."
                rows={4}
              />
            </div>
            <Button
              className="w-full gap-2"
              onClick={() => {
                if (!offerMessage) {
                  toast.error('Please enter a message')
                  return
                }
                toast.success(`Direct offer sent to ${offerSegment} segment!`)
                setOfferDialogOpen(false)
                setOfferMessage('')
              }}
            >
              <Send className="h-4 w-4" /> Blast Campaign
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
