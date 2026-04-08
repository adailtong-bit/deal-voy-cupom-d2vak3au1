import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import {
  Store,
  Building,
  LogOut,
  ShieldAlert,
  X,
  ShieldCheck,
  Settings,
} from 'lucide-react'

export function DevNavigation() {
  const { role, user, signOut } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  // Exibir a navegação rápida apenas para quem tem permissão master.
  if (role !== 'super_admin' && user?.email !== 'adailtong@gmail.com') {
    return null
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

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 w-64 animate-in slide-in-from-bottom-5 fade-in duration-200">
      <div className="bg-slate-900 text-white rounded-xl shadow-2xl p-3 flex flex-col gap-2 border border-slate-700/50 text-sm backdrop-blur-md bg-slate-900/95">
        <div className="flex items-center justify-between border-b border-slate-700 pb-2 mb-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-[10px] text-amber-400 uppercase tracking-widest">
              Painel QA
            </span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <Link
          to="/merchant"
          className="flex items-center gap-3 hover:bg-slate-800 p-2.5 rounded-lg transition-colors"
          title="Acessar painel do lojista"
        >
          <Store className="w-4 h-4 text-sky-400" />
          <span className="font-medium">Painel Lojista</span>
        </Link>

        <Link
          to="/franchisee"
          className="flex items-center gap-3 hover:bg-slate-800 p-2.5 rounded-lg transition-colors"
          title="Acessar painel de franquias"
        >
          <Building className="w-4 h-4 text-fuchsia-400" />
          <span className="font-medium">Painel Franqueado</span>
        </Link>

        <Link
          to="/admin"
          className="flex items-center gap-3 hover:bg-slate-800 p-2.5 rounded-lg transition-colors"
          title="Acessar painel administrativo"
        >
          <Settings className="w-4 h-4 text-emerald-400" />
          <span className="font-medium">Painel Admin</span>
        </Link>

        <button
          onClick={() => signOut()}
          className="flex items-center gap-3 hover:bg-red-900/40 text-red-400 p-2.5 rounded-lg transition-colors border-t border-slate-800 pt-3 mt-1"
        >
          <LogOut className="w-4 h-4" />
          <span className="font-medium">Sair / Trocar de Usuário</span>
        </button>
      </div>
    </div>
  )
}
