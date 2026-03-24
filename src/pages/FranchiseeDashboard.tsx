import { useState, useMemo } from 'react'
import { Navigate } from 'react-router-dom'
import { useCouponStore } from '@/stores/CouponContext'
import { useLanguage } from '@/stores/LanguageContext'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

import { MerchantsTab } from '@/components/admin/hierarchy/MerchantsTab'
import { FranchiseeAdsTab } from '@/components/franchisee/FranchiseeAdsTab'

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
  const { formatCurrency, formatDate } = useLanguage()
  const [activeTab, setActiveTab] = useState('overview')

  if (user?.role !== 'franchisee' && user?.role !== 'super_admin') {
    return <Navigate to="/" replace />
  }

  const myFranchise =
    franchises.find((f) => f.ownerId === user?.id) || franchises[0]

  if (!myFranchise) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <p className="text-xl font-semibold text-slate-500">
          Nenhuma franquia associada encontrada.
        </p>
      </div>
    )
  }

  // --- Data Calculations ---
  const franchiseCompanies = useMemo(
    () => companies.filter((c) => c.franchiseId === myFranchise.id),
    [companies, myFranchise.id],
  )
  const franchiseCompanyIds = franchiseCompanies.map((c) => c.id)

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
    () => ads.filter((a) => a.franchiseId === myFranchise.id),
    [ads, myFranchise.id],
  )

  const royaltyRate = platformSettings.franchiseRoyaltyRate || 15
  const adRevenue = franchiseAds.reduce(
    (sum, ad) => sum + (ad.price || ad.budget || 0),
    0,
  )
  const totalRoyalties = adRevenue * (royaltyRate / 100)

  const leadsList = useMemo(() => {
    return franchiseLogs
      .map((log) => {
        const u = users.find((user) => user.id === log.userId)
        return {
          id: log.id,
          customerName: u?.name || log.customerName || 'Cliente Balcão',
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
  }, [franchiseLogs, users, companies])

  // --- Navigation ---
  const navItems = [
    { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'merchants', label: 'Lojistas Afiliados', icon: Store },
    { id: 'campaigns-leads', label: 'Campanhas e Leads', icon: Megaphone },
    { id: 'ads', label: 'Publicidade e Royalties', icon: DollarSign },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ]

  // --- Render Helpers ---
  const renderOverview = () => (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Visão Geral</h2>
        <p className="text-muted-foreground">
          Métricas consolidadas da região de {myFranchise.region}.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-slate-600 uppercase">
              Vendas Regionais
            </CardTitle>
            <CreditCard className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-800">
              {formatCurrency(totalSales, 'BRL')}
            </div>
            <p className="text-xs text-emerald-600 mt-1 font-medium">
              Volume transacionado
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-slate-600 uppercase">
              Leads Capturados
            </CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-800">
              {totalLeads}
            </div>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              Clientes adquiridos
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-slate-600 uppercase">
              Campanhas Ativas
            </CardTitle>
            <Ticket className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-800">
              {activeCampaigns}
            </div>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              De {franchiseCoupons.length} no total
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-slate-200 border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-slate-600 uppercase">
              Royalties Devidos
            </CardTitle>
            <DollarSign className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-orange-600">
              {formatCurrency(totalRoyalties, 'BRL')}
            </div>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              {royaltyRate}% sobre publicidade
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderCampaignsAndLeads = () => (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Campanhas e Leads</h2>
        <p className="text-muted-foreground">
          Acompanhe o desempenho das ofertas dos seus lojistas e os clientes
          capturados.
        </p>
      </div>

      <Tabs defaultValue="campaigns" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="campaigns" className="font-semibold">
            Ofertas Regionais
          </TabsTrigger>
          <TabsTrigger value="leads" className="font-semibold">
            Leads Capturados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns">
          <Card className="shadow-sm">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead>Campanha</TableHead>
                    <TableHead>Lojista</TableHead>
                    <TableHead>Benefício</TableHead>
                    <TableHead>Resgates / Limite</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {franchiseCoupons.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.title}</TableCell>
                      <TableCell>
                        {companies.find((comp) => comp.id === c.companyId)
                          ?.name || 'N/A'}
                      </TableCell>
                      <TableCell className="font-bold text-primary">
                        {c.discount}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {c.reservedCount || 0} / {c.totalAvailable || '∞'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            c.status === 'active' ? 'default' : 'secondary'
                          }
                          className={cn(
                            c.status === 'active' && 'bg-emerald-500',
                          )}
                        >
                          {c.status === 'active' ? 'Ativa' : 'Inativa'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {franchiseCoupons.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-8 text-slate-500"
                      >
                        Nenhuma campanha encontrada na região.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leads">
          <Card className="shadow-sm">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Campanha Utilizada</TableHead>
                    <TableHead>Lojista</TableHead>
                    <TableHead>Data</TableHead>
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
                              Não informado
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
                        Nenhum lead capturado ainda.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )

  const renderSettings = () => (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">
          Configurações da Franquia
        </h2>
        <p className="text-muted-foreground">
          Ajustes regionais e obrigações contratuais.
        </p>
      </div>
      <Card className="max-w-2xl shadow-sm border-slate-200">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="text-lg">Parâmetros Operacionais</CardTitle>
          <CardDescription>
            Configurações bloqueadas e geridas pelo Super Admin global.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 pt-6">
          <div className="space-y-2">
            <Label className="font-semibold text-slate-700">
              Região de Atuação
            </Label>
            <Input
              value={myFranchise.region}
              disabled
              className="bg-slate-100 font-medium"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-semibold text-slate-700">
                Moeda Padrão
              </Label>
              <Input
                value={myFranchise.region.includes('US') ? 'USD' : 'BRL'}
                disabled
                className="bg-slate-100 font-medium"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-semibold text-slate-700">
                Taxa de Royalties (Publicidade)
              </Label>
              <Input
                value={`${royaltyRate}%`}
                disabled
                className="bg-slate-100 font-medium text-orange-600"
              />
            </div>
          </div>
          <div className="bg-blue-50 text-blue-800 p-4 rounded-xl border border-blue-100 text-sm mt-4">
            Em caso de dúvidas sobre faturamento ou alteração de região de
            cobertura, entre em contato com o administrador da rede Deal Voy.
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-slate-50/50">
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-white min-h-[calc(100vh-4rem)] py-6 px-4 shrink-0 shadow-sm z-10">
        <div className="mb-8 px-2">
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">
            Painel do Franqueado
          </h2>
          <p className="text-sm font-medium text-primary mt-1 truncate">
            {myFranchise.name}
          </p>
        </div>
        <nav className="flex flex-col gap-1.5 flex-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left w-full',
                activeTab === item.id
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full pb-20 md:pb-8 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'merchants' && (
            <div className="animate-fade-in-up">
              <h2 className="text-2xl font-bold text-slate-800 mb-1">
                Lojistas Afiliados
              </h2>
              <p className="text-muted-foreground mb-6">
                Gerencie todos os estabelecimentos vinculados à sua franquia.
              </p>
              <MerchantsTab franchiseId={myFranchise.id} />
            </div>
          )}
          {activeTab === 'campaigns-leads' && renderCampaignsAndLeads()}
          {activeTab === 'ads' && (
            <div className="animate-fade-in-up">
              <h2 className="text-2xl font-bold text-slate-800 mb-1">
                Publicidade e Royalties
              </h2>
              <p className="text-muted-foreground mb-6">
                Gerencie campanhas regionais patrocinadas e visualize os
                royalties devidos à rede.
              </p>
              <FranchiseeAdsTab franchiseId={myFranchise.id} />
            </div>
          )}
          {activeTab === 'settings' && renderSettings()}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-white z-50 px-2 py-2 flex justify-around items-center shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-safe">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              'flex flex-col items-center justify-center gap-1.5 p-2 w-[70px] transition-colors',
              activeTab === item.id
                ? 'text-primary'
                : 'text-slate-400 hover:text-slate-600',
            )}
          >
            <div
              className={cn(
                'p-1.5 rounded-full transition-colors',
                activeTab === item.id && 'bg-primary/10',
              )}
            >
              <item.icon className="h-5 w-5" />
            </div>
            <span
              className={cn(
                'text-[9px] font-semibold text-center leading-tight truncate w-full',
                activeTab === item.id ? 'text-primary' : 'text-slate-500',
              )}
            >
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
