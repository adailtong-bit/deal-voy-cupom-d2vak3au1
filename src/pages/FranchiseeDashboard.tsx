import { useState } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import { useCouponStore } from '@/stores/CouponContext'
import { useLanguage } from '@/stores/LanguageContext'
import { LayoutDashboard, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

import { FranchiseeSidebar } from '@/components/franchisee/FranchiseeSidebar'
import { FranchiseeOverviewTab } from '@/components/franchisee/FranchiseeOverviewTab'
import { FranchiseeLeadsTab } from '@/components/franchisee/FranchiseeLeadsTab'
import { FranchiseeSettingsTab } from '@/components/franchisee/FranchiseeSettingsTab'

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
  const { user, franchises } = useCouponStore()
  const { t } = useLanguage()
  const [searchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'overview'
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const myFranchise =
    franchises.find((f) => f.ownerId === user?.id) || franchises[0]

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

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-slate-50/50">
      {/* Mobile Header for Sidebar Toggle */}
      <div className="md:hidden flex items-center justify-between bg-white border-b p-4 sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <LayoutDashboard className="w-4 h-4 text-primary" />
          </div>
          <span className="font-bold text-slate-800">
            {t('franchisee.dashboard', 'Painel Regional')}
          </span>
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

      <FranchiseeSidebar
        myFranchise={myFranchise}
        activeTab={activeTab}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

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
          {activeTab === 'overview' && (
            <FranchiseeOverviewTab franchiseId={myFranchise.id} />
          )}
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
          {activeTab === 'leads' && (
            <FranchiseeLeadsTab franchiseId={myFranchise.id} />
          )}
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
          {activeTab === 'settings' && (
            <FranchiseeSettingsTab franchiseId={myFranchise.id} />
          )}
        </div>
      </main>
    </div>
  )
}
