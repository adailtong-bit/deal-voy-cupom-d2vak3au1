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
import { Button } from '@/components/ui/button'
import { Search, Users, Target, BarChart3, Download } from 'lucide-react'
import { CATEGORIES } from '@/lib/data'
import { useLanguage } from '@/stores/LanguageContext'

export function AdminCRM() {
  const { users, validationLogs, coupons, companies } = useCouponStore()
  const { formatDate } = useLanguage()

  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [locationFilter, setLocationFilter] = useState('all')
  const [frequencyFilter, setFrequencyFilter] = useState('all')

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

      const lastActiveLog = [...userLogs].sort(
        (a, b) =>
          new Date(b.validatedAt).getTime() - new Date(a.validatedAt).getTime(),
      )[0]

      return {
        ...user,
        totalRedemptions: userLogs.length,
        topCategory,
        topMerchant,
        merchantsVisited: Object.keys(merchants).length,
        lastActive: lastActiveLog ? lastActiveLog.validatedAt : null,
      }
    })
  }, [users, validationLogs, coupons, companies])

  const locations = useMemo(() => {
    const locs = new Set<string>()
    users.forEach((u) => {
      if (u.state) locs.add(u.state)
      if (u.region) locs.add(u.region)
    })
    return Array.from(locs).filter(Boolean).sort()
  }, [users])

  const filteredUsers = userStats.filter((u) => {
    if (categoryFilter !== 'all' && u.topCategory !== categoryFilter)
      return false
    if (
      locationFilter !== 'all' &&
      u.state !== locationFilter &&
      u.region !== locationFilter
    )
      return false

    if (frequencyFilter === 'high' && u.totalRedemptions < 10) return false
    if (
      frequencyFilter === 'medium' &&
      (u.totalRedemptions < 3 || u.totalRedemptions >= 10)
    )
      return false
    if (
      frequencyFilter === 'low' &&
      (u.totalRedemptions < 1 || u.totalRedemptions >= 3)
    )
      return false
    if (frequencyFilter === 'none' && u.totalRedemptions > 0) return false

    if (
      searchQuery &&
      !u.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !u.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false
    return true
  })

  const exportCSV = () => {
    const headers = [
      'Name',
      'Email',
      'Role',
      'Location',
      'Redemptions',
      'Top Category',
      'Favorite Merchant',
      'Last Active',
    ]
    const rows = filteredUsers.map((u) => [
      `"${u.name}"`,
      `"${u.email}"`,
      u.role,
      `"${u.state || u.region || 'Unknown'}"`,
      u.totalRedemptions,
      `"${u.topCategory}"`,
      `"${u.topMerchant}"`,
      u.lastActive ? formatDate(u.lastActive) : 'Never',
    ])
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      headers.join(',') +
      '\n' +
      rows.map((e) => e.join(',')).join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'crm_users_export.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const totalRedemptions = validationLogs.length
  const activeUsersCount = userStats.filter(
    (u) => u.totalRedemptions > 0,
  ).length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                Active Users
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
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4 flex flex-col justify-center h-full">
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={exportCSV}
            >
              <Download className="h-4 w-4" /> Export CSV
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Global CRM & Segmentation</CardTitle>
          <CardDescription>
            Filter users by behavior, location, and consumption frequency.
            Export data for marketing and sales.
          </CardDescription>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mt-4">
            <div className="relative col-span-1 sm:col-span-2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
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
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map((loc) => (
                  <SelectItem key={loc} value={loc}>
                    {loc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={frequencyFilter} onValueChange={setFrequencyFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Frequency</SelectItem>
                <SelectItem value="high">High (10+)</SelectItem>
                <SelectItem value="medium">Medium (3-9)</SelectItem>
                <SelectItem value="low">Low (1-2)</SelectItem>
                <SelectItem value="none">None (0)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User / Location</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Redemptions</TableHead>
                <TableHead>Top Category</TableHead>
                <TableHead>Last Active</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No users match the selected segments.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <p className="font-medium">{u.name}</p>
                      <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                        <span>{u.email}</span>
                        {u.state && (
                          <span className="bg-slate-100 px-1 rounded">
                            {u.state}
                          </span>
                        )}
                      </div>
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
                      <p className="text-xs text-muted-foreground mt-1 truncate max-w-[150px]">
                        Prefers: {u.topMerchant}
                      </p>
                    </TableCell>
                    <TableCell className="text-sm">
                      {u.lastActive ? formatDate(u.lastActive) : 'Never'}
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
