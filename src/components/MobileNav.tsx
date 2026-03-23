import { Link, useLocation } from 'react-router-dom'
import { Home, Ticket, Map, User, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/stores/LanguageContext'

export function MobileNav() {
  const location = useLocation()
  const { t } = useLanguage()

  const navItems = [
    { icon: Home, label: t('nav.home', 'Início'), path: '/' },
    { icon: Ticket, label: t('nav.vouchers', 'Vouchers'), path: '/vouchers' },
    { icon: Map, label: t('nav.travel', 'Viagens'), path: '/travel' },
    { icon: Settings, label: t('nav.admin', 'Admin'), path: '/admin' },
    { icon: User, label: t('nav.profile', 'Perfil'), path: '/profile' },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <nav className="flex h-16 items-center justify-around px-4 pb-safe">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path === '/admin' &&
              location.pathname.startsWith('/admin')) ||
            (item.path === '/travel' && location.pathname.startsWith('/travel'))
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center gap-1 min-w-[4rem] text-muted-foreground transition-colors hover:text-primary',
                isActive && 'text-primary',
              )}
            >
              <item.icon
                className={cn('h-5 w-5', isActive && 'fill-primary/20')}
              />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
