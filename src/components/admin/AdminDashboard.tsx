import { useState } from 'react'
import {
  Activity,
  Users,
  Store,
  DollarSign,
  Bell,
  Megaphone,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { AdminCRM } from '@/components/admin/AdminCRM'
import { PromotionCrawler } from '@/components/admin/PromotionCrawler'
import { AdminAdsManager } from '@/components/admin/AdminAdsManager'
import { AdminNetworkAdsTab } from '@/components/admin/AdminNetworkAdsTab'
import { DataInsightsTab } from '@/components/admin/DataInsightsTab'
import { AdminMonetizationTab } from '@/components/admin/AdminMonetizationTab'
import { PartnerPoliciesTab } from '@/components/admin/PartnerPoliciesTab'
import { PartnerBillingTab } from '@/components/admin/PartnerBillingTab'
import { AdminSeasonalTab } from '@/components/admin/AdminSeasonalTab'
import { AdminCategoriesTab } from '@/components/admin/AdminCategoriesTab'
import { AdminInterestsTab } from '@/components/admin/AdminInterestsTab'
import { TestingSandboxTab } from '@/components/admin/TestingSandboxTab'
import { AdminHierarchyTab } from '@/components/admin/AdminHierarchyTab'
import { AdminTranslationsTab } from '@/components/admin/AdminTranslationsTab'
import { useLanguage } from '@/stores/LanguageContext'
import { useCouponStore } from '@/stores/CouponContext'
import { useRegionFormatting } from '@/hooks/useRegionFormatting'
import { cn } from '@/lib/utils'

export default function AdminDashboard() {
  const { t } = useLanguage()
  const { user, companies } = useCouponStore()
  const { formatNumber, formatCurrency } = useRegionFormatting(
    user?.region,
    user?.country,
  )

  const isSuperAdmin = user?.role === 'super_admin'
  const isFranchisee = user?.role === 'franchisee'

  const [activeTab, setActiveTab] = useState(
    isSuperAdmin ? 'overview' : 'hierarchy',
  )

  const pendingMerchants = companies.filter((c) => c.status === 'pending')
  const incompleteCompanies = companies.filter(
    (c) => c.status === 'active' && (!c.taxId || !c.billingEmail),
  )

  const [unreadIds, setUnreadIds] = useState<Set<string>>(
    new Set(['notif-1', 'notif-2', 'notif-3']),
  )

  const notifications = [
    ...(pendingMerchants.length > 0
      ? [
          {
            id: 'notif-1',
            title: 'Pending Approvals',
            desc: `${pendingMerchants.length} new merchants waiting for review.`,
            tab: 'hierarchy',
            time: 'Just now',
          },
        ]
      : []),
    ...(incompleteCompanies.length > 0
      ? [
          {
            id: 'notif-2',
            title: 'Incomplete Profiles',
            desc: `${incompleteCompanies.length} companies have missing billing records.`,
            tab: 'overview',
            time: '1 hour ago',
          },
        ]
      : []),
    {
      id: 'notif-3',
      title: 'New Document Uploaded',
      desc: 'A new "Contrato Social" was uploaded by a merchant.',
      tab: 'hierarchy',
      time: '3 hours ago',
    },
  ]

  const currentUnreadCount = notifications.filter((n) =>
    unreadIds.has(n.id),
  ).length

  const handleNotifClick = (n: any) => {
    setActiveTab(n.tab)
    const newSet = new Set(unreadIds)
    newSet.delete(n.id)
    setUnreadIds(newSet)
  }

  const markAllRead = () => {
    setUnreadIds(new Set())
  }

  if (!isSuperAdmin && !isFranchisee) {
    return (
      <div className="container py-16 text-center text-muted-foreground animate-fade-in">
        Acesso restrito. Área exclusiva para administradores e franqueados.
      </div>
    )
  }

  return (
    <div className="container py-8 max-w-7xl mx-auto space-y-8 animate-fade-in mb-16 md:mb-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isSuperAdmin
              ? t('admin.dashboardTitle')
              : t('franchisee.dashboard', 'Painel Regional')}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isSuperAdmin
              ? t('admin.dashboardDesc')
              : t(
                  'franchisee.settings.desc',
                  'Gerencie sua rede de lojistas e colaboradores locais.',
                )}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="relative h-10 w-10"
              >
                <Bell className="h-5 w-5 text-slate-700" />
                {currentUnreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                    {currentUnreadCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="w-80 p-0 shadow-lg border-slate-200"
            >
              <div className="flex items-center justify-between p-4 border-b bg-slate-50 rounded-t-lg">
                <span className="font-semibold text-slate-800">
                  {t('nav.notifications', 'Notificações')}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllRead}
                  className="h-auto text-xs py-1 px-2 text-primary hover:text-primary"
                >
                  Mark all read
                </Button>
              </div>
              <div className="max-h-[350px] overflow-y-auto">
                {notifications.map((n) => {
                  const isUnread = unreadIds.has(n.id)
                  return (
                    <div
                      key={n.id}
                      onClick={() => handleNotifClick(n)}
                      className={cn(
                        'p-4 border-b cursor-pointer transition-colors',
                        isUnread
                          ? 'bg-blue-50/50 hover:bg-blue-50'
                          : 'hover:bg-slate-50',
                      )}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <p
                          className={cn(
                            'text-sm',
                            isUnread
                              ? 'font-semibold text-slate-900'
                              : 'font-medium text-slate-700',
                          )}
                        >
                          {n.title}
                        </p>
                        {isUnread && (
                          <span className="h-2 w-2 rounded-full bg-blue-500 mt-1.5 shrink-0 shadow-sm" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {n.desc}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-2 font-medium">
                        {n.time}
                      </p>
                    </div>
                  )
                })}
                {notifications.length === 0 && (
                  <div className="p-8 text-center text-sm text-muted-foreground">
                    {t('common.none', 'Nenhum')}
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
              <TabsTrigger value="crm">CRM & Campanhas</TabsTrigger>
              <TabsTrigger value="crawler">{t('admin.crawler')}</TabsTrigger>
              <TabsTrigger value="ads">{t('admin.ads')}</TabsTrigger>
              <TabsTrigger value="network-ads" className="gap-2">
                <Megaphone className="h-4 w-4" />
                {t('admin.network_ads', 'Publicidade de Rede')}
              </TabsTrigger>
              <TabsTrigger value="translations">Translations</TabsTrigger>
              <TabsTrigger value="insights">{t('admin.insights')}</TabsTrigger>
              <TabsTrigger value="sandbox">
                {t('admin.sandbox', 'Testing Sandbox')}
              </TabsTrigger>
            </>
          )}
          <TabsTrigger value="hierarchy">
            {t('admin.hierarchy.title', 'Hierarchy & Team')}
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
                    <div className="text-2xl font-bold">
                      {formatNumber(45231)}
                    </div>
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
                    <div className="text-2xl font-bold">
                      {formatNumber(1234)}
                    </div>
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
                    <div className="text-2xl font-bold">
                      {formatCurrency(84320)}
                    </div>
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
                    <div className="text-2xl font-bold">
                      {formatNumber(12543)}
                    </div>
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
            <TabsContent value="network-ads">
              <AdminNetworkAdsTab />
            </TabsContent>
            <TabsContent value="translations">
              <AdminTranslationsTab />
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
