import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Briefcase,
  ShoppingBag,
  Zap,
  Scan,
  History,
  Settings,
} from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'
import { useCouponStore } from '@/stores/CouponContext'
import { VendorAnalytics } from '@/components/VendorAnalytics'
import { CouponValidation } from '@/components/CouponValidation'
import { VendorStats } from '@/components/vendor/VendorStats'
import { CreateCampaignDialog } from '@/components/vendor/CreateCampaignDialog'
import {
  OrdersTable,
  OffersTable,
  HistoryTable,
} from '@/components/vendor/VendorTables'
import { BehavioralTriggersTab } from '@/components/vendor/BehavioralTriggersTab'
import { VendorSettingsTab } from '@/components/vendor/VendorSettingsTab'

export default function VendorDashboard() {
  const { t } = useLanguage()
  const { user, companies, coupons: allCoupons, bookings } = useCouponStore()

  const myCompany =
    companies.find((c) => c.id === user?.companyId) || companies[0]
  const coupons = allCoupons
    .filter(
      (c) =>
        c.source !== 'aggregated' &&
        (c.companyId === myCompany.id || user?.role === 'super_admin'),
    )
    .slice(0, 15)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4 bg-white p-6 rounded-xl shadow-sm border">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
            <Briefcase className="h-8 w-8 text-primary" />{' '}
            {t('vendor.dashboard')}
          </h1>
          <p className="text-muted-foreground">
            {myCompany.name} - {myCompany.region}
          </p>
        </div>
        <CreateCampaignDialog company={myCompany} />
      </div>

      <VendorStats company={myCompany} activeCampaigns={coupons.length} />

      <Tabs defaultValue="overview">
        <TabsList className="mb-4 flex flex-wrap h-auto p-1 bg-slate-100/50">
          <TabsTrigger value="overview">{t('vendor.overview')}</TabsTrigger>
          <TabsTrigger value="orders">
            <ShoppingBag className="h-3 w-3 mr-1" /> {t('vendor.orders')}
          </TabsTrigger>
          <TabsTrigger value="offers">{t('vendor.offers')}</TabsTrigger>
          <TabsTrigger value="behavioral">
            <Zap className="h-3 w-3 mr-1" /> {t('vendor.behavioral')}
          </TabsTrigger>
          <TabsTrigger value="validation">
            <Scan className="h-3 w-3 mr-1" /> {t('vendor.validation')}
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="h-3 w-3 mr-1" />{' '}
            {t('vendor.redemption_history')}
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-3 w-3 mr-1" /> {t('vendor.settings')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <VendorAnalytics />
        </TabsContent>
        <TabsContent value="orders">
          <OrdersTable orders={bookings} />
        </TabsContent>
        <TabsContent value="offers">
          <OffersTable offers={coupons} />
        </TabsContent>
        <TabsContent value="behavioral">
          <BehavioralTriggersTab coupons={coupons} />
        </TabsContent>
        <TabsContent value="validation">
          <CouponValidation />
        </TabsContent>
        <TabsContent value="history">
          <HistoryTable />
        </TabsContent>
        <TabsContent value="settings">
          <VendorSettingsTab company={myCompany} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
