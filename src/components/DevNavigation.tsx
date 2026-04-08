import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import {
  Store,
  Building,
  LogOut,
  ShieldAlert,
  X,
  ShieldCheck,
  Settings,
  RefreshCw,
} from 'lucide-react'

export function DevNavigation() {
  const { role, user, signOut } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  // Always show QA panel if master email or super_admin, OR if they have a bypass role set
  const hasBypass = !!localStorage.getItem('qa_bypass_role')
  const isMaster =
    role === 'super_admin' || user?.email === 'adailtong@gmail.com' || hasBypass

  if (!isMaster) {
    return null
  }

  const handleAccess = (targetRole: string, path: string) => {
    localStorage.setItem('qa_bypass_role', targetRole)
    localStorage.setItem('role', targetRole)
    localStorage.setItem('userRole', targetRole)
    // Usamos location.assign para garantir que a navegação dispare os lifecycles corretamente
    window.location.assign(path)
  }

  const handleClearBypass = () => {
    localStorage.removeItem('qa_bypass_role')
    localStorage.removeItem('role')
    localStorage.removeItem('userRole')
    window.location.assign('/')
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-[9999] bg-slate-900 text-white px-4 py-2 rounded-full shadow-2xl border border-slate-700/50 hover:bg-slate-800 transition-colors flex items-center gap-2 group animate-in fade-in zoom-in duration-300"
        title="Painel QA / Acessos Rápidos"
      >
        <ShieldAlert className="w-4 h-4 text-amber-400 group-hover:text-amber-300" />
        <span className="font-bold text-xs tracking-wider text-amber-400/90 group-hover:text-amber-300">
          QA Access
        </span>
      </button>
    )
  }

  const currentBypass = localStorage.getItem('qa_bypass_role')

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 w-64 animate-in slide-in-from-bottom-5 fade-in duration-200">
      <div className="bg-slate-900 text-white rounded-xl shadow-2xl p-3 flex flex-col gap-2 border border-slate-700/50 text-sm backdrop-blur-md bg-slate-900/95">
        <div className="flex items-center justify-between border-b border-slate-700 pb-2 mb-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-[10px] text-amber-400 uppercase tracking-widest">
              Painel QA {currentBypass ? `(${currentBypass})` : ''}
            </span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={() => handleAccess('merchant', '/merchant')}
          className="flex items-center w-full gap-3 hover:bg-slate-800 p-2.5 rounded-lg transition-colors text-left"
          title="Acessar painel do lojista (Forçar Permissão)"
        >
          <Store className="w-4 h-4 text-sky-400" />
          <span className="font-medium">Acesso QA Lojista</span>
        </button>

        <button
          onClick={() => handleAccess('franchisee', '/franchisee')}
          className="flex items-center w-full gap-3 hover:bg-slate-800 p-2.5 rounded-lg transition-colors text-left"
          title="Acessar painel de franquias (Forçar Permissão)"
        >
          <Building className="w-4 h-4 text-fuchsia-400" />
          <span className="font-medium">Acesso QA Franqueado</span>
        </button>

        <button
          onClick={() => handleAccess('super_admin', '/admin')}
          className="flex items-center w-full gap-3 hover:bg-slate-800 p-2.5 rounded-lg transition-colors text-left"
          title="Acessar painel administrativo"
        >
          <Settings className="w-4 h-4 text-emerald-400" />
          <span className="font-medium">Acesso QA Admin</span>
        </button>

        {currentBypass && (
          <button
            onClick={handleClearBypass}
            className="flex items-center w-full gap-3 hover:bg-amber-900/40 text-amber-400 p-2.5 rounded-lg transition-colors border-t border-slate-800 pt-3 mt-1 text-left"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="font-medium">Limpar Permissões QA</span>
          </button>
        )}

        <button
          onClick={() =>
            signOut().then(() => {
              localStorage.clear()
              sessionStorage.clear()
              window.location.assign('/login')
            })
          }
          className="flex items-center w-full gap-3 hover:bg-red-900/40 text-red-400 p-2.5 rounded-lg transition-colors border-t border-slate-800 pt-3 mt-1 text-left"
        >
          <LogOut className="w-4 h-4" />
          <span className="font-medium">Sair do Sistema</span>
        </button>
      </div>
    </div>
  )
}
