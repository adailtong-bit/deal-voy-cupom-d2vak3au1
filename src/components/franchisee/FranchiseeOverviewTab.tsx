import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useLanguage } from '@/stores/LanguageContext'
import { useRegionFormatting } from '@/hooks/useRegionFormatting'
import { useCouponStore } from '@/stores/CouponContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CreditCard, Users, Ticket, DollarSign } from 'lucide-react'
import { cn } from '@/lib/utils'

export function FranchiseeOverviewTab({
  franchiseId,
}: {
  franchiseId: string
}) {
  const { t } = useLanguage()
  const {
    franchises,
    companies,
    validationLogs,
    coupons,
    ads,
    platformSettings,
  } = useCouponStore()
  const location = useLocation()
  const isFranchisee = location.pathname.includes('/franchisee')

  const myFranchise = franchises.find((f) => f.id === franchiseId)
  const { formatCurrency, formatNumber } = useRegionFormatting(
    myFranchise?.region,
    myFranchise?.addressCountry,
  )

  const franchiseCompanies = useMemo(
    () =>
      myFranchise
        ? companies.filter((c) => c.franchiseId === myFranchise.id)
        : [],
    [companies, myFranchise?.id],
  )
  const franchiseCompanyIds = useMemo(
    () => franchiseCompanies.map((c) => c.id),
    [franchiseCompanies],
  )

  const franchiseLogs = useMemo(
    () =>
      validationLogs.filter((log) =>
        franchiseCompanyIds.includes(log.companyId || ''),
      ),
    [validationLogs, franchiseCompanyIds],
  )

  const totalSales = useMemo(() => {
    return franchiseLogs.reduce((acc, log) => {
      const cpn = coupons.find((c) => c.id === log.couponId)
      return acc + (cpn?.price || 50)
    }, 0)
  }, [franchiseLogs, coupons])

  const totalLeads = franchiseLogs.length

  const franchiseCoupons = useMemo(
    () =>
      coupons.filter((c) => franchiseCompanyIds.includes(c.companyId || '')),
    [coupons, franchiseCompanyIds],
  )
  const activeCampaigns = franchiseCoupons.filter(
    (c) => c.status === 'active',
  ).length

  const franchiseAds = useMemo(
    () =>
      myFranchise ? ads.filter((a) => a.franchiseId === myFranchise.id) : [],
    [ads, myFranchise?.id],
  )

  const royaltyRate = platformSettings.franchiseRoyaltyRate || 15
  const adRevenue = franchiseAds.reduce(
    (sum, ad) => sum + (ad.price || ad.budget || 0),
    0,
  )
  const totalRoyalties = adRevenue * (royaltyRate / 100)

  if (!myFranchise) return null

  return (
    <div
      className={cn(
        'space-y-6 animate-fade-in-up w-full',
        !isFranchisee && 'min-w-0 max-w-full',
      )}
    >
      <div className="min-w-0">
        <h2 className="text-2xl font-bold text-slate-800 truncate">
          {t('franchisee.overview.title', 'Visão Geral')}
        </h2>
        <p className="text-muted-foreground line-clamp-2 sm:line-clamp-none">
          {t(
            'franchisee.overview.desc',
            `Métricas consolidadas da região de ${myFranchise.region}.`,
          ).replace(
            '{region}',
            myFranchise.region || myFranchise.addressCountry || '',
          )}
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 min-w-0">
        <Card className="shadow-sm border-slate-200 min-w-0 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2 min-w-0">
            <CardTitle className="text-sm font-semibold text-slate-600 uppercase truncate">
              {t('franchisee.overview.sales', 'Vendas Regionais')}
            </CardTitle>
            <CreditCard className="h-4 w-4 text-emerald-500 shrink-0" />
          </CardHeader>
          <CardContent className="min-w-0">
            <div className="text-2xl font-black text-slate-800 truncate">
              {formatCurrency(totalSales)}
            </div>
            <p className="text-xs text-emerald-600 mt-1 font-medium truncate">
              {t('franchisee.overview.sales_desc', 'Volume transacionado')}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-slate-200 min-w-0 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2 min-w-0">
            <CardTitle className="text-sm font-semibold text-slate-600 uppercase truncate">
              {t('franchisee.overview.leads', 'Leads Capturados')}
            </CardTitle>
            <Users className="h-4 w-4 text-blue-500 shrink-0" />
          </CardHeader>
          <CardContent className="min-w-0">
            <div className="text-2xl font-black text-slate-800 truncate">
              {formatNumber(totalLeads)}
            </div>
            <p className="text-xs text-slate-400 mt-1 font-medium truncate">
              {t('franchisee.overview.leads_desc', 'Clientes adquiridos')}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-slate-200 min-w-0 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2 min-w-0">
            <CardTitle className="text-sm font-semibold text-slate-600 uppercase truncate">
              {t('franchisee.overview.campaigns', 'Campanhas Ativas')}
            </CardTitle>
            <Ticket className="h-4 w-4 text-orange-500 shrink-0" />
          </CardHeader>
          <CardContent className="min-w-0">
            <div className="text-2xl font-black text-slate-800 truncate">
              {formatNumber(activeCampaigns)}
            </div>
            <p className="text-xs text-slate-400 mt-1 font-medium truncate">
              {t(
                'franchisee.overview.campaigns_desc',
                'De {total} no total',
              ).replace('{total}', String(franchiseCoupons.length))}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-slate-200 border-l-4 border-l-orange-500 min-w-0 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2 min-w-0">
            <CardTitle className="text-sm font-semibold text-slate-600 uppercase truncate">
              {t('franchisee.overview.royalties', 'Royalties Devidos')}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-orange-500 shrink-0" />
          </CardHeader>
          <CardContent className="min-w-0">
            <div className="text-2xl font-black text-orange-600 truncate">
              {formatCurrency(totalRoyalties)}
            </div>
            <p className="text-xs text-slate-400 mt-1 font-medium truncate">
              {t(
                'franchisee.overview.royalties_desc',
                '{rate}% sobre publicidade',
              ).replace('{rate}', String(royaltyRate))}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
