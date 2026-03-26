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
import { Textarea } from '@/components/ui/textarea'
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
import { Plus, Edit2, Trash2, Zap } from 'lucide-react'
import { StandardRule } from '@/lib/types'

export function VendorRulesTab({ company }: { company: any }) {
  const {
    standardRules,
    addStandardRule,
    updateStandardRule,
    deleteStandardRule,
  } = useCouponStore()
  const { t } = useLanguage()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<StandardRule | null>(null)
  const [formData, setFormData] = useState<Partial<StandardRule>>({
    name: '',
    instructions: '',
    triggerType: 'visit',
    threshold: 1,
    reward: '',
  })

  const myRules = standardRules.filter((r) => r.companyId === company.id)

  const handleOpenDialog = (rule?: StandardRule) => {
    if (rule) {
      setEditingRule(rule)
      setFormData(rule)
    } else {
      setEditingRule(null)
      setFormData({
        name: '',
        instructions: '',
        triggerType: 'visit',
        threshold: 1,
        reward: '',
      })
    }
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    if (editingRule) {
      updateStandardRule(editingRule.id, formData)
    } else {
      addStandardRule({
        ...(formData as StandardRule),
        id: Math.random().toString(),
        companyId: company.id,
      })
    }
    setIsDialogOpen(false)
  }

  const getTypeLabel = (type?: string) => {
    switch (type) {
      case 'visit':
        return t('vendor.rules.type_visit', 'Número de Visitas')
      case 'amount_spent':
        return t('vendor.rules.type_amount', 'Valor Gasto')
      case 'specific_action':
        return t('vendor.rules.type_action', 'Ação Específica')
      case 'share':
        return t('vendor.rules.type_share', 'Compartilhamento')
      default:
        return type
    }
  }

  return (
    <div className="space-y-4 animate-fade-in-up">
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b bg-slate-50/50 pb-5">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">
                {t('vendor.rules.title', 'Gerenciamento de Regras de Campanha')}
              </CardTitle>
              <CardDescription>
                {t(
                  'vendor.rules.desc',
                  'Crie e gerencie os modelos de regras de campanha, incluindo instruções e gatilhos de fidelidade.',
                )}
              </CardDescription>
            </div>
          </div>
          <Button onClick={() => handleOpenDialog()} className="font-bold">
            <Plus className="mr-2 h-4 w-4" />{' '}
            {t('vendor.rules.new_rule', 'Nova Regra')}
          </Button>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="rounded-lg border bg-white overflow-hidden shadow-sm">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-semibold text-slate-700">
                    {t('vendor.rules.name', 'Nome da Regra')}
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700">
                    Instruções
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700">
                    {t('vendor.rules.type', 'Tipo de Gatilho')}
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700">
                    {t('vendor.rules.threshold', 'Meta (Alvo)')}
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700">
                    {t('vendor.rules.reward', 'Recompensa')}
                  </TableHead>
                  <TableHead className="text-right font-semibold text-slate-700">
                    {t('common.actions', 'Ações')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myRules.map((rule) => (
                  <TableRow key={rule.id} className="hover:bg-slate-50/50">
                    <TableCell className="font-medium text-slate-800">
                      {rule.name}
                    </TableCell>
                    <TableCell className="text-slate-600 truncate max-w-[200px]">
                      {rule.instructions || 'N/A'}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {getTypeLabel(rule.triggerType)}
                    </TableCell>
                    <TableCell className="text-slate-600 font-medium">
                      {rule.threshold}
                    </TableCell>
                    <TableCell className="text-primary font-semibold">
                      {rule.reward}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1 items-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(rule)}
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
                                {t(
                                  'vendor.rules.delete_title',
                                  'Excluir Regra?',
                                )}
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                {t(
                                  'vendor.rules.delete_desc',
                                  'Esta ação não pode ser desfeita. Campanhas que já utilizam esta regra não serão afetadas.',
                                )}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>
                                {t('common.cancel', 'Cancelar')}
                              </AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-600 hover:bg-red-700 text-white"
                                onClick={() => deleteStandardRule(rule.id)}
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
                {myRules.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-12 text-slate-500 border-dashed border-t"
                    >
                      <Zap className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                      {t(
                        'vendor.rules.empty',
                        'Nenhuma regra de campanha cadastrada.',
                      )}
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
              {editingRule
                ? t('vendor.rules.edit_rule', 'Editar Regra de Campanha')
                : t('vendor.rules.new_rule', 'Nova Regra de Campanha')}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>
                {t('vendor.rules.form_name', 'Nome da Regra (Uso Interno)')}
              </Label>
              <Input
                value={formData.name || ''}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder={t('vendor.rules.name_ph', 'Ex: Fidelidade Ouro')}
              />
            </div>
            <div className="space-y-2">
              <Label>
                {t(
                  'vendor.rules.form_instructions',
                  'Instruções (Termos da Oferta)',
                )}
              </Label>
              <Textarea
                value={formData.instructions || ''}
                onChange={(e) =>
                  setFormData({ ...formData, instructions: e.target.value })
                }
                placeholder="Ex: Válido apenas para consumo no local..."
                className="resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label>{t('vendor.rules.form_type', 'Tipo de Gatilho')}</Label>
              <Select
                value={formData.triggerType || 'visit'}
                onValueChange={(v: any) =>
                  setFormData({ ...formData, triggerType: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="visit">
                    {t('vendor.rules.type_visit', 'Número de Visitas')}
                  </SelectItem>
                  <SelectItem value="amount_spent">
                    {t('vendor.rules.type_amount', 'Valor Gasto')}
                  </SelectItem>
                  <SelectItem value="specific_action">
                    {t('vendor.rules.type_action', 'Ação Específica')}
                  </SelectItem>
                  <SelectItem value="share">
                    {t('vendor.rules.type_share', 'Compartilhamento')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>
                {t('vendor.rules.form_threshold', 'Meta para Atingir (Alvo)')}
              </Label>
              <Input
                type="number"
                min="1"
                value={formData.threshold || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    threshold: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
                placeholder="Ex: 5"
              />
            </div>
            <div className="space-y-2">
              <Label>
                {t('vendor.rules.form_reward', 'Recompensa Concedida')}
              </Label>
              <Input
                value={formData.reward || ''}
                onChange={(e) =>
                  setFormData({ ...formData, reward: e.target.value })
                }
                placeholder={t('vendor.rules.reward_ph', 'Ex: 1 Café Grátis')}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {t('common.cancel', 'Cancelar')}
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                !formData.name || !formData.threshold || !formData.reward
              }
            >
              {t('common.save', 'Salvar')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
