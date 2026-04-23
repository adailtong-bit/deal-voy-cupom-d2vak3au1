import { useState, useMemo } from 'react'
import { useCouponStore } from '@/stores/CouponContext'
import { useLanguage } from '@/stores/LanguageContext'
import { useRegionFormatting } from '@/hooks/useRegionFormatting'
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
import { Search, Download, Crown, ActivitySquare, Ban } from 'lucide-react'
import { CATEGORIES } from '@/lib/data'

export function LeadsProfileTab({ franchiseId }: { franchiseId?: string }) {
  const { users, validationLogs, coupons, companies, franchises } =
    useCouponStore()
  const { t } = useLanguage()

  const franchise = franchises.find((f) => f.id === franchiseId)
  const { formatDate, formatNumber } = useRegionFormatting(franchise?.region)

  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [locationFilter, setLocationFilter] = useState('all')
  const [profileFilter, setProfileFilter] = useState('all')

  const displayCompanies = franchiseId
    ? companies.filter((c) => c.franchiseId === franchiseId)
    : companies
  const companyIds = displayCompanies.map((c) => c.id)

  const displayLogs = franchiseId
    ? validationLogs.filter(
        (l) => l.companyId && companyIds.includes(l.companyId),
      )
    : validationLogs
  const userIds = new Set(displayLogs.map((l) => l.userId))

  const displayUsers = franchiseId
    ? users.filter((u) => userIds.has(u.id))
    : users

  const userStats = useMemo(() => {
    return displayUsers.map((user) => {
      const userLogs = displayLogs.filter((log) => log.userId === user.id)
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

      const merchantsCount = usedCoupons.reduce(
        (acc, c) => {
          const comp = companies.find((comp) => comp.id === c?.companyId)
          if (comp) acc[comp.name] = (acc[comp.name] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      )

      const topMerchant =
        Object.entries(merchantsCount).sort((a, b) => b[1] - a[1])[0]?.[0] ||
        'None'

      const lastActiveLog = [...userLogs].sort(
        (a, b) =>
          new Date(b.validatedAt).getTime() - new Date(a.validatedAt).getTime(),
      )[0]

      const tags: string[] = []
      if (userLogs.length >= 5) tags.push('Frequent Buyer')
      if (userLogs.length === 0) tags.push('Inactive')
      if (userLogs.length > 0 && userLogs.length < 5) tags.push('Occasional')

      // Mock high value if they have premium subscription or many uses
      if (user.subscriptionTier === 'vip' || userLogs.length > 10) {
        tags.push('High Value')
      }

      return {
        ...user,
        totalRedemptions: userLogs.length,
        topCategory,
        topMerchant,
        merchantsVisited: Object.keys(merchantsCount).length,
        lastActive: lastActiveLog ? lastActiveLog.validatedAt : null,
        profileTags: tags,
      }
    })
  }, [displayUsers, displayLogs, coupons, companies])

  const locations = useMemo(() => {
    const locs = new Set<string>()
    displayUsers.forEach((u) => {
      if (u.state) locs.add(u.state)
      if (u.region) locs.add(u.region)
    })
    return Array.from(locs).filter(Boolean).sort()
  }, [displayUsers])

  const filteredUsers = userStats.filter((u) => {
    if (categoryFilter !== 'all' && u.topCategory !== categoryFilter)
      return false
    if (
      locationFilter !== 'all' &&
      u.state !== locationFilter &&
      u.region !== locationFilter
    )
      return false

    if (profileFilter !== 'all' && !u.profileTags.includes(profileFilter))
      return false

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
      'Location',
      'Redemptions',
      'Top Category',
      'Favorite Merchant',
      'Tags',
      'Last Active',
    ]
    const rows = filteredUsers.map((u) => [
      `"${u.name}"`,
      `"${u.email}"`,
      `"${u.state || u.region || 'Unknown'}"`,
      u.totalRedemptions,
      `"${u.topCategory}"`,
      `"${u.topMerchant}"`,
      `"${u.profileTags.join(', ')}"`,
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
    link.setAttribute('download', 'crm_profiles_export.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getTagIcon = (tag: string) => {
    switch (tag) {
      case 'High Value':
        return <Crown className="w-3 h-3 mr-1 text-amber-500" />
      case 'Frequent Buyer':
        return <ActivitySquare className="w-3 h-3 mr-1 text-emerald-500" />
      case 'Inactive':
        return <Ban className="w-3 h-3 mr-1 text-slate-400" />
      default:
        return null
    }
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <CardTitle>
            {t(
              'franchisee.leads.profile_tab_title',
              'Consumption Profiles (Leads)',
            )}
          </CardTitle>
          <CardDescription>
            {t(
              'franchisee.leads.profile_tab_desc',
              'View purchasing behavior and identify the best profiles for your campaigns.',
            )}
          </CardDescription>
        </div>
        <Button variant="outline" className="gap-2" onClick={exportCSV}>
          <Download className="h-4 w-4" />{' '}
          {t('franchisee.leads.export_data', 'Export Data')}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('franchisee.crm.search', 'Search users...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue
                placeholder={t('franchisee.crm.category', 'Category')}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t('franchisee.crm.all_categories', 'All Categories')}
              </SelectItem>
              {CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {t(c.translationKey, c.label)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger>
              <SelectValue
                placeholder={t('franchisee.crm.location', 'Location')}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t('franchisee.crm.all_locations', 'All Locations')}
              </SelectItem>
              {locations.map((loc) => (
                <SelectItem key={loc} value={loc}>
                  {loc}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={profileFilter} onValueChange={setProfileFilter}>
            <SelectTrigger>
              <SelectValue
                placeholder={t(
                  'franchisee.leads.profile_filter',
                  'Consumption Profile',
                )}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t('franchisee.leads.any_profile', 'Any Profile')}
              </SelectItem>
              <SelectItem value="High Value">
                {t('franchisee.leads.high_value', 'High Value')}
              </SelectItem>
              <SelectItem value="Frequent Buyer">
                {t('franchisee.leads.frequent_buyer', 'Frequent Buyer')}
              </SelectItem>
              <SelectItem value="Occasional">
                {t('franchisee.leads.occasional', 'Occasional')}
              </SelectItem>
              <SelectItem value="Inactive">
                {t('franchisee.leads.inactive', 'Inactive')}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  {t('franchisee.crm.user_location', 'User / Location')}
                </TableHead>
                <TableHead>
                  {t('franchisee.leads.profile_col', 'Consumption Profile')}
                </TableHead>
                <TableHead>
                  {t('franchisee.crm.redemptions', 'Redemptions')}
                </TableHead>
                <TableHead>
                  {t('franchisee.crm.top_category', 'Top Category')}
                </TableHead>
                <TableHead>
                  {t('franchisee.crm.last_active', 'Last Active')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                  >
                    {t(
                      'franchisee.leads.no_profile_users',
                      'No users match the profile filters.',
                    )}
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
                      <div className="flex flex-wrap gap-1">
                        {u.profileTags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="bg-slate-50 border-slate-200 text-xs font-medium"
                          >
                            {getTagIcon(tag)}
                            {t(
                              `franchisee.leads.${tag.toLowerCase().replace(' ', '_')}`,
                              tag,
                            )}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="font-bold">
                      {formatNumber(u.totalRedemptions)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-slate-50">
                        {u.topCategory === 'None'
                          ? t('common.none', 'None')
                          : t(
                              CATEGORIES.find((c) => c.id === u.topCategory)
                                ?.translationKey || 'category.others',
                              u.topCategory,
                            )}
                      </Badge>
                      <p className="text-[10px] text-muted-foreground mt-1 truncate max-w-[150px]">
                        {t('franchisee.leads.preference', 'Preference:')}{' '}
                        {u.topMerchant}
                      </p>
                    </TableCell>
                    <TableCell className="text-sm">
                      {u.lastActive
                        ? formatDate(u.lastActive)
                        : t('franchisee.crm.never', 'Never')}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
