import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/stores/LanguageContext'
import { PartnerBillingTab } from '@/components/admin/PartnerBillingTab'

export function FinanceTab() {
  const { t } = useLanguage()
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {t('franchisee.finance_tab.title', 'Visão Financeira')}
        </h2>
        <p className="text-muted-foreground">
          {t(
            'franchisee.finance_tab.desc',
            'Acompanhe as métricas financeiras gerais da sua franquia.',
          )}
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('franchisee.finance_tab.total_revenue', 'Receita Total')}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 45.231,89</div>
            <p className="text-xs text-emerald-600 flex items-center mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" /> +20.1%{' '}
              {t('franchisee.finance_tab.this_month', 'este mês')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('franchisee.finance_tab.expenses', 'Despesas')}
            </CardTitle>
            <ArrowDownRight className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 12.034,50</div>
            <p className="text-xs text-red-600 flex items-center mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" /> +4.5%{' '}
              {t('franchisee.finance_tab.this_month', 'este mês')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('franchisee.finance_tab.net_profit', 'Lucro Líquido')}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 33.197,39</div>
            <p className="text-xs text-emerald-600 flex items-center mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" /> +12.3%{' '}
              {t('franchisee.finance_tab.this_month', 'este mês')}
            </p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>
            {t(
              'franchisee.finance_tab.latest_transactions',
              'Últimas Transações',
            )}
          </CardTitle>
          <CardDescription>
            {t(
              'franchisee.finance_tab.history_desc',
              'Histórico de repasses e recebimentos.',
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-none">
                      {t(
                        'franchisee.finance_tab.merchant_transfer',
                        'Repasse Lojista',
                      )}{' '}
                      #{1000 + i}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t('franchisee.finance_tab.today_at', 'Hoje às')} 14:32
                    </p>
                  </div>
                </div>
                <div className="font-medium text-emerald-600">
                  + R$ {(Math.random() * 1000).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function BillingTab({ franchiseId }: { franchiseId?: string }) {
  const { t } = useLanguage()
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {t('franchisee.billing_tab.title', 'Faturamento e Cobranças')}
          </h2>
          <p className="text-muted-foreground">
            {t(
              'franchisee.billing_tab.desc',
              'Gerencie faturas e métodos de pagamento.',
            )}
          </p>
        </div>
      </div>

      <PartnerBillingTab franchiseId={franchiseId} />
    </div>
  )
}

export function MonetizationTab() {
  const { t } = useLanguage()
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {t('franchisee.monetization_tab.title', 'Monetização')}
        </h2>
        <p className="text-muted-foreground">
          {t(
            'franchisee.monetization_tab.desc',
            'Configuração de taxas e comissões da sua rede.',
          )}
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              {t(
                'franchisee.monetization_tab.setup_fee',
                'Taxa de Setup Lojista',
              )}
            </CardTitle>
            <CardDescription>
              {t(
                'franchisee.monetization_tab.setup_desc',
                'Valor cobrado na adesão de novos estabelecimentos.',
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-4 text-slate-800">
              R$ 299,00
            </div>
            <Button variant="outline" className="w-full">
              {t('franchisee.monetization_tab.adjust_value', 'Ajustar Valor')}
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>
              {t(
                'franchisee.monetization_tab.commission',
                'Comissão sobre Vendas',
              )}
            </CardTitle>
            <CardDescription>
              {t(
                'franchisee.monetization_tab.commission_desc',
                'Percentual retido por transação via app.',
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-4 text-slate-800">12%</div>
            <Button variant="outline" className="w-full">
              {t('franchisee.monetization_tab.adjust_margin', 'Ajustar Margem')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export function AdsRoyaltiesTab() {
  const { t } = useLanguage()
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {t('franchisee.ads_royalties_tab.title', 'Ads & Royalties')}
        </h2>
        <p className="text-muted-foreground">
          {t(
            'franchisee.ads_royalties_tab.desc',
            'Receitas de publicidade e repasses da franqueadora.',
          )}
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>
            {t(
              'franchisee.ads_royalties_tab.ad_revenue',
              'Ganhos com Anúncios (Rede)',
            )}
          </CardTitle>
          <CardDescription>
            {t(
              'franchisee.ads_royalties_tab.ad_revenue_desc',
              'Receita gerada por banners e espaços patrocinados.',
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-primary mb-2">
            R$ 8.450,00
          </div>
          <p className="text-sm text-slate-500 mb-6">
            {t(
              'franchisee.ads_royalties_tab.accumulated',
              'Acumulado no mês atual. O repasse será realizado dia 05.',
            )}
          </p>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm border-b pb-2">
              <span className="text-slate-600">
                {t(
                  'franchisee.ads_royalties_tab.main_banner',
                  'Banner Principal App',
                )}
              </span>
              <span className="font-bold text-slate-800">R$ 4.200,00</span>
            </div>
            <div className="flex justify-between items-center text-sm border-b pb-2">
              <span className="text-slate-600">
                {t(
                  'franchisee.ads_royalties_tab.search_highlight',
                  'Destaque na Busca',
                )}
              </span>
              <span className="font-bold text-slate-800">R$ 3.100,00</span>
            </div>
            <div className="flex justify-between items-center text-sm pb-2">
              <span className="text-slate-600">
                {t(
                  'franchisee.ads_royalties_tab.push_notifications',
                  'Notificações Push',
                )}
              </span>
              <span className="font-bold text-slate-800">R$ 1.150,00</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
