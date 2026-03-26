import { useState } from 'react'
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
  Globe,
  MapPin,
  Map,
  Users,
  Ticket,
} from 'lucide-react'
import { CommunicationCampaign } from '@/lib/types'

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
    user,
    coupons,
  } = useCouponStore()

  const [isDialogOpen, setIsDialogOpen] = useState(false)

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
    channel: 'push',
    geographicScope: 'local',
    volumeImpact: 100,
    randomizationType: 'percentage',
    randomizationValue: 100,
    content: '',
    isExclusive: false,
  })

  const displayCampaigns = companyId
    ? communicationCampaigns.filter((c) => c.companyId === companyId)
    : franchiseId
      ? communicationCampaigns.filter((c) => c.franchiseId === franchiseId)
      : communicationCampaigns

  const activeCoupons = coupons.filter(
    (c) => c.status === 'active' && (!companyId || c.companyId === companyId),
  )

  const handleOpenDialog = () => {
    setFormData({
      name: '',
      targetGroupId: availableGroups[0]?.id || '',
      channel: 'push',
      geographicScope: 'local',
      randomizationType: 'percentage',
      randomizationValue: 100,
      content: '',
      isExclusive: false,
    })
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    createCommunicationCampaign({
      ...(formData as CommunicationCampaign),
      id: Math.random().toString(),
      status: 'scheduled',
      createdAt: new Date().toISOString(),
      scheduledAt: new Date(Date.now() + 3600000).toISOString(),
      franchiseId: franchiseId,
      companyId: companyId,
    })
    setIsDialogOpen(false)
  }

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email':
        return <Mail className="w-4 h-4" />
      case 'sms':
        return <Smartphone className="w-4 h-4" />
      case 'push':
        return <Bell className="w-4 h-4" />
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

  return (
    <div className="space-y-4 animate-fade-in">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <CardTitle>Disparos & Campanhas</CardTitle>
            <CardDescription>
              Crie campanhas multicanal vinculadas a grupos de segmentação.
            </CardDescription>
          </div>
          <Button
            onClick={handleOpenDialog}
            disabled={availableGroups.length === 0}
          >
            <Send className="mr-2 h-4 w-4" /> Novo Disparo
          </Button>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campanha</TableHead>
                  <TableHead>Grupo Alvo</TableHead>
                  <TableHead>Canal</TableHead>
                  <TableHead>Identificador</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayCampaigns.map((camp) => (
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
                      <Badge
                        variant={
                          camp.status === 'sent' ? 'default' : 'secondary'
                        }
                        className="capitalize"
                      >
                        {camp.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {displayCampaigns.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
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
            <DialogTitle>Configurar Novo Disparo</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
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
                    <SelectItem value="push">
                      <span className="flex items-center">
                        <Bell className="w-4 h-4 mr-2" /> Push Notification
                      </span>
                    </SelectItem>
                    <SelectItem value="email">
                      <span className="flex items-center">
                        <Mail className="w-4 h-4 mr-2" /> Email
                      </span>
                    </SelectItem>
                    <SelectItem value="sms">
                      <span className="flex items-center">
                        <Smartphone className="w-4 h-4 mr-2" /> SMS
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
                  Campanha Exclusiva
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
                }}
                className="shrink-0"
              />
            </div>
            {formData.isExclusive && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                <Label>Identificador de Agrupamento</Label>
                <Input
                  value={formData.groupingIdentifier || ''}
                  readOnly
                  className="bg-slate-100 font-mono text-slate-600 border-slate-200"
                />
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
                    <RadioGroup
                      value={formData.geographicScope}
                      onValueChange={(v: any) =>
                        setFormData({ ...formData, geographicScope: v })
                      }
                      className="flex flex-col sm:flex-row gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="local" id="r1" />
                        <Label
                          htmlFor="r1"
                          className="flex items-center cursor-pointer font-normal"
                        >
                          <MapPin className="w-3.5 h-3.5 mr-1" /> Local
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="state" id="r2" />
                        <Label
                          htmlFor="r2"
                          className="flex items-center cursor-pointer font-normal"
                        >
                          <Map className="w-3.5 h-3.5 mr-1" /> Estadual
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="national" id="r3" />
                        <Label
                          htmlFor="r3"
                          className="flex items-center cursor-pointer font-normal"
                        >
                          <Globe className="w-3.5 h-3.5 mr-1" /> Nacional
                        </Label>
                      </div>
                    </RadioGroup>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <RadioGroup value="local" className="flex">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="local" id="r_c1" disabled />
                          <Label
                            htmlFor="r_c1"
                            className="flex items-center cursor-not-allowed font-normal text-slate-800 opacity-70"
                          >
                            <MapPin className="w-3.5 h-3.5 mr-1" /> Local
                            (Restrito à sua região)
                          </Label>
                        </div>
                      </RadioGroup>
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

            <div className="space-y-2">
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
                className="resize-none h-24"
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
                !formData.name || !formData.targetGroupId || !formData.content
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
