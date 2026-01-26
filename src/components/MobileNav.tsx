import { Link, useLocation } from 'react-router-dom'
import { Home, Map as MapIcon, User, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/stores/LanguageContext'

export function MobileNav() {
  const location = useLocation()
  const path = location.pathname
  const { t } = useLanguage()

  const navItems = [
    { icon: Home, label: t('nav.home'), href: '/' },
    { icon: MapIcon, label: t('nav.explore'), href: '/explore' },
    { icon: Trophy, label: t('nav.challenges'), href: '/challenges' },
    { icon: User, label: t('nav.profile'), href: '/profile' },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-white/95 backdrop-blur-md pb-safe z-50 md:hidden shadow-[0_-2px_10px_rgba(0,0,0,0.03)]">
      <nav className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = path === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-slate-400 hover:text-slate-600',
              )}
            >
              <Icon
                className={cn('h-6 w-6', isActive && 'fill-current opacity-20')}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
