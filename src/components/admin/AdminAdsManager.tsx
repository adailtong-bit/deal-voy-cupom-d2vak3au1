import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AdPricingTab } from './ads/AdPricingTab'
import { AdvertisersTab } from './ads/AdvertisersTab'
import { AdCampaignsTab } from './ads/AdCampaignsTab'
import { AdBillingTab } from './ads/AdBillingTab'
import { LayoutDashboard, Users, DollarSign, FileText } from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export function AdminAdsManager() {
  const { t } = useLanguage()

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-2xl font-bold">{t('admin.ads', 'Ads')}</h2>
        <p className="text-muted-foreground">
          {t(
            'admin.dashboardDesc',
            'Manage ad campaigns, pricing, and advertisers.',
          )}
        </p>
      </div>

      <Tabs defaultValue="campaigns" className="w-full">
        <TabsList className="mb-4 flex flex-wrap h-auto">
          <TabsTrigger value="campaigns">
            <LayoutDashboard className="h-4 w-4 mr-2" />{' '}
            {t('admin.ads.campaigns', 'Campaigns')}
          </TabsTrigger>
          <TabsTrigger value="advertisers">
            <Users className="h-4 w-4 mr-2" />{' '}
            {t('admin.ads.advertisers', 'Advertisers')}
          </TabsTrigger>
          <TabsTrigger value="pricing">
            <DollarSign className="h-4 w-4 mr-2" />{' '}
            {t('admin.ads.pricing', 'Pricing')}
          </TabsTrigger>
          <TabsTrigger value="billing">
            <FileText className="h-4 w-4 mr-2" />{' '}
            {t('admin.billing', 'Billing')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="animate-in fade-in-50">
          <ErrorBoundary>
            <AdCampaignsTab />
          </ErrorBoundary>
        </TabsContent>
        <TabsContent value="advertisers" className="animate-in fade-in-50">
          <ErrorBoundary>
            <AdvertisersTab />
          </ErrorBoundary>
        </TabsContent>
        <TabsContent value="pricing" className="animate-in fade-in-50">
          <ErrorBoundary>
            <AdPricingTab />
          </ErrorBoundary>
        </TabsContent>
        <TabsContent value="billing" className="animate-in fade-in-50">
          <ErrorBoundary>
            <AdBillingTab />
          </ErrorBoundary>
        </TabsContent>
      </Tabs>
    </div>
  )
}
