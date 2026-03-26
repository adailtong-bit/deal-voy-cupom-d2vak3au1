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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Send,
  Plus,
  Smartphone,
  Mail,
  Bell,
  Globe,
  MapPin,
  Map,
} from 'lucide-react'
import { CommunicationCampaign } from '@/lib/types'

export function CommunicationCampaignsTab({
  franchiseId,
}: {
  franchiseId?: string
}) {
  const {
    communicationCampaigns,
    targetGroups,
    createCommunicationCampaign,
    user,
  } = useCouponStore()

  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const [formData, setFormData] = useState<Partial<CommunicationCampaign>>({
    name: '',
    targetGroupId: '',
    channel: 'push',
    geographicScope: 'local',
    volumeImpact: 100,
    content: '',
  })

  const displayCampaigns = franchiseId
    ? communicationCampaigns.filter((c) => c.franchiseId === franchiseId)
    : communicationCampaigns

  const availableGroups = franchiseId
    ? targetGroups.filter(
        (g) => g.franchiseId === franchiseId || !g.franchiseId,
      )
    : targetGroups

  const handleOpenDialog = () => {
    setFormData({
      name: '',
      targetGroupId: availableGroups[0]?.id || '',
      channel: 'push',
      geographicScope: 'local',
      volumeImpact: 100,
      content: '',
    })
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    createCommunicationCampaign({
      ...(formData as CommunicationCampaign),
      id: Math.random().toString(),
      status: 'scheduled',
      createdAt: new Date().toISOString(),
      scheduledAt: new Date(Date.now() + 3600000).toISOString(), // mock schedule 1h future
      franchiseId: franchiseId,
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

  return (
    <div className="space-y-4 animate-fade-in">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <CardTitle>Disparos & Campanhas</CardTitle>
            <CardDescription>
              Crie campanhas multicanal focadas em grupos específicos para
              aumentar o engajamento.
            </CardDescription>
          </div>
          <Button onClick={handleOpenDialog}>
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
                  <TableHead>Alcance</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayCampaigns.map((camp) => (
                  <TableRow key={camp.id}>
                    <TableCell className="font-semibold">{camp.name}</TableCell>
                    <TableCell>{getTargetName(camp.targetGroupId)}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="capitalize flex items-center gap-1.5 w-fit"
                      >
                        {getChannelIcon(camp.channel)} {camp.channel}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded">
                        {camp.geographicScope} ({camp.volumeImpact}%)
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          camp.status === 'sent' ? 'default' : 'secondary'
                        }
                        className="capitalize bg-emerald-500 hover:bg-emerald-600"
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
                placeholder="Ex: Black Friday Push SP"
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

            <div className="space-y-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <Label className="text-base font-semibold">
                Configurações de Alcance
              </Label>

              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">
                    Cobertura Geográfica
                  </Label>
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
                        <MapPin className="w-3.5 h-3.5 mr-1" /> Local (Cidade)
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
                    {(!franchiseId || user?.role === 'super_admin') && (
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="national" id="r3" />
                        <Label
                          htmlFor="r3"
                          className="flex items-center cursor-pointer font-normal"
                        >
                          <Globe className="w-3.5 h-3.5 mr-1" /> Nacional
                        </Label>
                      </div>
                    )}
                  </RadioGroup>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-muted-foreground">
                      Volume de Impacto (Randomização)
                    </Label>
                    <span className="font-bold text-primary">
                      {formData.volumeImpact}% da base
                    </span>
                  </div>
                  <Slider
                    defaultValue={[100]}
                    value={[formData.volumeImpact || 100]}
                    max={100}
                    step={5}
                    onValueChange={(vals) =>
                      setFormData({ ...formData, volumeImpact: vals[0] })
                    }
                    className="py-2"
                  />
                  <p className="text-[10px] text-slate-500 leading-tight">
                    Use esta opção para testes A/B ou para controlar o fluxo de
                    clientes na loja, atingindo apenas uma parcela aleatória do
                    grupo alvo.
                  </p>
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
