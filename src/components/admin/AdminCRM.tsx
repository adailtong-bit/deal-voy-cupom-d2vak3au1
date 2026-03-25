import { useState, useMemo } from 'react'
import { useCouponStore } from '@/stores/CouponContext'
import { useLanguage } from '@/stores/LanguageContext'
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

export function AdminCRM({ franchiseId }: { franchiseId?: string }) {
  const { users, validationLogs, coupons, companies } = useCouponStore()
  const { formatDate, t } = useLanguage()

  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [locationFilter, setLocationFilter] = useState('all')
  const [frequencyFilter, setFrequencyFilter] = useState('all')

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

      return {
        ...user,
        totalRedemptions: userLogs.length,
        topCategory,
        topMerchant,
        merchantsVisited: Object.keys(merchantsCount).length,
        lastActive: lastActiveLog ? lastActiveLog.validatedAt : null,
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

  const totalRedemptions = displayLogs.length
  const activeUsersCount = userStats.filter(
    (u) => u.totalRedemptions > 0,
  ).length

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-full text-blue-600">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t('franchisee.crm.total_users', 'Total de Usuários')}
              </p>
              <h3 className="text-2xl font-bold">{displayUsers.length}</h3>
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
                {t('franchisee.crm.active_users', 'Usuários Ativos')}
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
                {t('franchisee.crm.total_redemptions', 'Total de Resgates')}
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
              <Download className="h-4 w-4" />{' '}
              {t('admin.exportCsv', 'Export CSV')}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {t('franchisee.crm.title', 'CRM e Segmentação')}
          </CardTitle>
          <CardDescription>
            {t(
              'franchisee.crm.desc',
              'Filtre usuários por comportamento, localização e frequência. Exporte dados para marketing.',
            )}
          </CardDescription>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mt-4">
            <div className="relative col-span-1 sm:col-span-2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('franchisee.crm.search', 'Buscar usuários...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue
                  placeholder={t('franchisee.crm.category', 'Categoria')}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t('franchisee.crm.all_categories', 'Todas as Categorias')}
                </SelectItem>
                {CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger>
                <SelectValue
                  placeholder={t('franchisee.crm.location', 'Localização')}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t('franchisee.crm.all_locations', 'Todas as Localizações')}
                </SelectItem>
                {locations.map((loc) => (
                  <SelectItem key={loc} value={loc}>
                    {loc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={frequencyFilter} onValueChange={setFrequencyFilter}>
              <SelectTrigger>
                <SelectValue
                  placeholder={t('franchisee.crm.frequency', 'Frequência')}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t('franchisee.crm.all_frequencies', 'Qualquer Frequência')}
                </SelectItem>
                <SelectItem value="high">
                  {t('franchisee.crm.freq_high', 'Alta (10+)')}
                </SelectItem>
                <SelectItem value="medium">
                  {t('franchisee.crm.freq_medium', 'Média (3-9)')}
                </SelectItem>
                <SelectItem value="low">
                  {t('franchisee.crm.freq_low', 'Baixa (1-2)')}
                </SelectItem>
                <SelectItem value="none">
                  {t('franchisee.crm.freq_none', 'Nenhuma (0)')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  {t('franchisee.crm.user_location', 'Usuário / Local')}
                </TableHead>
                <TableHead>{t('franchisee.crm.role', 'Papel')}</TableHead>
                <TableHead>
                  {t('franchisee.crm.redemptions', 'Resgates')}
                </TableHead>
                <TableHead>
                  {t('franchisee.crm.top_category', 'Categoria Principal')}
                </TableHead>
                <TableHead>
                  {t('franchisee.crm.last_active', 'Último Acesso')}
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
                      'franchisee.crm.no_users',
                      'Nenhum usuário corresponde aos filtros.',
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
                        {t('franchisee.crm.prefers', 'Prefere:')}{' '}
                        {u.topMerchant}
                      </p>
                    </TableCell>
                    <TableCell className="text-sm">
                      {u.lastActive
                        ? formatDate(u.lastActive)
                        : t('franchisee.crm.never', 'Nunca')}
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
