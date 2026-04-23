import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useLanguage } from '@/stores/LanguageContext'
import { useRegionFormatting } from '@/hooks/useRegionFormatting'
import { useCouponStore } from '@/stores/CouponContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CreditCard, Users, Ticket, DollarSign } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CouponPerformance } from '@/components/shared/CouponPerformance'

import { useEffect } from 'react'
import { Download, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { exportToCSV, exportToPDF } from '@/lib/exportUtils'
import { useNotification } from '@/stores/NotificationContext'

export function FranchiseeOverviewTab({
  franchiseId,
}: {
  franchiseId: string
}) {
  const { t } = useLanguage()
  const { addNotification, notifications } = useNotification()
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

  useEffect(() => {
    if (!myFranchise || franchiseCoupons.length === 0) return

    // Check if alert already exists to prevent spam
    if (notifications.some((n) => n.title.includes('High Performance'))) return

    // Find best performing coupon
    const bestCoupon = franchiseCoupons.reduce((best, current) => {
      const currentClicks = current.visitCount || 0
      const bestClicks = best?.visitCount || 0
      return currentClicks > bestClicks ? current : best
    }, franchiseCoupons[0])

    // Generate alert if performance is notably high
    if (bestCoupon && (bestCoupon.visitCount || 0) >= 10) {
      addNotification({
        title: `🚀 High Performance Alert!`,
        message: `The offer "${bestCoupon.title}" is performing exceptionally well in ${myFranchise.region} with high click ratios. Check out the analytics to optimize further!`,
        type: 'alert',
        link: `/voucher/${bestCoupon.id}`,
        priority: 'high',
      })
    }
  }, [franchiseCoupons, myFranchise, notifications, addNotification])

  const handleExportCSV = () => {
    const headers = [
      'Coupon Name',
      'Category',
      'Total Clicks',
      'Total Redemptions',
      'Conversion Rate (%)',
      'Region',
    ]
    const rows = franchiseCoupons.map((c) => {
      const clicks = c.visitCount || 0
      const redemptions = franchiseLogs.filter(
        (log) => log.couponId === c.id,
      ).length
      const cr = clicks > 0 ? ((redemptions / clicks) * 100).toFixed(2) : '0.00'
      return [
        c.title,
        c.category,
        clicks.toString(),
        redemptions.toString(),
        cr,
        c.region || myFranchise?.region || '',
      ]
    })
    exportToCSV(
      headers,
      rows,
      `performance_report_${myFranchise?.region || 'franchise'}.csv`,
    )
  }

  const handleExportPDF = () => {
    const headers = [
      'Coupon Name',
      'Category',
      'Total Clicks',
      'Total Redemptions',
      'Conversion Rate (%)',
      'Region',
    ]
    const rows = franchiseCoupons.map((c) => {
      const clicks = c.visitCount || 0
      const redemptions = franchiseLogs.filter(
        (log) => log.couponId === c.id,
      ).length
      const cr = clicks > 0 ? ((redemptions / clicks) * 100).toFixed(2) : '0.00'
      return [
        c.title,
        c.category,
        clicks.toString(),
        redemptions.toString(),
        cr,
        c.region || myFranchise?.region || '',
      ]
    })
    exportToPDF(
      headers,
      rows,
      `performance_report_${myFranchise?.region || 'franchise'}.pdf`,
      `Performance Report - ${myFranchise?.region || 'Franchise'}`,
    )
  }

  if (!myFranchise) return null

  return (
    <div
      className={cn(
        'space-y-6 animate-fade-in-up w-full',
        !isFranchisee && 'min-w-0 max-w-full',
      )}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 min-w-0 w-full bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="min-w-0 flex-1">
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
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="font-medium"
          >
            <Download className="w-4 h-4 mr-2" />
            {t('admin.exportCsv', 'Export CSV')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPDF}
            className="font-medium"
          >
            <FileText className="w-4 h-4 mr-2" />
            {t('admin.exportPdf', 'Export PDF')}
          </Button>
        </div>
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

      <CouponPerformance franchiseId={myFranchise.id} />
    </div>
  )
}
