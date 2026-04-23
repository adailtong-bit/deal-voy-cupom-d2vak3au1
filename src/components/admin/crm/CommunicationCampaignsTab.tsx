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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
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
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Send,
  Smartphone,
  Mail,
  Bell,
  Users,
  Ticket,
  Edit2,
  Trash2,
  Plus,
  MessageCircle,
  Save,
  Library,
  TrendingUp,
  MousePointerClick,
} from 'lucide-react'
import { CommunicationCampaign, TargetGroup } from '@/lib/types'
import { toast } from 'sonner'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

export function CommunicationCampaignsTab({
  franchiseId,
  companyId,
}: {
  franchiseId?: string
  companyId?: string
}) {
  const {
    communicationCampaigns,
    targetGroups,
    createCommunicationCampaign,
    updateCommunicationCampaign,
    deleteCommunicationCampaign,
    addTargetGroup,
    user,
    coupons,
    users,
  } = useCouponStore()

  const { t } = useLanguage()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCampaign, setEditingCampaign] =
    useState<CommunicationCampaign | null>(null)
  const [targetGroupMode, setTargetGroupMode] = useState<'existing' | 'new'>(
    'existing',
  )

  // Template Library State
  const [templates, setTemplates] = useState<
    { id: string; name: string; content: string }[]
  >(() => {
    const saved = localStorage.getItem('crm_message_templates')
    if (saved) return JSON.parse(saved)
    return [
      {
        id: 't1',
        name: 'Welcome Default',
        content:
          'Hello! Welcome to our program. Enjoy the available coupons on our platform!',
      },
      {
        id: 't2',
        name: 'Offer Reminder',
        content:
          'Your favorite offer is about to expire. Do not waste time and redeem it right now.',
      },
    ]
  })
  const [isSavingTemplate, setIsSavingTemplate] = useState(false)
  const [newTemplateName, setNewTemplateName] = useState('')

  const isMasterAdmin = user?.role === 'super_admin'

  const availableGroups = companyId
    ? targetGroups.filter((g) => g.companyId === companyId)
    : franchiseId
      ? targetGroups.filter(
          (g) => g.franchiseId === franchiseId || !g.franchiseId,
        )
      : targetGroups

  const [formData, setFormData] = useState<Partial<CommunicationCampaign>>({
    name: '',
    targetGroupId: availableGroups[0]?.id || '',
    channel: 'whatsapp',
    geographicScope: 'local',
    volumeImpact: 100,
    randomizationType: 'percentage',
    randomizationValue: 100,
    content: '',
    isExclusive: false,
    status: 'active',
  })

  const [newTargetGroup, setNewTargetGroup] = useState<Partial<TargetGroup>>({
    name: '',
    filters: { gender: 'all', state: 'all', city: 'all' },
  })

  const displayCampaigns = companyId
    ? communicationCampaigns.filter((c) => c.companyId === companyId)
    : franchiseId
      ? communicationCampaigns.filter((c) => c.franchiseId === franchiseId)
      : communicationCampaigns

  const activeCoupons = coupons.filter(
    (c) => c.status === 'active' && (!companyId || c.companyId === companyId),
  )

  const formatDatetimeLocal = (date?: string) => {
    if (!date) return ''
    const d = new Date(date)
    if (isNaN(d.getTime())) return ''
    const localDate = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    return localDate.toISOString().slice(0, 16)
  }

  const handleOpenDialog = (camp?: CommunicationCampaign) => {
    if (camp) {
      setEditingCampaign(camp)
      setFormData(camp)
      setTargetGroupMode('existing')
    } else {
      setEditingCampaign(null)
      setFormData({
        name: '',
        targetGroupId: availableGroups[0]?.id || '',
        channel: 'whatsapp',
        geographicScope: 'local',
        randomizationType: 'percentage',
        randomizationValue: 100,
        content: '',
        isExclusive: false,
        status: 'active',
        scheduledAt: new Date().toISOString(),
      })
      setTargetGroupMode('existing')
      setNewTargetGroup({
        name: '',
        filters: { gender: 'all', state: 'all', city: 'all' },
      })
    }
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    let finalTargetGroupId = formData.targetGroupId

    if (formData.isExclusive && targetGroupMode === 'new') {
      const newTgId = Math.random().toString()
      const tg: TargetGroup = {
        id: newTgId,
        name:
          newTargetGroup.name ||
          t('crm.dispatch.new_target_group', 'New Target Group'),
        description: t(
          'crm.dispatch.created_via_campaign',
          'Group created via exclusive campaign',
        ),
        filters: newTargetGroup.filters || {},
        createdAt: new Date().toISOString(),
        franchiseId: franchiseId,
        companyId: companyId,
        leadCount: 0,
      }
      addTargetGroup(tg)
      finalTargetGroupId = newTgId
    }

    const payload: CommunicationCampaign = {
      ...(formData as CommunicationCampaign),
      targetGroupId: finalTargetGroupId || '',
      id: editingCampaign ? editingCampaign.id : Math.random().toString(),
      createdAt: editingCampaign
        ? editingCampaign.createdAt
        : new Date().toISOString(),
      franchiseId: franchiseId,
      companyId: companyId,
    }

    if (editingCampaign) {
      updateCommunicationCampaign(payload.id, payload)
      toast.success(t('common.success', 'Campaign updated successfully!'))
    } else {
      createCommunicationCampaign(payload)
      toast.success(t('common.success', 'Campaign scheduled successfully!'))
    }
    setIsDialogOpen(false)
  }

  const handleSaveTemplate = () => {
    if (!newTemplateName || !formData.content) return
    const newTemplate = {
      id: Math.random().toString(),
      name: newTemplateName,
      content: formData.content,
    }
    const updated = [...templates, newTemplate]
    setTemplates(updated)
    localStorage.setItem('crm_message_templates', JSON.stringify(updated))
    setIsSavingTemplate(false)
    setNewTemplateName('')
    toast.success(t('common.success', 'Template saved to library!'))
  }

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email':
        return <Mail className="w-4 h-4 text-blue-600" />
      case 'sms':
        return <Smartphone className="w-4 h-4 text-slate-600" />
      case 'push':
        return <Bell className="w-4 h-4 text-purple-600" />
      case 'whatsapp':
        return <MessageCircle className="w-4 h-4 text-green-600" />
      default:
        return null
    }
  }

  const getTargetName = (id: string) =>
    targetGroups.find((g) => g.id === id)?.name || id

  const selectedGroup = availableGroups.find(
    (g) => g.id === formData.targetGroupId,
  )
  const baseLeads = selectedGroup?.leadCount || 0
  const impactedLeads =
    formData.randomizationType === 'absolute'
      ? Math.min(formData.randomizationValue || 0, baseLeads)
      : Math.round(baseLeads * ((formData.randomizationValue || 100) / 100))

  const availableStates = useMemo(() => {
    return Array.from(new Set(users.map((u) => u.state).filter(Boolean))).sort()
  }, [users])

  const availableCities = useMemo(() => {
    return Array.from(
      new Set(
        users
          .filter(
            (u) =>
              !newTargetGroup.filters?.state ||
              newTargetGroup.filters.state === 'all' ||
              u.state === newTargetGroup.filters.state,
          )
          .map((u) => u.city)
          .filter(Boolean),
      ),
    ).sort()
  }, [users, newTargetGroup.filters?.state])

  // Dashboard Metrics calculation
  const getMockMetrics = (camp: CommunicationCampaign) => {
    if (camp.clicks !== undefined)
      return { clicks: camp.clicks, redemptions: camp.redemptions || 0 }
    const base =
      camp.id.charCodeAt(0) +
      (camp.id.length > 1 ? camp.id.charCodeAt(camp.id.length - 1) : 0)
    const clicks = (base % 50) + 10 // pseudo-random stable
    const redemptions = Math.floor(clicks * 0.25)
    return { clicks, redemptions }
  }

  const dashboardStats = displayCampaigns.reduce(
    (acc, camp) => {
      if (
        ['whatsapp', 'email'].includes(camp.channel) &&
        (camp.status === 'sent' || camp.status === 'active')
      ) {
        acc.total += 1
        const metrics = getMockMetrics(camp)
        acc.clicks += metrics.clicks
        acc.redemptions += metrics.redemptions
      }
      return acc
    },
    { total: 0, clicks: 0, redemptions: 0 },
  )

  const conversionRate =
    dashboardStats.clicks > 0
      ? ((dashboardStats.redemptions / dashboardStats.clicks) * 100).toFixed(1)
      : '0.0'

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Dashboard de Conversão */}
      <div className="mb-6 space-y-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />{' '}
            {t(
              'crm.dispatch.conversion_dashboard',
              'Dispatch Conversion Dashboard',
            )}
          </h3>
          <p className="text-sm text-slate-500">
            {t(
              'crm.dispatch.engagement_metrics',
              'Engagement metrics for scheduled Email and WhatsApp campaigns',
            )}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {t('crm.dispatch.dispatches_made', 'Dispatches Made')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">
                {dashboardStats.total}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                {t('crm.dispatch.via_whatsapp_email', 'Via WhatsApp and Email')}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {t('crm.dispatch.total_clicks', 'Total Clicks')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {dashboardStats.clicks}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                {t(
                  'crm.dispatch.interactions_links',
                  'Interactions on sent links',
                )}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {t(
                  'crm.dispatch.redemptions_generated',
                  'Redemptions Generated',
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">
                {dashboardStats.redemptions}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                {t('crm.dispatch.used_offers', 'Linked offers used')}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {t('crm.dispatch.conversion_rate', 'Conversion Rate')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {conversionRate}%
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                {t(
                  'crm.dispatch.redemptions_based_clicks',
                  'Redemptions based on clicks',
                )}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico de Tendências de Conversão */}
        <Card className="bg-white border-slate-200 shadow-sm mt-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-800">
              {t(
                'crm.dispatch.trends',
                'Tendências de Engajamento e Conversão',
              )}
            </CardTitle>
            <CardDescription className="text-xs">
              Evolução de cliques e resgates das campanhas ao longo dos últimos
              dias.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full mt-4">
              <ChartContainer
                config={{
                  clicks: { label: 'Cliques', color: 'hsl(var(--primary))' },
                  redemptions: {
                    label: 'Resgates',
                    color: 'hsl(var(--emerald-500))',
                  },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={[
                      { date: '01/04', clicks: 120, redemptions: 30 },
                      { date: '05/04', clicks: 150, redemptions: 45 },
                      { date: '10/04', clicks: 180, redemptions: 50 },
                      { date: '15/04', clicks: 220, redemptions: 70 },
                      { date: '20/04', clicks: 270, redemptions: 90 },
                      {
                        date: '25/04',
                        clicks: Math.max(dashboardStats.clicks, 310),
                        redemptions: Math.max(dashboardStats.redemptions, 110),
                      },
                    ]}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#e2e8f0"
                    />
                    <XAxis
                      dataKey="date"
                      stroke="#64748b"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#64748b"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="clicks"
                      stroke="var(--color-clicks)"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="redemptions"
                      stroke="var(--color-redemptions)"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <CardTitle>
              {t(
                'admin.crm_tabs.comms_title',
                'Dispatches & Campaigns Management',
              )}
            </CardTitle>
            <CardDescription>
              {t(
                'admin.crm_tabs.comms_desc',
                'Create multichannel campaigns linked to target groups and message templates.',
              )}
            </CardDescription>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />{' '}
            {t('admin.crm_tabs.new_comm', 'New Dispatch')}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    {t('admin.crm_tabs.campaign', 'Campaign')}
                  </TableHead>
                  <TableHead>
                    {t('admin.crm_tabs.target_group', 'Target Group')}
                  </TableHead>
                  <TableHead>
                    {t('admin.crm_tabs.channel', 'Channel')}
                  </TableHead>
                  <TableHead>
                    {t('admin.crm_tabs.identifier', 'Identifier')}
                  </TableHead>
                  <TableHead>
                    {t('admin.crm_tabs.metrics', 'Metrics')}
                  </TableHead>
                  <TableHead>{t('admin.crm_tabs.status', 'Status')}</TableHead>
                  <TableHead className="text-right">
                    {t('common.actions', 'Actions')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayCampaigns.map((camp) => {
                  const linkedOffer = activeCoupons.find(
                    (c) => c.id === camp.linkedOfferId,
                  )
                  const isOfferActive =
                    !camp.linkedOfferId || linkedOffer?.status === 'active'
                  const canDispatch = camp.status === 'active' && isOfferActive

                  return (
                    <TableRow key={camp.id}>
                      <TableCell className="font-semibold">
                        {camp.name}
                        {camp.linkedOfferId && (
                          <div className="flex items-center text-[10px] text-primary mt-1">
                            <Ticket className="w-3 h-3 mr-1" />{' '}
                            {t('crm.dispatch.linked_offer', 'Linked Offer')}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{getTargetName(camp.targetGroupId)}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="capitalize flex items-center gap-1.5 w-fit bg-slate-50"
                        >
                          {getChannelIcon(camp.channel)} {camp.channel}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {camp.isExclusive ? (
                          <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded border">
                            {camp.groupingIdentifier}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 italic">
                            Global
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {['whatsapp', 'email'].includes(camp.channel) &&
                        (camp.status === 'sent' || camp.status === 'active') ? (
                          <div className="flex flex-col text-[11px] text-slate-600 space-y-1">
                            <span className="flex items-center gap-1.5">
                              <MousePointerClick className="w-3 h-3 text-blue-500" />{' '}
                              {getMockMetrics(camp).clicks}{' '}
                              {t('crm.dispatch.clicks', 'clicks')}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Ticket className="w-3 h-3 text-emerald-500" />{' '}
                              {getMockMetrics(camp).redemptions}{' '}
                              {t('crm.dispatch.redemptions', 'redemptions')}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            -
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            camp.status === 'sent'
                              ? 'default'
                              : camp.status === 'active'
                                ? 'secondary'
                                : 'outline'
                          }
                          className={
                            camp.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200'
                              : 'capitalize'
                          }
                        >
                          {t(`common.${camp.status}`, camp.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <div className="flex justify-end gap-1 items-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(camp)}
                            title={t('common.edit', 'Edit')}
                          >
                            <Edit2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                title={t('common.delete', 'Delete')}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  {t(
                                    'vendor.campaigns_tab.delete_title',
                                    'Delete Campaign?',
                                  )}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  {t(
                                    'vendor.campaigns_tab.delete_desc',
                                    'This action cannot be undone.',
                                  )}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>
                                  {t('common.cancel', 'Cancel')}
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-600 hover:bg-red-700 text-white"
                                  onClick={() => {
                                    deleteCommunicationCampaign(camp.id)
                                    toast.success(
                                      t('common.success', 'Campaign deleted.'),
                                    )
                                  }}
                                >
                                  {t('common.delete', 'Delete')}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>

                          <Button
                            variant="default"
                            size="sm"
                            className="ml-2"
                            disabled={!canDispatch}
                            title={
                              !canDispatch
                                ? t(
                                    'crm.dispatch.cannot_dispatch',
                                    'Campaign or linked offer is not active.',
                                  )
                                : t('crm.dispatch.dispatch_now', 'Dispatch now')
                            }
                            onClick={() => {
                              updateCommunicationCampaign(camp.id, {
                                status: 'sent',
                              })
                              toast.success(
                                t('common.success', 'Dispatched successfully!'),
                              )
                            }}
                          >
                            <Send className="h-4 w-4 mr-2" />{' '}
                            {t('crm.dispatch.dispatch', 'Dispatch')}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {displayCampaigns.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      {t('common.none', 'No communication campaigns created.')}
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
              {editingCampaign
                ? t('admin.crm_tabs.edit_comm', 'Edit Dispatch')
                : t('admin.crm_tabs.create_comm', 'Configure New Dispatch')}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
              <div className="space-y-0.5">
                <Label className="text-base font-semibold">
                  {t('crm.dispatch.active_campaign', 'Active Campaign')}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {t(
                    'crm.dispatch.only_active_dispatched',
                    'Only active campaigns can be dispatched.',
                  )}
                </p>
              </div>
              <Switch
                checked={formData.status === 'active'}
                onCheckedChange={(c) =>
                  setFormData({
                    ...formData,
                    status: c ? 'active' : 'inactive',
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>
                {t('admin.crm_tabs.internal_name', 'Internal Campaign Name')}
              </Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder={t(
                  'crm.dispatch.name_placeholder',
                  'e.g., Winter Promo Reminder',
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  {t('admin.crm_tabs.scheduled_date', 'Scheduled Date')}
                </Label>
                <Input
                  type="datetime-local"
                  value={formatDatetimeLocal(formData.scheduledAt)}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      scheduledAt: new Date(e.target.value).toISOString(),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>
                  {t('admin.crm_tabs.channel', 'Communication Channel')}
                </Label>
                <Select
                  value={formData.channel}
                  onValueChange={(v: any) =>
                    setFormData({ ...formData, channel: v })
                  }
                >
                  <SelectTrigger className="capitalize">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="whatsapp">
                      <span className="flex items-center">
                        <MessageCircle className="w-4 h-4 mr-2 text-green-600" />{' '}
                        WhatsApp
                      </span>
                    </SelectItem>
                    <SelectItem value="push">
                      <span className="flex items-center">
                        <Bell className="w-4 h-4 mr-2 text-purple-600" /> Push
                        Notification
                      </span>
                    </SelectItem>
                    <SelectItem value="email">
                      <span className="flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-blue-600" /> Email
                      </span>
                    </SelectItem>
                    <SelectItem value="sms">
                      <span className="flex items-center">
                        <Smartphone className="w-4 h-4 mr-2 text-slate-600" />{' '}
                        SMS
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>
                {t('admin.crm_tabs.linked_offer', 'Linked Offer (Optional)')}
              </Label>
              <Select
                value={formData.linkedOfferId || 'none'}
                onValueChange={(v) =>
                  setFormData({
                    ...formData,
                    linkedOfferId: v === 'none' ? undefined : v,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('common.select', 'Select...')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    {t('common.none', 'None')}
                  </SelectItem>
                  {activeCoupons.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-50 border rounded-lg gap-4">
              <div className="space-y-0.5">
                <Label className="font-semibold text-slate-800">
                  {t(
                    'admin.crm_tabs.exclusive_group',
                    'Link Exclusive Target Group',
                  )}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {t(
                    'crm.dispatch.exclusive_group_desc',
                    'Check to generate a unique grouping identifier to track the exact origin.',
                  )}
                </p>
              </div>
              <Switch
                checked={formData.isExclusive || false}
                onCheckedChange={(c) => {
                  setFormData({
                    ...formData,
                    isExclusive: c,
                    groupingIdentifier: c
                      ? `GRP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
                      : undefined,
                  })
                  if (!c) setTargetGroupMode('existing')
                }}
                className="shrink-0"
              />
            </div>

            {formData.isExclusive && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 p-4 border border-blue-100 bg-white rounded-lg shadow-sm">
                <div className="space-y-2">
                  <Label>
                    {t('admin.crm_tabs.identifier', 'Grouping Identifier')}
                  </Label>
                  <Input
                    value={formData.groupingIdentifier || ''}
                    readOnly
                    className="bg-slate-100 font-mono text-slate-600 border-slate-200"
                  />
                </div>

                <div className="space-y-2 mt-4">
                  <Label className="font-semibold">
                    {t(
                      'crm.dispatch.target_group_def',
                      'Target Group Definition',
                    )}
                  </Label>
                  <RadioGroup
                    value={targetGroupMode}
                    onValueChange={(v: any) => setTargetGroupMode(v)}
                    className="flex flex-col sm:flex-row gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="existing" id="tg-existing" />
                      <Label htmlFor="tg-existing" className="cursor-pointer">
                        {t('crm.dispatch.select_existing', 'Select Existing')}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="new" id="tg-new" />
                      <Label htmlFor="tg-new" className="cursor-pointer">
                        {t('crm.dispatch.create_new', 'Create New Group')}
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {targetGroupMode === 'new' && (
                  <div className="space-y-4 pt-4 border-t mt-4 bg-slate-50 p-4 rounded-md">
                    <h4 className="font-semibold text-sm">
                      {t('crm.dispatch.new_group_filters', 'New Group Filters')}
                    </h4>
                    <div className="space-y-2">
                      <Label>
                        {t('admin.crm_tabs.group_name', 'Group Name')}
                      </Label>
                      <Input
                        value={newTargetGroup.name}
                        onChange={(e) =>
                          setNewTargetGroup({
                            ...newTargetGroup,
                            name: e.target.value,
                          })
                        }
                        placeholder={t(
                          'crm.dispatch.group_name_ph',
                          'e.g., Women 25+ NY',
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t('admin.crm_tabs.gender', 'Gender')}</Label>
                        <Select
                          value={newTargetGroup.filters?.gender || 'all'}
                          onValueChange={(v) =>
                            setNewTargetGroup({
                              ...newTargetGroup,
                              filters: {
                                ...newTargetGroup.filters,
                                gender: v as any,
                              },
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
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
                      <div className="flex gap-2">
                        <div className="space-y-2 w-1/2">
                          <Label>
                            {t('admin.crm_tabs.min_age', 'Min Age')}
                          </Label>
                          <Input
                            type="number"
                            value={newTargetGroup.filters?.minAge || ''}
                            onChange={(e) =>
                              setNewTargetGroup({
                                ...newTargetGroup,
                                filters: {
                                  ...newTargetGroup.filters,
                                  minAge: e.target.value
                                    ? Number(e.target.value)
                                    : undefined,
                                },
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2 w-1/2">
                          <Label>
                            {t('admin.crm_tabs.max_age', 'Max Age')}
                          </Label>
                          <Input
                            type="number"
                            value={newTargetGroup.filters?.maxAge || ''}
                            onChange={(e) =>
                              setNewTargetGroup({
                                ...newTargetGroup,
                                filters: {
                                  ...newTargetGroup.filters,
                                  maxAge: e.target.value
                                    ? Number(e.target.value)
                                    : undefined,
                                },
                              })
                            }
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>{t('admin.crm_tabs.state', 'State')}</Label>
                        <Select
                          value={newTargetGroup.filters?.state || 'all'}
                          onValueChange={(v) =>
                            setNewTargetGroup({
                              ...newTargetGroup,
                              filters: {
                                ...newTargetGroup.filters,
                                state: v,
                                city: 'all',
                              },
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
                          value={newTargetGroup.filters?.city || 'all'}
                          onValueChange={(v) =>
                            setNewTargetGroup({
                              ...newTargetGroup,
                              filters: { ...newTargetGroup.filters, city: v },
                            })
                          }
                          disabled={
                            !newTargetGroup.filters?.state ||
                            newTargetGroup.filters.state === 'all'
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t('common.all', 'All')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">
                              {t('common.all', 'All')}
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
                )}
              </div>
            )}

            {(!formData.isExclusive || targetGroupMode === 'existing') && (
              <div className="space-y-2">
                <Label>
                  {t('admin.crm_tabs.target_group', 'Target Group')}
                </Label>
                <Select
                  value={formData.targetGroupId}
                  onValueChange={(v) =>
                    setFormData({ ...formData, targetGroupId: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t('common.select', 'Select...')}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {availableGroups.map((g) => (
                      <SelectItem key={g.id} value={g.id}>
                        {g.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-3 p-4 bg-white rounded-lg border border-slate-200">
              <Label className="text-base font-semibold">
                {t('admin.crm_tabs.reach_settings', 'Reach Settings')}
              </Label>

              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">
                    {t(
                      'admin.crm_tabs.geo_scope',
                      'Geographic Scope (Permissions)',
                    )}
                  </Label>
                  {isMasterAdmin ? (
                    <Select
                      value={formData.geographicScope || 'local'}
                      onValueChange={(v: any) =>
                        setFormData({ ...formData, geographicScope: v })
                      }
                    >
                      <SelectTrigger className="w-full sm:w-[200px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="local">
                          {t('crm.dispatch.local', 'Local')}
                        </SelectItem>
                        <SelectItem value="state">
                          {t('crm.dispatch.state', 'State')}
                        </SelectItem>
                        <SelectItem value="national">
                          {t('crm.dispatch.national', 'National')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Input
                        value={t(
                          'crm.dispatch.local_restricted',
                          'Local (Restricted to your region)',
                        )}
                        disabled
                        className="bg-slate-100 text-slate-500 cursor-not-allowed w-full sm:w-[250px]"
                      />
                      <p className="text-[11px] text-slate-500">
                        {t(
                          'crm.dispatch.geo_blocked',
                          'Geographic reach is locked and limited to your area of operation.',
                        )}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-4 pt-4 border-t mt-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-muted-foreground">
                      {t(
                        'admin.crm_tabs.ab_test',
                        'Randomization Control (A/B Test)',
                      )}
                    </Label>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <Select
                      value={formData.randomizationType || 'percentage'}
                      onValueChange={(v: any) =>
                        setFormData({
                          ...formData,
                          randomizationType: v,
                          randomizationValue: v === 'percentage' ? 100 : 1,
                        })
                      }
                    >
                      <SelectTrigger className="w-full sm:w-[160px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">
                          {t('crm.dispatch.percentage', 'Percentage (%)')}
                        </SelectItem>
                        <SelectItem value="absolute">
                          {t('crm.dispatch.absolute', 'Absolute Number')}
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    {formData.randomizationType === 'absolute' ? (
                      <Input
                        type="number"
                        min={1}
                        className="w-full sm:w-[120px]"
                        value={formData.randomizationValue || 1}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            randomizationValue: Number(e.target.value),
                          })
                        }
                      />
                    ) : (
                      <div className="flex-1 flex items-center gap-4 w-full">
                        <Slider
                          value={[formData.randomizationValue || 100]}
                          max={100}
                          step={5}
                          onValueChange={(vals) =>
                            setFormData({
                              ...formData,
                              randomizationValue: vals[0],
                            })
                          }
                          className="py-2"
                        />
                        <span className="font-bold text-primary w-12 text-right shrink-0">
                          {formData.randomizationValue || 100}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t">
              <div className="flex justify-between items-center">
                <Label className="flex items-center gap-2 text-base">
                  <Library className="w-4 h-4" />{' '}
                  {t('crm.dispatch.template_library', 'Template Library')}
                </Label>
                <div className="flex gap-2">
                  {isSavingTemplate ? (
                    <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-md border border-slate-200">
                      <Input
                        className="h-7 text-xs w-36 px-2 bg-white"
                        placeholder={t(
                          'crm.dispatch.template_name',
                          'Template Name...',
                        )}
                        value={newTemplateName}
                        onChange={(e) => setNewTemplateName(e.target.value)}
                        autoFocus
                      />
                      <Button
                        size="sm"
                        className="h-7 px-3 text-xs"
                        onClick={handleSaveTemplate}
                      >
                        {t('common.save', 'Save')}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-slate-500 hover:text-slate-800"
                        onClick={() => setIsSavingTemplate(false)}
                      >
                        X
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!formData.content}
                      onClick={() => setIsSavingTemplate(true)}
                    >
                      <Save className="w-3 h-3 mr-2" />{' '}
                      {t('crm.dispatch.save_current', 'Save Current Message')}
                    </Button>
                  )}
                </div>
              </div>
              <Select
                onValueChange={(v) => {
                  const t = templates.find((x) => x.id === v)
                  if (t) setFormData({ ...formData, content: t.content })
                }}
              >
                <SelectTrigger className="bg-slate-50 border-slate-200 text-slate-600">
                  <SelectValue
                    placeholder={t(
                      'crm.dispatch.select_template',
                      'Select a saved template to load...',
                    )}
                  />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 mt-2">
              <Label>
                {t('admin.crm_tabs.message_content', 'Message Content')}
              </Label>
              <Textarea
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                placeholder={
                  formData.channel === 'push'
                    ? t(
                        'crm.dispatch.push_ph',
                        'Short title and direct message...',
                      )
                    : t('crm.dispatch.msg_ph', 'Write your message...')
                }
                className="resize-none h-28"
              />
              <div className="text-right text-xs text-muted-foreground">
                {formData.content?.length || 0}{' '}
                {t('crm.dispatch.chars', 'characters')}
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3 mt-2">
              <Users className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-900">
                  {t('admin.crm_tabs.audience_summary', 'Audience Summary')}
                </p>
                <p className="text-xs text-blue-800 mt-1 leading-relaxed">
                  {t(
                    'crm.dispatch.audience_text1',
                    'The selected target group has',
                  )}
                  <strong>
                    {baseLeads} {t('crm.dispatch.leads', 'leads')}
                  </strong>
                  .{' '}
                  {t('crm.dispatch.audience_text2', 'With a randomization of')}
                  <strong>
                    {formData.randomizationType === 'percentage'
                      ? `${formData.randomizationValue}%`
                      : formData.randomizationValue}
                  </strong>
                  ,{' '}
                  {t(
                    'crm.dispatch.audience_text3',
                    'this campaign will be sent to approximately',
                  )}
                  <strong className="text-blue-950 bg-blue-200 px-1 rounded">
                    {impactedLeads}
                  </strong>{' '}
                  {t('crm.dispatch.unique_leads', 'unique leads')}.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                !formData.name ||
                (!formData.isExclusive && !formData.targetGroupId) ||
                !formData.content
              }
            >
              <Send className="w-4 h-4 mr-2" />{' '}
              {t('crm.dispatch.schedule_dispatch', 'Schedule Dispatch')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
