import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCouponStore } from '@/stores/CouponContext'
import { useLanguage } from '@/stores/LanguageContext'
import { Users, Ticket, DollarSign, Megaphone } from 'lucide-react'

export function VendorStats({ company, activeCampaigns }: any) {
  const { validationLogs } = useCouponStore()
  const { t } = useLanguage()

  const isNY = company?.region === 'US-NY'
  const currency = isNY ? 'USD' : 'BRL'
  const locale = isNY ? 'en-US' : 'pt-BR'

  const customFormat = (val: number) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(val)
  }

  const stats = useMemo(() => {
    if (!company) return { redemptions: 0, leads: 0, revenue: 0 }
    const logs = validationLogs.filter((l) => l.companyId === company.id)
    const leads = new Set(logs.map((l) => l.userId).filter(Boolean)).size

    const estRevenue = logs.length * 45.5

    return {
      redemptions: logs.length,
      leads,
      revenue: estRevenue,
    }
  }, [validationLogs, company])

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8 animate-fade-in-up">
      <Card className="shadow-sm border-slate-200 bg-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">
            {t('vendor.stats.total_redemptions', 'Total de Resgates')}
          </CardTitle>
          <div className="bg-primary/10 p-2 rounded-lg">
            <Ticket className="h-4 w-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-slate-800">
            {stats.redemptions}
          </div>
          <p className="text-xs text-emerald-600 font-medium flex items-center mt-1">
            +12% do último mês
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-slate-200 bg-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">
            {t('vendor.stats.active_leads', 'Leads Ativos (CRM)')}
          </CardTitle>
          <div className="bg-blue-50 p-2 rounded-lg">
            <Users className="h-4 w-4 text-blue-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-slate-800">{stats.leads}</div>
          <p className="text-xs text-emerald-600 font-medium flex items-center mt-1">
            +5 novos esta semana
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-slate-200 bg-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">
            {t('vendor.stats.est_revenue', 'Receita Estimada')}
          </CardTitle>
          <div className="bg-emerald-50 p-2 rounded-lg">
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-slate-800">
            {customFormat(stats.revenue)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {t('vendor.stats.based_on_ticket', 'Baseado no ticket médio')}
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-slate-200 bg-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">
            {t('vendor.stats.active_campaigns', 'Campanhas Ativas')}
          </CardTitle>
          <div className="bg-orange-50 p-2 rounded-lg">
            <Megaphone className="h-4 w-4 text-orange-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-slate-800">
            {activeCampaigns}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {t('vendor.stats.active_scheduled', 'Ativas / Agendadas')}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
