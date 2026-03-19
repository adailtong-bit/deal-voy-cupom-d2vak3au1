import { Link, useLocation } from 'react-router-dom'
import { Compass, Heart, LayoutGrid, User, Briefcase, Map } from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'
import { useCouponStore } from '@/stores/CouponContext'

export function MobileNav() {
  const location = useLocation()
  const { t } = useLanguage()
  const { user } = useCouponStore()

  if (
    location.pathname.includes('/login') ||
    location.pathname === '/travel-planner'
  )
    return null

  const isMerchant = user?.role === 'shopkeeper'
  const isAdmin = user?.role === 'super_admin' || user?.role === 'franchisee'
  const isAgency = user?.role === 'agency'

  const navItems = [
    { icon: LayoutGrid, label: t('nav.home'), path: '/' },
    { icon: Compass, label: t('nav.explore'), path: '/explore' },
    { icon: Map, label: t('nav.travel'), path: '/travel-hub' },
    { icon: Heart, label: t('nav.saved'), path: '/saved' },
    { icon: User, label: t('nav.profile'), path: '/profile' },
  ]

  if (isMerchant) {
    navItems[1] = { icon: Briefcase, label: t('nav.vendor'), path: '/vendor' }
  } else if (isAdmin) {
    navItems[1] = { icon: Briefcase, label: t('nav.admin'), path: '/admin' }
  } else if (isAgency) {
    navItems[1] = { icon: Briefcase, label: t('nav.agency'), path: '/agency' }
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border/50 pb-safe z-50 md:hidden">
      <ul className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          return (
            <li key={item.path} className="flex-1">
              <Link
                to={item.path}
                className={`flex flex-col items-center justify-center h-full w-full space-y-1 transition-colors ${
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <div
                  className={`relative p-1 rounded-xl transition-all duration-300 ${isActive ? 'bg-primary/10 scale-110' : ''}`}
                >
                  <Icon
                    className={`h-5 w-5 ${isActive ? 'fill-primary/20' : ''}`}
                  />
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 w-1 h-1 bg-primary rounded-full transform -translate-x-1/2" />
                  )}
                </div>
                <span
                  className={`text-[10px] font-medium tracking-wide ${isActive ? 'font-bold' : ''}`}
                >
                  {item.label}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
