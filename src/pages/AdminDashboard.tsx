import { Activity, Users, Store, DollarSign } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AdminCRM } from '@/components/admin/AdminCRM'
import { PromotionCrawler } from '@/components/admin/PromotionCrawler'
import { AdminAdsManager } from '@/components/admin/ads/AdminAdsManager'
import { DataInsightsTab } from '@/components/admin/DataInsightsTab'
import { AdminMonetizationTab } from '@/components/admin/AdminMonetizationTab'
import { PartnerPoliciesTab } from '@/components/admin/PartnerPoliciesTab'
import { PartnerBillingTab } from '@/components/admin/PartnerBillingTab'
import { AdminSeasonalTab } from '@/components/admin/AdminSeasonalTab'
import { AdminCategoriesTab } from '@/components/admin/AdminCategoriesTab'
import { AdminInterestsTab } from '@/components/admin/AdminInterestsTab'
import { TestingSandboxTab } from '@/components/admin/TestingSandboxTab'
import { AdminHierarchyTab } from '@/components/admin/AdminHierarchyTab'
import { useLanguage } from '@/stores/LanguageContext'
import { useCouponStore } from '@/stores/CouponContext'

export default function AdminDashboard() {
  const { t } = useLanguage()
  const { user } = useCouponStore()

  const isSuperAdmin = user?.role === 'super_admin'
  const isFranchisee = user?.role === 'franchisee'

  if (!isSuperAdmin && !isFranchisee) {
    return (
      <div className="container py-16 text-center text-muted-foreground animate-fade-in">
        Acesso restrito. Área exclusiva para administradores e franqueados.
      </div>
    )
  }

  return (
    <div className="container py-8 max-w-7xl mx-auto space-y-8 animate-fade-in mb-16 md:mb-0">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {isSuperAdmin
            ? t('admin.dashboardTitle')
            : 'Franchise Management Dashboard'}
        </h1>
        <p className="text-muted-foreground mt-2">
          {isSuperAdmin
            ? t('admin.dashboardDesc')
            : 'Gerencie sua rede de lojistas e colaboradores locais.'}
        </p>
      </div>

      <Tabs
        defaultValue={isSuperAdmin ? 'overview' : 'hierarchy'}
        className="w-full"
      >
        <TabsList className="mb-8 flex flex-wrap h-auto gap-2 p-1 justify-start">
          {isSuperAdmin && (
            <>
              <TabsTrigger value="overview">{t('admin.overview')}</TabsTrigger>
              <TabsTrigger value="monetization">
                {t('admin.monetization')}
              </TabsTrigger>
              <TabsTrigger value="policies">{t('admin.policies')}</TabsTrigger>
              <TabsTrigger value="billing">{t('admin.billing')}</TabsTrigger>
              <TabsTrigger value="seasonal">{t('admin.seasonal')}</TabsTrigger>
              <TabsTrigger value="categories">
                {t('admin.categoriesTab', 'Categorias')}
              </TabsTrigger>
              <TabsTrigger value="interests">
                {t('admin.interestsTab', 'Interesses')}
              </TabsTrigger>
              <TabsTrigger value="crm">{t('admin.crm')}</TabsTrigger>
              <TabsTrigger value="crawler">{t('admin.crawler')}</TabsTrigger>
              <TabsTrigger value="ads">{t('admin.ads')}</TabsTrigger>
              <TabsTrigger value="insights">{t('admin.insights')}</TabsTrigger>
              <TabsTrigger value="sandbox">
                {t('admin.sandbox', 'Testing Sandbox')}
              </TabsTrigger>
            </>
          )}
          <TabsTrigger value="hierarchy">
            {t('admin.hierarchy', 'Hierarchy & Team')}
          </TabsTrigger>
        </TabsList>

        {isSuperAdmin && (
          <>
            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {t('admin.activeUsers')}
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">45.231</div>
                    <p className="text-xs text-muted-foreground">
                      +20.1% este mês
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {t('admin.partnerStores')}
                    </CardTitle>
                    <Store className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">1.234</div>
                    <p className="text-xs text-muted-foreground">
                      +15 novas esta semana
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {t('admin.estRevenue')}
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">R$ 84.320</div>
                    <p className="text-xs text-muted-foreground">
                      +12% este mês
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {t('admin.engagement')}
                    </CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">12.543</div>
                    <p className="text-xs text-muted-foreground">
                      +5% esta semana
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="monetization">
              <AdminMonetizationTab />
            </TabsContent>
            <TabsContent value="policies">
              <PartnerPoliciesTab />
            </TabsContent>
            <TabsContent value="billing">
              <PartnerBillingTab />
            </TabsContent>
            <TabsContent value="seasonal">
              <AdminSeasonalTab />
            </TabsContent>
            <TabsContent value="categories">
              <AdminCategoriesTab />
            </TabsContent>
            <TabsContent value="interests">
              <AdminInterestsTab />
            </TabsContent>
            <TabsContent value="crm">
              <AdminCRM />
            </TabsContent>
            <TabsContent value="crawler">
              <PromotionCrawler />
            </TabsContent>
            <TabsContent value="ads">
              <AdminAdsManager />
            </TabsContent>
            <TabsContent value="insights">
              <DataInsightsTab />
            </TabsContent>
            <TabsContent value="sandbox">
              <TestingSandboxTab />
            </TabsContent>
          </>
        )}

        <TabsContent value="hierarchy">
          <AdminHierarchyTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
