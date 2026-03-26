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
import { Plus, Edit2, Trash2, Zap, AlertTriangle } from 'lucide-react'
import { StandardRule } from '@/lib/types'
import { Switch } from '@/components/ui/switch'

export function VendorRulesTab({ company }: { company: any }) {
  const {
    standardRules,
    rewardCatalog,
    addStandardRule,
    updateStandardRule,
    deleteStandardRule,
  } = useCouponStore()
  const { t, formatCurrency } = useLanguage()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<StandardRule | null>(null)
  const [formData, setFormData] = useState<Partial<StandardRule>>({
    name: '',
    instructions: '',
    isLogicEnabled: true,
    triggerType: 'coupon_usage',
    threshold: 1,
    rewardId: '',
  })

  const myRules = standardRules.filter((r) => r.companyId === company.id)
  const myRewards = rewardCatalog.filter((r) => r.companyId === company.id)

  const handleOpenDialog = (rule?: StandardRule) => {
    if (rule) {
      setEditingRule(rule)
      setFormData({
        ...rule,
        isLogicEnabled: rule.isLogicEnabled ?? true,
      })
    } else {
      setEditingRule(null)
      setFormData({
        name: '',
        instructions: '',
        isLogicEnabled: true,
        triggerType: 'coupon_usage',
        threshold: 1,
        rewardId: '',
      })
    }
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    const isLogicEnabled = formData.isLogicEnabled !== false
    const finalData = {
      ...(formData as StandardRule),
      isLogicEnabled,
      triggerType: isLogicEnabled ? formData.triggerType : undefined,
      threshold: isLogicEnabled ? formData.threshold : undefined,
      rewardId: isLogicEnabled ? formData.rewardId : undefined,
      reward:
        isLogicEnabled && formData.rewardId
          ? myRewards.find((r) => r.id === formData.rewardId)?.title
          : undefined,
    }

    if (editingRule) {
      updateStandardRule(editingRule.id, finalData)
    } else {
      addStandardRule({
        ...(finalData as StandardRule),
        id: Math.random().toString(),
        companyId: company.id,
      })
    }
    setIsDialogOpen(false)
  }

  const getTypeLabel = (type?: string) => {
    if (!type) return 'N/A'
    return t(`triggers.${type}`, type)
  }

  const isValid =
    formData.name &&
    (formData.isLogicEnabled === false ||
      (formData.triggerType && formData.threshold && formData.rewardId))

  const selectedReward = formData.rewardId
    ? myRewards.find((r) => r.id === formData.rewardId)
    : null

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
                {t(
                  'vendor.rules_module.title',
                  'Gerenciamento de Regras de Campanha',
                )}
              </CardTitle>
              <CardDescription>
                {t(
                  'vendor.rules_module.desc',
                  'Configure o Modelo com metas, separando os textos visuais da lógica que aprova e entrega a recompensa.',
                )}
              </CardDescription>
            </div>
          </div>
          <Button onClick={() => handleOpenDialog()} className="font-bold">
            <Plus className="mr-2 h-4 w-4" />{' '}
            {t('vendor.rules_module.new_rule', 'Nova Regra')}
          </Button>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="rounded-lg border bg-white overflow-hidden shadow-sm">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-semibold text-slate-700">
                    {t('vendor.rules_module.col_name', 'Nome da Regra')}
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700">
                    {t('vendor.rules_module.col_logic', 'Lógica Ativa?')}
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700">
                    {t('vendor.rules_module.col_trigger', 'Meta (Gatilho)')}
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700">
                    {t(
                      'vendor.rules_module.col_reward',
                      'Recompensa Vinculada',
                    )}
                  </TableHead>
                  <TableHead className="text-right font-semibold text-slate-700">
                    {t('common.actions', 'Ações')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myRules.map((rule) => {
                  const logicActive = rule.isLogicEnabled !== false
                  return (
                    <TableRow key={rule.id} className="hover:bg-slate-50/50">
                      <TableCell className="font-medium text-slate-800">
                        {rule.name}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${logicActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}
                        >
                          {logicActive
                            ? t('vendor.rules_module.logic_yes', 'Sim')
                            : t(
                                'vendor.rules_module.logic_text',
                                'Apenas Texto',
                              )}
                        </span>
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {logicActive ? (
                          <span>
                            {rule.threshold} {getTypeLabel(rule.triggerType)}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">
                            {t('vendor.rules_module.disabled', 'Desativado')}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-primary font-semibold">
                        {logicActive ? (
                          rule.reward ||
                          myRewards.find((r) => r.id === rule.rewardId)
                            ?.title ||
                          'N/A'
                        ) : (
                          <span className="text-slate-400 italic font-normal">
                            {t('common.none', 'Nenhuma')}
                          </span>
                        )}
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
                                    'vendor.rules_module.delete_title',
                                    'Excluir Regra?',
                                  )}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  {t(
                                    'vendor.rules_module.delete_desc',
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
                  )
                })}
                {myRules.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-12 text-slate-500 border-dashed border-t"
                    >
                      <Zap className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                      {t(
                        'vendor.rules_module.empty',
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
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRule
                ? t('vendor.rules_module.edit_rule', 'Editar Regra de Campanha')
                : t('vendor.rules_module.new_rule', 'Nova Regra de Campanha')}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-5 py-4">
            <div className="space-y-2">
              <Label>
                {t(
                  'vendor.rules_module.form_name',
                  'Nome da Regra (Uso Interno)',
                )}
              </Label>
              <Input
                value={formData.name || ''}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder={t(
                  'vendor.rules_module.name_ph',
                  'Ex: Fidelidade Ouro',
                )}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex justify-between items-end">
                <span>
                  {t(
                    'vendor.rules_module.form_instructions',
                    'Instruções Visuais (Exibição para o Cliente)',
                  )}
                </span>
              </Label>
              <Textarea
                value={formData.instructions || ''}
                onChange={(e) =>
                  setFormData({ ...formData, instructions: e.target.value })
                }
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {t(
                  'vendor.rules_module.form_instructions_desc',
                  'Este texto será exibido no card da oferta.',
                )}
              </p>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="space-y-0.5">
                <Label className="text-base font-semibold text-slate-800">
                  {t(
                    'vendor.rules_module.enable_logic',
                    'Ativar Lógica (Backend)',
                  )}
                </Label>
                <p className="text-xs text-slate-500">
                  {t(
                    'vendor.rules_module.enable_logic_desc',
                    'Se ativo, o sistema rastreará metas e liberará a recompensa definida.',
                  )}
                </p>
              </div>
              <Switch
                checked={formData.isLogicEnabled ?? true}
                onCheckedChange={(c) =>
                  setFormData({ ...formData, isLogicEnabled: c })
                }
              />
            </div>

            {formData.isLogicEnabled !== false && (
              <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2">
                <h4 className="font-semibold text-sm text-slate-800 border-b pb-2">
                  {t(
                    'vendor.rules_module.params_title',
                    'Parametrização de Metas e Recompensas',
                  )}
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>
                      {t('vendor.rules_module.trigger_type', 'Tipo de Meta')}
                    </Label>
                    <Select
                      value={formData.triggerType || 'coupon_usage'}
                      onValueChange={(v: any) =>
                        setFormData({ ...formData, triggerType: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="share">
                          {t('triggers.share', 'Compartilhamento')}
                        </SelectItem>
                        <SelectItem value="coupon_usage">
                          {t('triggers.coupon_usage', 'Uso de Cupom')}
                        </SelectItem>
                        <SelectItem value="visualization">
                          {t('triggers.visualization', 'Visualização')}
                        </SelectItem>
                        <SelectItem value="link_click">
                          {t('triggers.link_click', 'Clique no Link')}
                        </SelectItem>
                        <SelectItem value="visit">
                          {t('triggers.visit', 'Número de Visitas')}
                        </SelectItem>
                        <SelectItem value="amount_spent">
                          {t('triggers.amount_spent', 'Valor Gasto')}
                        </SelectItem>
                        <SelectItem value="specific_action">
                          {t('triggers.specific_action', 'Ação Específica')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>
                      {t(
                        'vendor.rules_module.trigger_threshold',
                        'Valor Alvo (Quantia)',
                      )}
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
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>
                    {t(
                      'vendor.rules_module.reward_to_grant',
                      'Recompensa a Conceder',
                    )}
                  </Label>
                  <Select
                    value={formData.rewardId || ''}
                    onValueChange={(v) =>
                      setFormData({ ...formData, rewardId: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {myRewards.length === 0 && (
                        <SelectItem value="none" disabled>
                          {t(
                            'vendor.rules_module.reward_desc',
                            'Nenhuma recompensa aprovada no catálogo',
                          )}
                        </SelectItem>
                      )}
                      {myRewards.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {t(
                      'vendor.rules_module.reward_desc',
                      'Apenas itens do Catálogo de Recompensas Aprovadas são listados.',
                    )}
                  </p>

                  {selectedReward && selectedReward.estimatedCost >= 50 && (
                    <div className="flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 p-2.5 rounded-md text-xs font-semibold mt-3 animate-in fade-in">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span>
                        {t(
                          'vendor.rules_module.financial_risk',
                          'Aviso de Risco Financeiro: Esta recompensa tem um custo estimado alto ({cost}). Certifique-se de que a meta justifica o custo.',
                        ).replace(
                          '{cost}',
                          formatCurrency(selectedReward.estimatedCost),
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
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
