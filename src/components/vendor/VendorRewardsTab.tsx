import { useState } from 'react'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { Plus, Edit2, Trash2, Gift, DollarSign } from 'lucide-react'
import { RewardCatalogItem } from '@/lib/types'

export function VendorRewardsTab({ company }: { company: any }) {
  const {
    rewardCatalog,
    addRewardCatalogItem,
    updateRewardCatalogItem,
    deleteRewardCatalogItem,
  } = useCouponStore()
  const { t, formatCurrency } = useLanguage()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingReward, setEditingReward] = useState<RewardCatalogItem | null>(
    null,
  )
  const [formData, setFormData] = useState<Partial<RewardCatalogItem>>({
    title: '',
    description: '',
    type: 'fixed_discount',
    estimatedCost: 0,
  })

  const myRewards = rewardCatalog.filter((r) => r.companyId === company.id)

  const handleOpenDialog = (reward?: RewardCatalogItem) => {
    if (reward) {
      setEditingReward(reward)
      setFormData(reward)
    } else {
      setEditingReward(null)
      setFormData({
        title: '',
        description: '',
        type: 'fixed_discount',
        estimatedCost: 0,
      })
    }
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    if (editingReward) {
      updateRewardCatalogItem(editingReward.id, formData)
    } else {
      addRewardCatalogItem({
        ...(formData as RewardCatalogItem),
        id: `rc-${Math.random().toString(36).substr(2, 9)}`,
        companyId: company.id,
      })
    }
    setIsDialogOpen(false)
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'fixed_discount':
        return 'Desconto Fixo'
      case 'percentage':
        return 'Percentual'
      case 'item':
        return 'Item Grátis'
      default:
        return type
    }
  }

  const isValid =
    formData.title && formData.type && formData.estimatedCost !== undefined

  return (
    <div className="space-y-4 animate-fade-in-up">
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b bg-slate-50/50 pb-5">
          <div className="flex items-center gap-3">
            <div className="bg-pink-100 p-2 rounded-lg">
              <Gift className="h-5 w-5 text-pink-600" />
            </div>
            <div>
              <CardTitle className="text-xl">
                Catálogo de Recompensas Aprovadas
              </CardTitle>
              <CardDescription>
                Gerencie os benefícios pré-aprovados que podem ser oferecidos
                aos clientes no cumprimento de metas.
              </CardDescription>
            </div>
          </div>
          <Button onClick={() => handleOpenDialog()} className="font-bold">
            <Plus className="mr-2 h-4 w-4" /> Nova Recompensa
          </Button>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="rounded-lg border bg-white overflow-hidden shadow-sm">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-semibold text-slate-700">
                    Título da Recompensa
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700">
                    Descrição
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700">
                    Tipo
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700">
                    Custo Estimado
                  </TableHead>
                  <TableHead className="text-right font-semibold text-slate-700">
                    {t('common.actions', 'Ações')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myRewards.map((reward) => (
                  <TableRow key={reward.id} className="hover:bg-slate-50/50">
                    <TableCell className="font-medium text-slate-800">
                      {reward.title}
                    </TableCell>
                    <TableCell className="text-slate-600 truncate max-w-[200px]">
                      {reward.description || 'N/A'}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {getTypeLabel(reward.type)}
                    </TableCell>
                    <TableCell className="font-semibold text-slate-800">
                      {formatCurrency(reward.estimatedCost)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1 items-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(reward)}
                          title={t('common.edit', 'Editar')}
                        >
                          <Edit2 className="h-4 w-4 text-slate-500" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              title={t('common.delete', 'Excluir')}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Excluir Recompensa?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação não pode ser desfeita. Campanhas que
                                já utilizam esta recompensa manterão os dados
                                históricos.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>
                                {t('common.cancel', 'Cancelar')}
                              </AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-600 hover:bg-red-700 text-white"
                                onClick={() =>
                                  deleteRewardCatalogItem(reward.id)
                                }
                              >
                                {t('common.delete', 'Excluir')}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {myRewards.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-12 text-slate-500 border-dashed border-t"
                    >
                      <Gift className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                      Nenhuma recompensa cadastrada no catálogo.
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
              {editingReward
                ? 'Editar Recompensa'
                : 'Nova Recompensa (Catálogo)'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Título / Nome do Benefício</Label>
              <Input
                value={formData.title || ''}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Ex: 15% OFF, Sobremesa Grátis"
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição (Uso Interno)</Label>
              <Input
                value={formData.description || ''}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Detalhes ou regras específicas desta recompensa"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de Recompensa</Label>
                <Select
                  value={formData.type}
                  onValueChange={(v: any) =>
                    setFormData({ ...formData, type: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed_discount">
                      Desconto Fixo
                    </SelectItem>
                    <SelectItem value="percentage">Percentual</SelectItem>
                    <SelectItem value="item">Item Grátis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5" /> Custo Estimado
                </Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.estimatedCost ?? ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      estimatedCost: e.target.value
                        ? Number(e.target.value)
                        : 0,
                    })
                  }
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {t('common.cancel', 'Cancelar')}
            </Button>
            <Button onClick={handleSave} disabled={!isValid}>
              {t('common.save', 'Salvar')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
