import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useCouponStore } from '@/stores/CouponContext'
import { useAuth } from '@/hooks/use-auth'
import { Store, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FranchiseeSidebar } from '@/components/franchisee/FranchiseeSidebar'
import { MerchantsTab } from '@/components/admin/hierarchy/MerchantsTab'
import { StaffTab } from '@/components/admin/hierarchy/StaffTab'
import { TargetGroupsTab } from '@/components/admin/crm/TargetGroupsTab'
import { CommunicationCampaignsTab } from '@/components/admin/crm/CommunicationCampaignsTab'
import { FranchiseeOverviewTab } from '@/components/franchisee/FranchiseeOverviewTab'
import { VendorCampaignsTab } from '@/components/vendor/VendorCampaignsTab'
import { AdminCRM } from '@/components/admin/AdminCRM'
import {
  FinanceTab,
  BillingTab,
  MonetizationTab,
  AdsRoyaltiesTab,
} from '@/components/franchisee/FinanceTabs'
import {
  SeasonalTab,
  CategoriesTab,
  InterestsTab,
  PoliciesTab,
} from '@/components/franchisee/OperationalTabs'
import {
  CrawlerTab,
  InsightsTab,
  SandboxTab,
  SettingsTab,
} from '@/components/franchisee/ExtraTabs'

export default function FranchiseeDashboard() {
  const { franchises, companies, coupons: allCoupons } = useCouponStore()
  const { user, role, profile } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'overview'
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const isSuperAdmin =
    role === 'super_admin' || user?.email === 'adailtong@gmail.com'

  const myFranchise = franchises.find(
    (f) =>
      f.ownerId === user?.id ||
      f.ownerId === user?.email ||
      f.email === user?.email ||
      f.contactEmail === user?.email ||
      f.id === profile?.franchiseId,
  )

  const mockFranchise = {
    id: 'mock-franchise-admin',
    name: 'Franquia Teste (Visão Admin)',
    addressCountry: 'Brasil',
  } as any

  // Fallback to first franchise for super admins testing the view
  const franchiseToUse =
    myFranchise || (isSuperAdmin ? franchises[0] || mockFranchise : null)

  if (!franchiseToUse) {
    return (
      <div className="container py-16 text-center animate-fade-in flex flex-col items-center justify-center min-h-[60vh]">
        <Store className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          Nenhuma franquia associada encontrada
        </h2>
        <p className="text-slate-500 mb-6 max-w-md">
          Seu perfil está configurado como Franqueado, mas ainda não existe uma
          unidade regional vinculada ao seu e-mail ({user?.email}). Entre em
          contato com o Administrador do sistema.
        </p>
        <Button onClick={() => navigate('/')} variant="outline">
          Voltar para a Home
        </Button>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-slate-50 w-full relative z-0">
      <FranchiseeSidebar
        myFranchise={franchiseToUse}
        activeTab={activeTab}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="md:hidden flex items-center justify-between p-4 border-b bg-white shrink-0">
          <h1 className="font-bold text-lg truncate pr-4">
            {franchiseToUse.name}
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar w-full relative pb-24 md:pb-6">
          {activeTab === 'overview' && (
            <div className="animate-fade-in-up">
              <FranchiseeOverviewTab franchiseId={franchiseToUse.id} />
            </div>
          )}
          {activeTab === 'campaigns' && (
            <div className="animate-fade-in-up">
              <VendorCampaignsTab
                coupons={allCoupons.filter(
                  (c) =>
                    c.source !== 'aggregated' &&
                    (isSuperAdmin ||
                      companies.some(
                        (comp) =>
                          comp.franchiseId === franchiseToUse.id &&
                          comp.id === c.companyId,
                      )),
                )}
                company={franchiseToUse}
              />
            </div>
          )}
          {activeTab === 'merchants' && (
            <div className="animate-fade-in-up">
              <MerchantsTab franchiseId={franchiseToUse.id} />
            </div>
          )}
          {activeTab === 'team' && (
            <div className="animate-fade-in-up">
              <StaffTab parentType="franchise" parentId={franchiseToUse.id} />
            </div>
          )}
          {activeTab === 'crm' && (
            <div className="animate-fade-in-up bg-white p-6 rounded-xl border shadow-sm">
              <h2 className="text-xl font-bold mb-4">CRM Regional</h2>
              <p className="text-slate-600 mb-4">
                Gerencie os grupos de audiência de toda a sua rede de franquia.
              </p>
              <TargetGroupsTab />
            </div>
          )}
          {activeTab === 'leads' && (
            <div className="animate-fade-in-up bg-white p-6 rounded-xl border shadow-sm">
              <AdminCRM franchiseId={franchiseToUse.id} />
            </div>
          )}

          {activeTab === 'finance' && (
            <div className="animate-fade-in-up">
              <FinanceTab />
            </div>
          )}
          {activeTab === 'billing' && (
            <div className="animate-fade-in-up">
              <BillingTab />
            </div>
          )}
          {activeTab === 'monetization' && (
            <div className="animate-fade-in-up">
              <MonetizationTab />
            </div>
          )}
          {activeTab === 'ads-royalties' && (
            <div className="animate-fade-in-up">
              <AdsRoyaltiesTab />
            </div>
          )}

          {activeTab === 'seasonal' && (
            <div className="animate-fade-in-up">
              <SeasonalTab />
            </div>
          )}
          {activeTab === 'categories' && (
            <div className="animate-fade-in-up">
              <CategoriesTab />
            </div>
          )}
          {activeTab === 'interests' && (
            <div className="animate-fade-in-up">
              <InterestsTab />
            </div>
          )}
          {activeTab === 'policies' && (
            <div className="animate-fade-in-up">
              <PoliciesTab />
            </div>
          )}

          {activeTab === 'crawler' && (
            <div className="animate-fade-in-up">
              <CrawlerTab />
            </div>
          )}
          {activeTab === 'insights' && (
            <div className="animate-fade-in-up">
              <InsightsTab />
            </div>
          )}
          {activeTab === 'sandbox' && (
            <div className="animate-fade-in-up">
              <SandboxTab />
            </div>
          )}
          {activeTab === 'settings' && (
            <div className="animate-fade-in-up">
              <SettingsTab />
            </div>
          )}

          {/* Fallback for other tabs in development */}
          {![
            'overview',
            'campaigns',
            'merchants',
            'team',
            'crm',
            'leads',
            'finance',
            'billing',
            'monetization',
            'ads-royalties',
            'seasonal',
            'categories',
            'interests',
            'policies',
            'crawler',
            'insights',
            'sandbox',
            'settings',
          ].includes(activeTab) && (
            <div className="bg-white p-12 text-center rounded-xl border border-dashed border-slate-300 animate-fade-in-up">
              <h3 className="text-lg font-semibold text-slate-700 mb-2">
                Módulo em Desenvolvimento
              </h3>
              <p className="text-slate-500">
                A funcionalidade selecionada ({activeTab}) está em fase de
                implantação no seu painel.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
