import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  QrCode,
  Barcode,
  History,
  TrendingUp,
  Scan,
  Star,
  Settings,
  Package,
  Coins,
  Calendar,
} from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'
import { Company } from '@/lib/types'

export function VendorStats({
  company,
  activeCampaigns,
}: {
  company: Company
  activeCampaigns: number
}) {
  const { t, formatCurrency } = useLanguage()

  const ScenarioCard = ({ title, icon: Icon, value, color }: any) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-medium uppercase text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={`h-4 w-4 ${color || 'text-muted-foreground'}`} />
      </CardHeader>
      <CardContent>
        <div className="text-xl font-bold">{value}</div>
      </CardContent>
    </Card>
  )

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
      <ScenarioCard
        title={t('vendor.qr_scanner')}
        icon={QrCode}
        value={t('vendor.scan_qr')}
      />
      <ScenarioCard
        title={t('vendor.barcode')}
        icon={Barcode}
        value={t('vendor.barcode')}
      />
      <ScenarioCard
        title={t('vendor.redemption_history')}
        icon={History}
        value="152"
      />
      <ScenarioCard
        title={t('vendor.active_campaigns')}
        icon={TrendingUp}
        value={activeCampaigns}
        color="text-green-500"
      />
      <ScenarioCard title={t('vendor.footfall')} icon={Scan} value="340/d" />
      <ScenarioCard
        title={t('vendor.ratings')}
        icon={Star}
        value="4.8"
        color="text-yellow-500"
      />
      <ScenarioCard
        title={t('vendor.store_profile')}
        icon={Settings}
        value={t('common.edit')}
      />
      <ScenarioCard
        title={t('vendor.inventory_alerts')}
        icon={Package}
        value="3 Low"
        color="text-red-500"
      />
      <ScenarioCard
        title={t('vendor.payouts')}
        icon={Coins}
        value={formatCurrency(1200, company.region === 'US-FL' ? 'USD' : 'BRL')}
      />
      <ScenarioCard
        title={t('vendor.scheduler')}
        icon={Calendar}
        value={t('vendor.scheduler')}
      />
    </div>
  )
}
