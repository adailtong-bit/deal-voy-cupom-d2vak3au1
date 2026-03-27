import { useState, useMemo } from 'react'
import { Navigate } from 'react-router-dom'
import { useCouponStore } from '@/stores/CouponContext'
import { useLanguage } from '@/stores/LanguageContext'
import { useRegionFormatting } from '@/hooks/useRegionFormatting'
import {
  LayoutDashboard,
  Store,
  Megaphone,
  DollarSign,
  Settings,
  Users,
  CreditCard,
  Ticket,
  Mail,
  Phone,
  Wallet,
  FileText,
  CalendarDays,
  LayoutGrid,
  Tag,
  Shield,
  Target,
  Globe,
  BarChart3,
  Box,
  UsersRound,
  Menu,
  X,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

import { MerchantsTab } from '@/components/admin/hierarchy/MerchantsTab'
import { FranchiseeAdsTab } from '@/components/franchisee/FranchiseeAdsTab'
import { FranchiseeCurrentAccountTab } from '@/components/franchisee/FranchiseeCurrentAccountTab'
import { PartnerBillingTab } from '@/components/admin/PartnerBillingTab'
import { AdminMonetizationTab } from '@/components/admin/AdminMonetizationTab'
import { AdminSeasonalTab } from '@/components/admin/AdminSeasonalTab'
import { AdminCategoriesTab } from '@/components/admin/AdminCategoriesTab'
import { AdminInterestsTab } from '@/components/admin/AdminInterestsTab'
import { PartnerPoliciesTab } from '@/components/admin/PartnerPoliciesTab'
import { AdminCRM } from '@/components/admin/AdminCRM'
import { PromotionCrawler } from '@/components/admin/PromotionCrawler'
import { DataInsightsTab } from '@/components/admin/DataInsightsTab'
import { TestingSandboxTab } from '@/components/admin/TestingSandboxTab'
import { StaffTab } from '@/components/admin/hierarchy/StaffTab'

export default function FranchiseeDashboard() {
  const {
    user,
    franchises,
    companies,
    coupons,
    validationLogs,
    ads,
    users,
    platformSettings,
  } = useCouponStore()
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState('overview')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const myFranchise =
    franchises.find((f) => f.ownerId === user?.id) || franchises[0]

  const { formatCurrency, formatDate, formatNumber, currency } =
    useRegionFormatting(myFranchise?.region, myFranchise?.addressCountry)

  // --- Data Calculations for Overview & Leads ---
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

  const leadsList = useMemo(() => {
    return franchiseLogs
      .map((log) => {
        const u = users.find((user) => user.id === log.userId)
        return {
          id: log.id,
          customerName:
            u?.name ||
            log.customerName ||
            t('franchisee.leads.counter', 'Cliente Balcão'),
          email: u?.email || 'N/A',
          phone: u?.phone || 'N/A',
          campaignName: log.couponTitle,
          storeName:
            companies.find((c) => c.id === log.companyId)?.name || 'Loja',
          acquiredAt: log.validatedAt,
        }
      })
      .sort(
        (a, b) =>
          new Date(b.acquiredAt).getTime() - new Date(a.acquiredAt).getTime(),
      )
  }, [franchiseLogs, users, companies, t])

  if (user?.role !== 'franchisee' && user?.role !== 'super_admin') {
    return <Navigate to="/" replace />
  }

  if (!myFranchise) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <p className="text-xl font-semibold text-slate-500">
          {t(
            'franchisee.no_franchise',
            'Nenhuma franquia associada encontrada.',
          )}
        </p>
      </div>
    )
  }

  const royaltyRate = platformSettings.franchiseRoyaltyRate || 15
  const adRevenue = franchiseAds.reduce(
    (sum, ad) => sum + (ad.price || ad.budget || 0),
    0,
  )
  const totalRoyalties = adRevenue * (royaltyRate / 100)

  // --- Navigation Structure ---
  const menuGroups = [
    {
      title: t('franchisee.menu.main', 'Principal'),
      items: [
        {
          id: 'overview',
          label: t('franchisee.menu.overview', 'Visão Geral'),
          icon: LayoutDashboard,
        },
        {
          id: 'merchants',
          label: t('franchisee.menu.merchants', 'Lojistas Afiliados'),
          icon: Store,
        },
      ],
    },
    {
      title: t('franchisee.menu.financial', 'Financeiro'),
      items: [
        {
          id: 'current-account',
          label: t('franchisee.menu.current_account', 'Conta Corrente'),
          icon: Wallet,
        },
        {
          id: 'billing',
          label: t('franchisee.menu.billing', 'Faturamento'),
          icon: FileText,
        },
        {
          id: 'monetization',
          label: t('franchisee.menu.monetization', 'Monetização'),
          icon: DollarSign,
        },
        {
          id: 'ads-royalties',
          label: t('franchisee.menu.ads_royalties', 'Publicidade & Royalties'),
          icon: Megaphone,
        },
      ],
    },
    {
      title: t('franchisee.menu.operational', 'Operacional'),
      items: [
        {
          id: 'seasonal',
          label: t('franchisee.menu.seasonal', 'Ofertas Sazonais'),
          icon: CalendarDays,
        },
        {
          id: 'categories',
          label: t('franchisee.menu.categories', 'Categorias'),
          icon: LayoutGrid,
        },
        {
          id: 'interests',
          label: t('franchisee.menu.interests', 'Interesses'),
          icon: Tag,
        },
        {
          id: 'policies',
          label: t('franchisee.menu.policies', 'Políticas de Parceiros'),
          icon: Shield,
        },
      ],
    },
    {
      title: t('franchisee.menu.intelligence', 'Inteligência & CRM'),
      items: [
        {
          id: 'crm',
          label: t('franchisee.menu.crm', 'CRM & Campanhas'),
          icon: Target,
        },
        {
          id: 'leads',
          label: t('franchisee.menu.leads', 'Leads Capturados'),
          icon: Users,
        },
        {
          id: 'crawler',
          label: t('franchisee.menu.crawler', 'Crawler de Ofertas'),
          icon: Globe,
        },
        {
          id: 'insights',
          label: t('franchisee.menu.insights', 'Data Insights'),
          icon: BarChart3,
        },
      ],
    },
    {
      title: t('franchisee.menu.support', 'Apoio & Configurações'),
      items: [
        {
          id: 'sandbox',
          label: t('franchisee.menu.sandbox', 'Testing Sandbox'),
          icon: Box,
        },
        {
          id: 'team',
          label: t('franchisee.menu.team', 'Equipe Local'),
          icon: UsersRound,
        },
        {
          id: 'settings',
          label: t('franchisee.menu.settings', 'Configurações'),
          icon: Settings,
        },
      ],
    },
  ]

  // --- Render Helpers ---
  const renderOverview = () => (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">
          {t('franchisee.overview.title', 'Visão Geral')}
        </h2>
        <p className="text-muted-foreground">
          {t(
            'franchisee.overview.desc',
            `Métricas consolidadas da região de ${myFranchise.region}.`,
          ).replace(
            '{region}',
            myFranchise.region || myFranchise.addressCountry || '',
          )}
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-slate-600 uppercase">
              {t('franchisee.overview.sales', 'Vendas Regionais')}
            </CardTitle>
            <CreditCard className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-800">
              {formatCurrency(totalSales)}
            </div>
            <p className="text-xs text-emerald-600 mt-1 font-medium">
              {t('franchisee.overview.sales_desc', 'Volume transacionado')}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-slate-600 uppercase">
              {t('franchisee.overview.leads', 'Leads Capturados')}
            </CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-800">
              {formatNumber(totalLeads)}
            </div>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              {t('franchisee.overview.leads_desc', 'Clientes adquiridos')}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-slate-600 uppercase">
              {t('franchisee.overview.campaigns', 'Campanhas Ativas')}
            </CardTitle>
            <Ticket className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-800">
              {formatNumber(activeCampaigns)}
            </div>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              {t(
                'franchisee.overview.campaigns_desc',
                'De {total} no total',
              ).replace('{total}', String(franchiseCoupons.length))}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-slate-200 border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-slate-600 uppercase">
              {t('franchisee.overview.royalties', 'Royalties Devidos')}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-orange-600">
              {formatCurrency(totalRoyalties)}
            </div>
            <p className="text-xs text-slate-400 mt-1 font-medium">
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

  const renderLeads = () => (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">
          {t('franchisee.leads.title', 'Leads Regionais')}
        </h2>
        <p className="text-muted-foreground">
          {t(
            'franchisee.leads.desc',
            'Clientes que interagiram com ofertas dos seus lojistas.',
          )}
        </p>
      </div>
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>
                  {t('franchisee.leads.customer', 'Cliente')}
                </TableHead>
                <TableHead>
                  {t('franchisee.leads.contact', 'Contato')}
                </TableHead>
                <TableHead>
                  {t('franchisee.leads.campaign', 'Campanha Utilizada')}
                </TableHead>
                <TableHead>
                  {t('franchisee.leads.merchant', 'Lojista')}
                </TableHead>
                <TableHead>{t('franchisee.leads.date', 'Data')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leadsList.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium text-slate-900">
                    {lead.customerName}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 text-sm text-slate-600">
                      {lead.email !== 'N/A' && (
                        <span className="flex items-center gap-1.5">
                          <Mail className="h-3 w-3 text-slate-400" />{' '}
                          {lead.email}
                        </span>
                      )}
                      {lead.phone !== 'N/A' && (
                        <span className="flex items-center gap-1.5">
                          <Phone className="h-3 w-3 text-slate-400" />{' '}
                          {lead.phone}
                        </span>
                      )}
                      {lead.email === 'N/A' && lead.phone === 'N/A' && (
                        <span className="text-slate-400 italic">
                          {t('franchisee.leads.not_informed', 'Não informado')}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-slate-50">
                      {lead.campaignName}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-700 font-medium">
                    {lead.storeName}
                  </TableCell>
                  <TableCell className="text-slate-500 text-sm whitespace-nowrap">
                    {formatDate(lead.acquiredAt)}
                  </TableCell>
                </TableRow>
              ))}
              {leadsList.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-slate-500"
                  >
                    {t(
                      'franchisee.leads.no_leads',
                      'Nenhum lead capturado ainda.',
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )

  const renderSettings = () => (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">
          {t('franchisee.settings.title', 'Configurações')}
        </h2>
        <p className="text-muted-foreground">
          {t(
            'franchisee.settings.desc',
            'Parâmetros operacionais da franquia.',
          )}
        </p>
      </div>
      <Card className="max-w-2xl shadow-sm border-slate-200">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="text-lg">
            {t('franchisee.settings.contract_info', 'Informações Contratuais')}
          </CardTitle>
          <CardDescription>
            {t(
              'franchisee.settings.contract_desc',
              'Configurações gerenciadas pela rede Master.',
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 pt-6">
          <div className="space-y-2">
            <Label className="font-semibold text-slate-700">
              {t('franchisee.settings.region', 'Região de Atuação')}
            </Label>
            <Input
              value={myFranchise.region || myFranchise.addressCountry || ''}
              disabled
              className="bg-slate-100 font-medium"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-semibold text-slate-700">
                {t('franchisee.settings.currency', 'Moeda Padrão')}
              </Label>
              <Input
                value={currency}
                disabled
                className="bg-slate-100 font-medium"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-semibold text-slate-700">
                {t(
                  'franchisee.settings.royalty_rate',
                  'Taxa de Royalties (Publicidade)',
                )}
              </Label>
              <Input
                value={`${formatNumber(royaltyRate)}%`}
                disabled
                className="bg-slate-100 font-medium text-orange-600"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const handleTabChange = (id: string) => {
    setActiveTab(id)
    setIsMobileMenuOpen(false)
  }

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-slate-50/50">
      {/* Mobile Header for Sidebar Toggle */}
      <div className="md:hidden flex items-center justify-between bg-white border-b p-4 sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <LayoutDashboard className="w-4 h-4 text-primary" />
          </div>
          <span className="font-bold text-slate-800">Franquia</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r shadow-lg transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="p-6 border-b flex-shrink-0">
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">
            {t('franchisee.dashboard', 'Painel Regional')}
          </h2>
          <p className="text-sm font-medium text-primary mt-1 truncate">
            {myFranchise.name}
          </p>
        </div>

        <ScrollArea className="flex-1 w-full">
          <div className="p-4 space-y-6">
            {menuGroups.map((group, idx) => (
              <div key={idx} className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">
                  {group.title}
                </h4>
                <nav className="space-y-1">
                  {group.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleTabChange(item.id)}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all w-full text-left',
                        activeTab === item.id
                          ? 'bg-primary/10 text-primary font-bold'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                      )}
                    >
                      <item.icon
                        className={cn(
                          'h-4 w-4 shrink-0',
                          activeTab === item.id
                            ? 'text-primary'
                            : 'text-slate-400',
                        )}
                      />
                      <span className="truncate">{item.label}</span>
                    </button>
                  ))}
                </nav>
              </div>
            ))}
          </div>
        </ScrollArea>
      </aside>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 w-full pb-20 md:pb-8 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'merchants' && (
            <MerchantsTab franchiseId={myFranchise.id} />
          )}

          {/* Financeiro */}
          {activeTab === 'current-account' && (
            <FranchiseeCurrentAccountTab franchiseId={myFranchise.id} />
          )}
          {activeTab === 'billing' && (
            <PartnerBillingTab franchiseId={myFranchise.id} />
          )}
          {activeTab === 'monetization' && (
            <AdminMonetizationTab franchiseId={myFranchise.id} />
          )}
          {activeTab === 'ads-royalties' && (
            <FranchiseeAdsTab franchiseId={myFranchise.id} />
          )}

          {/* Operacional */}
          {activeTab === 'seasonal' && (
            <AdminSeasonalTab franchiseId={myFranchise.id} />
          )}
          {activeTab === 'categories' && (
            <AdminCategoriesTab franchiseId={myFranchise.id} />
          )}
          {activeTab === 'interests' && (
            <AdminInterestsTab franchiseId={myFranchise.id} />
          )}
          {activeTab === 'policies' && (
            <PartnerPoliciesTab franchiseId={myFranchise.id} />
          )}

          {/* Inteligência */}
          {activeTab === 'crm' && <AdminCRM franchiseId={myFranchise.id} />}
          {activeTab === 'leads' && renderLeads()}
          {activeTab === 'crawler' && (
            <PromotionCrawler franchiseId={myFranchise.id} />
          )}
          {activeTab === 'insights' && (
            <DataInsightsTab franchiseId={myFranchise.id} />
          )}

          {/* Apoio */}
          {activeTab === 'sandbox' && (
            <TestingSandboxTab franchiseId={myFranchise.id} />
          )}
          {activeTab === 'team' && (
            <StaffTab parentType="franchise" parentId={myFranchise.id} />
          )}
          {activeTab === 'settings' && renderSettings()}
        </div>
      </main>
    </div>
  )
}
