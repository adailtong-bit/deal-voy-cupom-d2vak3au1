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
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Edit2, Trash2, Users } from 'lucide-react'
import { TargetGroup } from '@/lib/types'
import { CATEGORIES } from '@/lib/data'

const calculateAge = (birthday?: string) => {
  if (!birthday) return null
  const birthDate = new Date(birthday)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const m = today.getMonth() - birthDate.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}

export function TargetGroupsTab({
  franchiseId,
  companyId,
}: {
  franchiseId?: string
  companyId?: string
}) {
  const {
    targetGroups,
    addTargetGroup,
    updateTargetGroup,
    deleteTargetGroup,
    user,
    users,
    franchises,
  } = useCouponStore()

  const { t } = useLanguage()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<TargetGroup | null>(null)

  const [formData, setFormData] = useState<Partial<TargetGroup>>({
    name: '',
    description: '',
    filters: {
      categories: [],
      frequency: 'all',
      location: '',
      gender: 'all',
      state: 'all',
      city: 'all',
    },
  })

  const displayGroups = companyId
    ? targetGroups.filter((g) => g.companyId === companyId)
    : franchiseId
      ? targetGroups.filter((g) => g.franchiseId === franchiseId)
      : targetGroups

  const availableStates = useMemo(() => {
    return Array.from(new Set(users.map((u) => u.state).filter(Boolean))).sort()
  }, [users])

  const availableCities = useMemo(() => {
    return Array.from(
      new Set(
        users
          .filter(
            (u) =>
              !formData.filters?.state ||
              formData.filters.state === 'all' ||
              u.state === formData.filters.state,
          )
          .map((u) => u.city)
          .filter(Boolean),
      ),
    ).sort()
  }, [users, formData.filters?.state])

  const matchingUsers = useMemo(() => {
    return users.filter((u) => {
      // Affiliation filtering
      if (companyId && u.companyId !== companyId) return false
      if (
        franchiseId &&
        !companyId &&
        u.franchiseId !== franchiseId &&
        u.region !== franchises.find((f) => f.id === franchiseId)?.region
      )
        return false

      // Demographic: Gender
      const fg = formData.filters?.gender
      if (fg && fg !== 'all') {
        if (fg === 'other') {
          if (u.gender === 'male' || u.gender === 'female') return false
        } else {
          if (u.gender !== fg) return false
        }
      }

      // Demographic: Age
      const minAge = formData.filters?.minAge
      const maxAge = formData.filters?.maxAge
      if (minAge || maxAge) {
        const age = calculateAge(u.birthday)
        if (age === null) return false
        if (minAge && age < minAge) return false
        if (maxAge && age > maxAge) return false
      }

      // Geographic: State & City
      const fs = formData.filters?.state
      if (fs && fs !== 'all' && u.state !== fs) return false

      const fc = formData.filters?.city
      if (fc && fc !== 'all' && u.city !== fc) return false

      return true
    })
  }, [users, companyId, franchiseId, franchises, formData.filters])

  const estimatedLeads = matchingUsers.length

  const handleOpenDialog = (group?: TargetGroup) => {
    if (group) {
      setEditingGroup(group)
      setFormData(group)
    } else {
      setEditingGroup(null)
      setFormData({
        name: '',
        description: '',
        filters: {
          categories: [],
          frequency: 'all',
          location: '',
          gender: 'all',
          state: 'all',
          city: 'all',
        },
      })
    }
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    if (editingGroup) {
      updateTargetGroup(editingGroup.id, {
        ...formData,
        leadCount: estimatedLeads,
      })
    } else {
      addTargetGroup({
        ...(formData as TargetGroup),
        id: Math.random().toString(),
        createdAt: new Date().toISOString(),
        franchiseId: franchiseId,
        companyId: companyId,
        leadCount: estimatedLeads,
      })
    }
    setIsDialogOpen(false)
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <CardTitle>
              {t(
                'admin.crm_tabs.target_groups_title',
                'Target Groups (Segments)',
              )}
            </CardTitle>
            <CardDescription>
              {t(
                'admin.crm_tabs.target_groups_desc',
                'Create segments based on demographic and consumption data to use in campaigns.',
              )}
            </CardDescription>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />{' '}
            {t('admin.crm_tabs.new_group', 'New Group')}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    {t('admin.crm_tabs.group_name', 'Group Name')}
                  </TableHead>
                  <TableHead>
                    {t('admin.crm_tabs.applied_filters', 'Applied Filters')}
                  </TableHead>
                  {!franchiseId &&
                    !companyId &&
                    user?.role === 'super_admin' && (
                      <TableHead>
                        {t('admin.crm_tabs.affiliation', 'Affiliation')}
                      </TableHead>
                    )}
                  <TableHead>{t('admin.crm_tabs.leads', 'Leads')}</TableHead>
                  <TableHead className="text-right">
                    {t('common.actions', 'Actions')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayGroups.map((group) => (
                  <TableRow key={group.id}>
                    <TableCell>
                      <p className="font-semibold text-slate-800">
                        {group.name}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {group.description}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[250px]">
                        {group.filters?.categories &&
                          group.filters.categories.length > 0 && (
                            <Badge
                              variant="outline"
                              className="bg-slate-50 text-[10px]"
                            >
                              Cat:{' '}
                              {t(
                                CATEGORIES.find(
                                  (c) => c.id === group.filters!.categories![0],
                                )?.translationKey ||
                                  `category.${group.filters!.categories![0].toLowerCase()}`,
                                group.filters.categories[0],
                              )}
                            </Badge>
                          )}
                        {group.filters?.gender &&
                          group.filters.gender !== 'all' && (
                            <Badge
                              variant="outline"
                              className="bg-slate-50 text-[10px]"
                            >
                              {t('admin.crm_tabs.gender', 'Gender')}:{' '}
                              {t(
                                `crm.dispatch.${group.filters.gender}`,
                                group.filters.gender,
                              )}
                            </Badge>
                          )}
                        {group.filters?.state &&
                          group.filters.state !== 'all' && (
                            <Badge
                              variant="outline"
                              className="bg-slate-50 text-[10px]"
                            >
                              Est: {group.filters.state}
                            </Badge>
                          )}
                        {(group.filters?.minAge || group.filters?.maxAge) && (
                          <Badge
                            variant="outline"
                            className="bg-slate-50 text-[10px]"
                          >
                            Age:{' '}
                            {group.filters.minAge
                              ? `${group.filters.minAge}`
                              : '0'}
                            -
                            {group.filters.maxAge
                              ? `${group.filters.maxAge}`
                              : '+'}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    {!franchiseId &&
                      !companyId &&
                      user?.role === 'super_admin' && (
                        <TableCell>
                          {group.companyId ? (
                            <Badge className="bg-purple-500">
                              {t('crm.dispatch.store', 'Store')}
                            </Badge>
                          ) : group.franchiseId ? (
                            <Badge variant="secondary">
                              {t('crm.dispatch.franchise', 'Franchise')}
                            </Badge>
                          ) : (
                            <Badge className="bg-blue-500">
                              {t('crm.dispatch.global', 'Global')}
                            </Badge>
                          )}
                        </TableCell>
                      )}
                    <TableCell>
                      <div className="flex items-center gap-1.5 font-bold text-slate-700">
                        <Users className="h-4 w-4 text-primary" />{' '}
                        {group.leadCount || 0}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(group)}
                      >
                        <Edit2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteTargetGroup(group.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {displayGroups.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-muted-foreground"
                    >
                      {t('common.none', 'No target group created.')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingGroup
                ? t('admin.crm_tabs.edit_group', 'Edit Group')
                : t('admin.crm_tabs.create_group', 'Create Target Group')}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>{t('admin.crm_tabs.group_name', 'Group Name')}</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder={t(
                  'admin.crm_tabs.group_name_ph',
                  'e.g. Women 25+ NY',
                )}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('admin.crm_tabs.group_desc', 'Description')}</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder={t(
                  'admin.crm_tabs.group_desc_ph',
                  'Details about this audience...',
                )}
                className="resize-none"
              />
            </div>

            <div className="pt-4 border-t space-y-4">
              <h4 className="font-semibold text-sm">
                {t('admin.crm_tabs.demo_filters', 'Demographic Filters')}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>{t('admin.crm_tabs.gender', 'Gender')}</Label>
                  <Select
                    value={formData.filters?.gender || 'all'}
                    onValueChange={(v: any) =>
                      setFormData({
                        ...formData,
                        filters: { ...formData.filters, gender: v },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('common.all', 'All')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        {t('common.all', 'All')}
                      </SelectItem>
                      <SelectItem value="male">
                        {t('crm.dispatch.male', 'Male')}
                      </SelectItem>
                      <SelectItem value="female">
                        {t('crm.dispatch.female', 'Female')}
                      </SelectItem>
                      <SelectItem value="other">
                        {t('crm.dispatch.other', 'Other')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t('admin.crm_tabs.min_age', 'Min Age')}</Label>
                  <Input
                    type="number"
                    min={0}
                    value={formData.filters?.minAge || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        filters: {
                          ...formData.filters,
                          minAge: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        },
                      })
                    }
                    placeholder="18"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('admin.crm_tabs.max_age', 'Max Age')}</Label>
                  <Input
                    type="number"
                    min={0}
                    value={formData.filters?.maxAge || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        filters: {
                          ...formData.filters,
                          maxAge: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        },
                      })
                    }
                    placeholder="45"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t space-y-4">
              <h4 className="font-semibold text-sm">
                {t('admin.crm_tabs.geo_filters', 'Geographic Filters')}
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('admin.crm_tabs.state', 'State')}</Label>
                  <Select
                    value={formData.filters?.state || 'all'}
                    onValueChange={(v) =>
                      setFormData({
                        ...formData,
                        filters: { ...formData.filters, state: v, city: 'all' },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('common.all', 'All')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        {t('common.all_states', 'All States')}
                      </SelectItem>
                      {availableStates.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t('admin.crm_tabs.city', 'City')}</Label>
                  <Select
                    value={formData.filters?.city || 'all'}
                    onValueChange={(v) =>
                      setFormData({
                        ...formData,
                        filters: { ...formData.filters, city: v },
                      })
                    }
                    disabled={
                      !formData.filters?.state ||
                      formData.filters.state === 'all'
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('common.all', 'All')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        {t('common.all_cities', 'All Cities')}
                      </SelectItem>
                      {availableCities.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t space-y-4">
              <h4 className="font-semibold text-sm">
                {t('admin.crm_tabs.consumption_filters', 'Consumption Filters')}
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    {t('admin.crm_tabs.pref_category', 'Preferred Category')}
                  </Label>
                  <Select
                    value={formData.filters?.categories?.[0] || 'all'}
                    onValueChange={(v) =>
                      setFormData({
                        ...formData,
                        filters: {
                          ...formData.filters,
                          categories: v === 'all' ? [] : [v],
                        },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('common.all', 'All')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        {t('common.all_categories', 'All Categories')}
                      </SelectItem>
                      {CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {t(c.translationKey, c.label)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>
                    {t('admin.crm_tabs.purchase_freq', 'Purchase Frequency')}
                  </Label>
                  <Select
                    value={formData.filters?.frequency || 'all'}
                    onValueChange={(v: any) =>
                      setFormData({
                        ...formData,
                        filters: { ...formData.filters, frequency: v },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('common.any', 'Any')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        {t('franchisee.crm.all_frequencies', 'Any Frequency')}
                      </SelectItem>
                      <SelectItem value="high">
                        {t('franchisee.crm.freq_high', 'High (10+)')}
                      </SelectItem>
                      <SelectItem value="medium">
                        {t('franchisee.crm.freq_medium', 'Medium (3-9)')}
                      </SelectItem>
                      <SelectItem value="low">
                        {t('franchisee.crm.freq_low', 'Low (1-2)')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-center justify-between mt-2">
              <div className="space-y-1">
                <span className="text-sm font-medium text-blue-800 flex items-center gap-2">
                  <Users className="w-4 h-4" />{' '}
                  {t('admin.crm_tabs.est_leads', 'Estimated Leads')}
                </span>
                <p className="text-xs text-blue-600">
                  {t(
                    'crm.dispatch.total_users_matched',
                    'Total users matching current filters.',
                  )}
                </p>
              </div>
              <span className="font-black text-2xl text-blue-600">
                {estimatedLeads}
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button onClick={handleSave} disabled={!formData.name}>
              {t('common.save', 'Save Group')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
