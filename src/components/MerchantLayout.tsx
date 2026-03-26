import { Outlet, Link, useLocation } from 'react-router-dom'
import { ScanLine, Megaphone, Users, LayoutDashboard } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Dashboard', path: '/vendor', icon: LayoutDashboard },
  { label: 'Scanner', path: '/merchant/scanner', icon: ScanLine },
  { label: 'Campanhas', path: '/merchant/campaigns', icon: Megaphone },
  { label: 'Leads', path: '/merchant/leads', icon: Users },
]

export default function MerchantLayout() {
  const location = useLocation()

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-slate-50/50">
      <div className="bg-white border-b px-4 py-3 shadow-sm z-10 hidden md:block">
        <div className="container mx-auto flex items-center justify-start gap-4">
          <nav className="flex items-center gap-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all',
                  location.pathname === item.path
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <main className="flex-1 w-full pb-20 md:pb-0 overflow-y-auto">
        <div className="h-full">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-white z-50 px-2 py-2 flex justify-around items-center shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-safe">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center gap-1.5 p-2 w-16 transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-slate-400 hover:text-slate-600',
              )}
            >
              <div
                className={cn(
                  'p-1.5 rounded-full transition-colors',
                  isActive && 'bg-primary/10',
                )}
              >
                <item.icon className="h-5 w-5" />
              </div>
              <span
                className={cn(
                  'text-[10px] font-semibold text-center leading-tight',
                  isActive ? 'text-primary' : 'text-slate-500',
                )}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
