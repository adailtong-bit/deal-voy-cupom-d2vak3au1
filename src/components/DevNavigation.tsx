import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Store, Building, LogOut } from 'lucide-react'

export function DevNavigation() {
  const { role, user, signOut } = useAuth()

  // Exibir a navegação rápida apenas para quem tem permissão master.
  // Isso facilita a vida do gestor que precisa transitar pelos ambientes sem perder as rotas.
  if (role !== 'super_admin' && user?.email !== 'adailtong@gmail.com') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2">
      <div className="bg-slate-900 text-white rounded-xl shadow-2xl p-3 flex flex-col gap-2 border border-slate-700/50 text-sm backdrop-blur-md bg-slate-900/95">
        <div className="font-bold text-[10px] text-slate-400 uppercase tracking-widest text-center border-b border-slate-700 pb-2 mb-1">
          Navegação Master
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
