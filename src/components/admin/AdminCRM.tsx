import { useState, useMemo } from 'react'
import { useCouponStore } from '@/stores/CouponContext'
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
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Users, Target, BarChart3 } from 'lucide-react'
import { CATEGORIES } from '@/lib/data'

export function AdminCRM() {
  const { users, validationLogs, coupons, companies } = useCouponStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const userStats = useMemo(() => {
    return users.map((user) => {
      const userLogs = validationLogs.filter((log) => log.userId === user.id)
      const usedCoupons = userLogs
        .map((log) => coupons.find((c) => c.id === log.couponId))
        .filter(Boolean)

      const categories = usedCoupons.reduce(
        (acc, c) => {
          if (c?.category) acc[c.category] = (acc[c.category] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      )

      const topCategory =
        Object.entries(categories).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None'

      const merchants = usedCoupons.reduce(
        (acc, c) => {
          const comp = companies.find((comp) => comp.id === c?.companyId)
          if (comp) acc[comp.name] = (acc[comp.name] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      )

      const topMerchant =
        Object.entries(merchants).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None'

      return {
        ...user,
        totalRedemptions: userLogs.length,
        topCategory,
        topMerchant,
        merchantsVisited: Object.keys(merchants).length,
      }
    })
  }, [users, validationLogs, coupons, companies])

  const filteredUsers = userStats.filter((u) => {
    if (categoryFilter !== 'all' && u.topCategory !== categoryFilter)
      return false
    if (
      searchQuery &&
      !u.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !u.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false
    return true
  })

  const totalRedemptions = validationLogs.length
  const activeUsersCount = userStats.filter(
    (u) => u.totalRedemptions > 0,
  ).length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-full text-blue-600">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Users
              </p>
              <h3 className="text-2xl font-bold">{users.length}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-full text-green-600">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Active Users (w/ Redemptions)
              </p>
              <h3 className="text-2xl font-bold">{activeUsersCount}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-full text-purple-600">
              <Target className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Redemptions
              </p>
              <h3 className="text-2xl font-bold">{totalRedemptions}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User CRM & Consumption Profiles</CardTitle>
          <CardDescription>
            View detailed consumption patterns to support ad sales and
            targeting.
          </CardDescription>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Redemptions</TableHead>
                <TableHead>Top Category</TableHead>
                <TableHead>Favorite Merchant</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <p className="font-medium">{u.name}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-bold">
                      {u.totalRedemptions}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{u.topCategory}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground truncate max-w-[150px]">
                      {u.topMerchant}
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
