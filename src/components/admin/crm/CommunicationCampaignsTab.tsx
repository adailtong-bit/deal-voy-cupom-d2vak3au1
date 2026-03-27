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
        name: 'Boas-vindas Padrão',
        content:
          'Olá! Bem-vindo ao nosso programa. Aproveite os cupons disponíveis na nossa plataforma!',
      },
      {
        id: 't2',
        name: 'Lembrete de Oferta',
        content:
          'Sua oferta favorita está prestes a expirar. Não perca tempo e resgate agora mesmo.',
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
        name: newTargetGroup.name || 'Novo Grupo Alvo',
        description: 'Grupo criado via campanha exclusiva',
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
      toast.success('Campanha atualizada com sucesso!')
    } else {
      createCommunicationCampaign(payload)
      toast.success('Campanha agendada com sucesso!')
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
    toast.success('Template salvo na biblioteca!')
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
            <TrendingUp className="w-5 h-5 text-primary" /> Dashboard de
            Conversão de Disparos
          </h3>
          <p className="text-sm text-slate-500">
            Métricas de engajamento para campanhas programadas de Email e
            WhatsApp
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Disparos Realizados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">
                {dashboardStats.total}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                Via WhatsApp e Email
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Cliques Totais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {dashboardStats.clicks}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                Interações nos links enviados
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Resgates Gerados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">
                {dashboardStats.redemptions}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                Ofertas vinculadas utilizadas
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Taxa de Conversão
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {conversionRate}%
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                Resgates baseados em cliques
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <CardTitle>Gestão de Disparos & Campanhas</CardTitle>
            <CardDescription>
              Crie campanhas multicanal vinculadas a grupos de segmentação e
              templates de mensagens.
            </CardDescription>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" /> Novo Disparo
          </Button>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campanha</TableHead>
                  <TableHead>Grupo Alvo</TableHead>
                  <TableHead>Canal</TableHead>
                  <TableHead>Identificador</TableHead>
                  <TableHead>Métricas</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
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
                            <Ticket className="w-3 h-3 mr-1" /> Oferta Vinculada
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
                              {getMockMetrics(camp).clicks} cliques
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Ticket className="w-3 h-3 text-emerald-500" />{' '}
                              {getMockMetrics(camp).redemptions} resgates
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
                          {camp.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <div className="flex justify-end gap-1 items-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(camp)}
                            title="Editar"
                          >
                            <Edit2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Excluir"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Excluir Campanha?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta ação removerá a campanha "{camp.name}" e
                                  não poderá ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-600 hover:bg-red-700 text-white"
                                  onClick={() => {
                                    deleteCommunicationCampaign(camp.id)
                                    toast.success('Campanha excluída.')
                                  }}
                                >
                                  Excluir
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
                                ? 'A campanha ou oferta vinculada não está ativa.'
                                : 'Disparar agora'
                            }
                            onClick={() => {
                              updateCommunicationCampaign(camp.id, {
                                status: 'sent',
                              })
                              toast.success('Disparo realizado com sucesso!')
                            }}
                          >
                            <Send className="h-4 w-4 mr-2" /> Disparar
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
                      Nenhuma campanha de comunicação criada.
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
              {editingCampaign ? 'Editar Disparo' : 'Configurar Novo Disparo'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
              <div className="space-y-0.5">
                <Label className="text-base font-semibold">
                  Campanha Ativa
                </Label>
                <p className="text-xs text-muted-foreground">
                  Somente campanhas ativas podem ser disparadas.
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
              <Label>Nome da Campanha Interna</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ex: Lembrete Promoção Inverno"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Agendamento de Campanhas (Data e Hora)</Label>
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
                <Label>Canal de Comunicação</Label>
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
              <Label>Oferta Vinculada (Opcional)</Label>
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
                  <SelectValue placeholder="Selecione uma oferta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma</SelectItem>
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
                  Vincular Grupo Alvo Exclusivo
                </Label>
                <p className="text-xs text-muted-foreground">
                  Marque para gerar um identificador de agrupamento único para
                  rastrear a origem exata.
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
                  <Label>Identificador de Agrupamento</Label>
                  <Input
                    value={formData.groupingIdentifier || ''}
                    readOnly
                    className="bg-slate-100 font-mono text-slate-600 border-slate-200"
                  />
                </div>

                <div className="space-y-2 mt-4">
                  <Label className="font-semibold">
                    Definição de Target Group
                  </Label>
                  <RadioGroup
                    value={targetGroupMode}
                    onValueChange={(v: any) => setTargetGroupMode(v)}
                    className="flex flex-col sm:flex-row gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="existing" id="tg-existing" />
                      <Label htmlFor="tg-existing" className="cursor-pointer">
                        Selecionar Existente
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="new" id="tg-new" />
                      <Label htmlFor="tg-new" className="cursor-pointer">
                        Criar Novo Grupo
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {targetGroupMode === 'new' && (
                  <div className="space-y-4 pt-4 border-t mt-4 bg-slate-50 p-4 rounded-md">
                    <h4 className="font-semibold text-sm">
                      Filtros do Novo Grupo Alvo
                    </h4>
                    <div className="space-y-2">
                      <Label>Nome do Grupo</Label>
                      <Input
                        value={newTargetGroup.name}
                        onChange={(e) =>
                          setNewTargetGroup({
                            ...newTargetGroup,
                            name: e.target.value,
                          })
                        }
                        placeholder="Ex: Mulheres +25 SP"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Gênero</Label>
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
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="male">Masculino</SelectItem>
                            <SelectItem value="female">Feminino</SelectItem>
                            <SelectItem value="other">Outros</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex gap-2">
                        <div className="space-y-2 w-1/2">
                          <Label>Idade Mín.</Label>
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
                          <Label>Idade Máx.</Label>
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
                        <Label>Estado</Label>
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
                            <SelectValue placeholder="Todos" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            {availableStates.map((s) => (
                              <SelectItem key={s} value={s}>
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Cidade</Label>
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
                            <SelectValue placeholder="Todas" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todas</SelectItem>
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
                <Label>Grupo Alvo (Segmento)</Label>
                <Select
                  value={formData.targetGroupId}
                  onValueChange={(v) =>
                    setFormData({ ...formData, targetGroupId: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
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
                Configurações de Alcance
              </Label>

              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">
                    Escopo Geográfico (Permissões)
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
                        <SelectItem value="local">Local</SelectItem>
                        <SelectItem value="state">Estadual</SelectItem>
                        <SelectItem value="national">Nacional</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Input
                        value="Local (Restrito à sua região)"
                        disabled
                        className="bg-slate-100 text-slate-500 cursor-not-allowed w-full sm:w-[250px]"
                      />
                      <p className="text-[11px] text-slate-500">
                        O alcance geográfico é bloqueado e limitado à sua praça
                        de atuação.
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-4 pt-4 border-t mt-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-muted-foreground">
                      Controle de Randomização (A/B Test)
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
                          Percentual (%)
                        </SelectItem>
                        <SelectItem value="absolute">
                          Número Absoluto
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
                  <Library className="w-4 h-4" /> Biblioteca de Templates
                </Label>
                <div className="flex gap-2">
                  {isSavingTemplate ? (
                    <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-md border border-slate-200">
                      <Input
                        className="h-7 text-xs w-36 px-2 bg-white"
                        placeholder="Nome do Template..."
                        value={newTemplateName}
                        onChange={(e) => setNewTemplateName(e.target.value)}
                        autoFocus
                      />
                      <Button
                        size="sm"
                        className="h-7 px-3 text-xs"
                        onClick={handleSaveTemplate}
                      >
                        Salvar
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
                      <Save className="w-3 h-3 mr-2" /> Salvar Mensagem Atual
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
                  <SelectValue placeholder="Selecione um template salvo para carregar..." />
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
              <Label>Conteúdo da Mensagem</Label>
              <Textarea
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                placeholder={
                  formData.channel === 'push'
                    ? 'Título curto e mensagem direta...'
                    : 'Escreva sua mensagem...'
                }
                className="resize-none h-28"
              />
              <div className="text-right text-xs text-muted-foreground">
                {formData.content?.length || 0} caracteres
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3 mt-2">
              <Users className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-900">
                  Resumo da Audiência
                </p>
                <p className="text-xs text-blue-800 mt-1 leading-relaxed">
                  O grupo alvo selecionado possui{' '}
                  <strong>{baseLeads} leads</strong>. Com a randomização de{' '}
                  <strong>
                    {formData.randomizationType === 'percentage'
                      ? `${formData.randomizationValue}%`
                      : formData.randomizationValue}
                  </strong>
                  , esta campanha será enviada para aproximadamente{' '}
                  <strong className="text-blue-950 bg-blue-200 px-1 rounded">
                    {impactedLeads}
                  </strong>{' '}
                  leads únicos.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                !formData.name ||
                (!formData.isExclusive && !formData.targetGroupId) ||
                !formData.content
              }
            >
              <Send className="w-4 h-4 mr-2" /> Agendar Disparo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
