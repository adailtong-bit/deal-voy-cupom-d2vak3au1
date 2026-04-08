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

export default function FranchiseeDashboard() {
  const { franchises } = useCouponStore()
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
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-fade-in-up">
              <h2 className="text-xl font-bold mb-4">
                Visão Geral da Franquia
              </h2>
              <p className="text-slate-600">
                Bem-vindo ao painel regional de {franchiseToUse.name}. Em breve
                você terá relatórios e gráficos de performance consolidados aqui
                para a sua rede.
              </p>
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
              <h2 className="text-xl font-bold mb-4">Campanhas de Leads</h2>
              <p className="text-slate-600 mb-4">
                Gerencie o envio de campanhas de comunicação na sua região.
              </p>
              <CommunicationCampaignsTab />
            </div>
          )}

          {/* Fallback for other tabs in development */}
          {!['overview', 'merchants', 'team', 'crm', 'leads'].includes(
            activeTab,
          ) && (
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
