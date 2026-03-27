import { Link } from 'react-router-dom'
import { useLanguage } from '@/stores/LanguageContext'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Store,
  Wallet,
  FileText,
  DollarSign,
  Megaphone,
  CalendarDays,
  LayoutGrid,
  Tag,
  Shield,
  Target,
  Users,
  Globe,
  BarChart3,
  Box,
  UsersRound,
  Settings,
} from 'lucide-react'

export function FranchiseeSidebar({
  myFranchise,
  activeTab,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}: {
  myFranchise: { name: string }
  activeTab: string
  isMobileMenuOpen: boolean
  setIsMobileMenuOpen: (v: boolean) => void
}) {
  const { t } = useLanguage()

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
      title: t('franchisee.menu.intelligence', 'Inteligência'),
      items: [
        { id: 'crm', label: t('franchisee.menu.crm', 'CRM'), icon: Target },
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

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r shadow-lg transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col h-full shrink-0',
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full',
      )}
    >
      <div className="p-6 border-b flex-shrink-0 min-w-0">
        <h2 className="text-xl font-bold text-slate-800 tracking-tight truncate">
          {t('franchisee.dashboard', 'Painel Regional')}
        </h2>
        <p className="text-sm font-medium text-primary mt-1 truncate">
          {myFranchise.name}
        </p>
      </div>

      <ScrollArea className="flex-1 w-full min-w-0">
        <div className="p-4 space-y-6 overflow-x-hidden">
          {menuGroups.map((group, idx) => (
            <div key={idx} className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 truncate">
                {group.title}
              </h4>
              <nav className="space-y-1">
                {group.items.map((item) => (
                  <Link
                    key={item.id}
                    to={`/franchisee?tab=${item.id}`}
                    onClick={() => setIsMobileMenuOpen(false)}
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
                  </Link>
                ))}
              </nav>
            </div>
          ))}
        </div>
      </ScrollArea>
    </aside>
  )
}
