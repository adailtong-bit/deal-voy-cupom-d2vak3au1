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
import { Plus, Edit2, Trash2, Users } from 'lucide-react'
import { TargetGroup } from '@/lib/types'
import { CATEGORIES } from '@/lib/data'

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
  } = useCouponStore()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<TargetGroup | null>(null)

  const [formData, setFormData] = useState<Partial<TargetGroup>>({
    name: '',
    description: '',
    filters: { categories: [], frequency: 'all', location: '' },
  })

  const displayGroups = companyId
    ? targetGroups.filter((g) => g.companyId === companyId)
    : franchiseId
      ? targetGroups.filter((g) => g.franchiseId === franchiseId)
      : targetGroups

  const handleOpenDialog = (group?: TargetGroup) => {
    if (group) {
      setEditingGroup(group)
      setFormData(group)
    } else {
      setEditingGroup(null)
      setFormData({
        name: '',
        description: '',
        filters: { categories: [], frequency: 'all', location: '' },
      })
    }
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    if (editingGroup) {
      updateTargetGroup(editingGroup.id, formData)
    } else {
      addTargetGroup({
        ...(formData as TargetGroup),
        id: Math.random().toString(),
        createdAt: new Date().toISOString(),
        franchiseId: franchiseId,
        companyId: companyId,
        leadCount: Math.floor(Math.random() * 500) + 10, // Mock calculation
      })
    }
    setIsDialogOpen(false)
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <CardTitle>Grupos de Segmentação (Alvos)</CardTitle>
            <CardDescription>
              Crie segmentos baseados no perfil de consumo para usar em
              campanhas de marketing.
            </CardDescription>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" /> Novo Grupo
          </Button>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome do Grupo</TableHead>
                  <TableHead>Filtros Aplicados</TableHead>
                  {!franchiseId &&
                    !companyId &&
                    user?.role === 'super_admin' && (
                      <TableHead>Afiliação</TableHead>
                    )}
                  <TableHead>Leads Estimados</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
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
                      <div className="flex flex-wrap gap-1">
                        {group.filters?.categories &&
                          group.filters.categories.length > 0 && (
                            <Badge
                              variant="outline"
                              className="bg-slate-50 text-[10px]"
                            >
                              Cat: {group.filters.categories[0]}
                            </Badge>
                          )}
                        {group.filters?.frequency &&
                          group.filters.frequency !== 'all' && (
                            <Badge
                              variant="outline"
                              className="bg-slate-50 text-[10px]"
                            >
                              Freq: {group.filters.frequency}
                            </Badge>
                          )}
                        {group.filters?.location && (
                          <Badge
                            variant="outline"
                            className="bg-slate-50 text-[10px]"
                          >
                            Loc: {group.filters.location}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    {!franchiseId &&
                      !companyId &&
                      user?.role === 'super_admin' && (
                        <TableCell>
                          {group.companyId ? (
                            <Badge className="bg-purple-500">Loja</Badge>
                          ) : group.franchiseId ? (
                            <Badge variant="secondary">Franquia</Badge>
                          ) : (
                            <Badge className="bg-blue-500">Global</Badge>
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
                      Nenhum grupo de segmentação criado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingGroup ? 'Editar Grupo' : 'Criar Grupo de Segmentação'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Nome do Grupo</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ex: Amantes de Fast Food SP"
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Detalhes sobre este público..."
                className="resize-none"
              />
            </div>

            <div className="pt-4 border-t space-y-4">
              <h4 className="font-semibold text-sm">Filtros de Perfil</h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Categoria Preferida</Label>
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
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Frequência de Compra</Label>
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
                      <SelectValue placeholder="Qualquer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Qualquer Frequência</SelectItem>
                      <SelectItem value="high">
                        Alta (Comprador Frequente)
                      </SelectItem>
                      <SelectItem value="medium">Média (Ocasional)</SelectItem>
                      <SelectItem value="low">Baixa (Raro)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Localização Específica (Estado ou Cidade)</Label>
                <Input
                  placeholder="Ex: São Paulo"
                  value={formData.filters?.location || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      filters: {
                        ...formData.filters,
                        location: e.target.value,
                      },
                    })
                  }
                />
              </div>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex items-center justify-between mt-2">
              <span className="text-sm font-medium text-blue-800">
                Leads Estimados:
              </span>
              <span className="font-bold text-lg text-blue-600">
                ~{Math.floor(Math.random() * 300) + 50}
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={!formData.name}>
              Salvar Grupo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
