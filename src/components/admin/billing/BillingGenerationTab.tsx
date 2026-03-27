import { useState, useMemo } from 'react'
import { useLanguage } from '@/stores/LanguageContext'
import { useCouponStore } from '@/stores/CouponContext'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Play, Settings2, FileText, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

export function BillingGenerationTab({
  franchiseId,
}: {
  franchiseId?: string
}) {
  const { t } = useLanguage()
  const { generatePartnerInvoice, companies, partnerInvoices } =
    useCouponStore()
  const [period, setPeriod] = useState('last_month')
  const [targetType, setTargetType] = useState('all')

  const availableCompanies = useMemo(
    () =>
      franchiseId
        ? companies.filter((c) => c.franchiseId === franchiseId)
        : companies,
    [companies, franchiseId],
  )

  const { start, end } = useMemo(() => {
    const now = new Date()
    if (period === 'last_month') {
      return {
        start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        end: new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59),
      }
    }
    if (period === 'current_month') {
      return {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: now,
      }
    }
    // For custom, defaults to now
    return { start: now, end: now }
  }, [period])

  const pendingCompanies = useMemo(() => {
    const startMonth = start.getMonth()
    const startYear = start.getFullYear()
    return availableCompanies.filter((c) => {
      const hasInvoice = partnerInvoices.some((inv) => {
        const invDate = new Date(inv.periodStart)
        return (
          inv.companyId === c.id &&
          invDate.getMonth() === startMonth &&
          invDate.getFullYear() === startYear
        )
      })
      return !hasInvoice
    })
  }, [availableCompanies, partnerInvoices, start])

  const isBlocked =
    pendingCompanies.length === 0 && availableCompanies.length > 0

  const handleGenerate = () => {
    if (isBlocked) return
    if (pendingCompanies.length === 0) {
      toast.error(
        t(
          'franchisee.billing.no_partners_error',
          'Nenhum parceiro disponível para gerar faturas.',
        ),
      )
      return
    }

    pendingCompanies.forEach((targetCompany) => {
      generatePartnerInvoice({
        franchiseId,
        companyId: targetCompany.id,
        totalCommission: Math.floor(Math.random() * 2000) + 150,
        totalCashback: Math.floor(Math.random() * 500) + 50,
        totalSales: Math.floor(Math.random() * 10000) + 1000,
        transactionCount: Math.floor(Math.random() * 100) + 10,
        status: 'draft',
        periodStart: start.toISOString(),
        periodEnd: end.toISOString(),
        targetType: 'merchant',
      })
    })

    toast.success(
      t(
        'franchisee.billing.generation_success',
        'Processo de geração concluído. Faturas adicionadas à Área de Preparação.',
      ),
    )
  }

  return (
    <Card className="w-full min-w-0 overflow-hidden shadow-sm border-slate-200 max-w-3xl">
      <CardHeader className="min-w-0 pb-4 border-b border-slate-100 bg-white">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <CardTitle className="truncate text-lg sm:text-xl text-slate-800">
              {t('franchisee.billing.generation_title', 'Geração de Faturas')}
            </CardTitle>
            <CardDescription className="truncate text-slate-500">
              {t(
                'franchisee.billing.generation_desc',
                'Gere faturas consolidadas para os parceiros com base no consumo do período.',
              )}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 w-full bg-white space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label className="text-slate-700 font-semibold">
              {t('franchisee.billing.generation_period', 'Período de Apuração')}
            </Label>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-full bg-slate-50 border-slate-200">
                <SelectValue placeholder={t('common.select', 'Selecione')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last_month">
                  {t('franchisee.billing.period_last_month', 'Mês Passado')}
                </SelectItem>
                <SelectItem value="current_month">
                  {t(
                    'franchisee.billing.period_current_month',
                    'Mês Atual (Parcial)',
                  )}
                </SelectItem>
                <SelectItem value="custom">
                  {t(
                    'franchisee.billing.period_custom',
                    'Período Personalizado',
                  )}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="text-slate-700 font-semibold">
              {t('franchisee.billing.generation_scope', 'Escopo de Lojistas')}
            </Label>
            <Select value={targetType} onValueChange={setTargetType}>
              <SelectTrigger className="w-full bg-slate-50 border-slate-200">
                <SelectValue placeholder={t('common.select', 'Selecione')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t(
                    'franchisee.billing.scope_all',
                    'Todos os Lojistas Ativos',
                  )}
                </SelectItem>
                <SelectItem value="cpa_only">
                  {t('franchisee.billing.scope_cpa', 'Apenas Modelo CPA')}
                </SelectItem>
                <SelectItem value="cpc_only">
                  {t('franchisee.billing.scope_cpc', 'Apenas Modelo CPC')}
                </SelectItem>
                <SelectItem value="fixed_only">
                  {t('franchisee.billing.scope_fixed', 'Apenas Taxa Fixa')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {period === 'custom' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100 animate-fade-in">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-500 uppercase">
                {t('franchisee.billing.start_date', 'Data Inicial')}
              </Label>
              <Input type="date" className="bg-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-500 uppercase">
                {t('franchisee.billing.end_date', 'Data Final')}
              </Label>
              <Input type="date" className="bg-white" />
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3 text-sm text-blue-800">
          <Settings2 className="h-5 w-5 shrink-0 text-blue-500" />
          <p>
            {t(
              'franchisee.billing.generation_info',
              'O processo de geração varre as políticas de parceiros configuradas e o volume transacionado no período selecionado.',
            )}
            <strong>
              {' '}
              {t(
                'franchisee.billing.generation_info_bold',
                'As faturas geradas serão enviadas para a "Área de Preparação" e não serão cobradas automaticamente até a sua aprovação.',
              )}
            </strong>
          </p>
        </div>

        {isBlocked && (
          <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 flex gap-3 text-sm text-amber-800">
            <AlertCircle className="h-5 w-5 shrink-0 text-amber-500" />
            <p>
              <strong>
                {t(
                  'franchisee.billing.already_generated',
                  'Faturas já geradas.',
                )}
              </strong>{' '}
              {t(
                'franchisee.billing.already_generated_desc',
                'Todas as faturas para os lojistas ativos neste período já foram criadas e estão na área de preparação ou histórico.',
              )}
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-6 pt-0 bg-white border-t border-slate-100 flex flex-col sm:flex-row justify-end gap-3 mt-6">
        <Button
          variant="outline"
          className="font-semibold text-slate-600 w-full sm:w-auto"
        >
          {t('franchisee.billing.schedule_routine', 'Agendar Rotina')}
        </Button>
        <Button
          onClick={handleGenerate}
          disabled={isBlocked}
          className="font-bold shadow-md w-full sm:w-auto"
        >
          <Play className="h-4 w-4 mr-2 fill-current" />
          {t('franchisee.billing.process_generation', 'Processar Geração')}
        </Button>
      </CardFooter>
    </Card>
  )
}
