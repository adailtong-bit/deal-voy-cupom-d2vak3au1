import { Link, useLocation } from 'react-router-dom'
import { Home, Map as MapIcon, PlusCircle, Heart, User } from 'lucide-react'
import { cn } from '@/lib/utils'

export function MobileNav() {
  const location = useLocation()
  const path = location.pathname

  const navItems = [
    { icon: Home, label: 'Início', href: '/' },
    { icon: MapIcon, label: 'Explorar', href: '/explore' },
    { icon: PlusCircle, label: 'Enviar Doc', href: '/upload', special: true },
    { icon: Heart, label: 'Salvos', href: '/saved' },
    { icon: User, label: 'Perfil', href: '/profile' },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-background/80 backdrop-blur-md pb-safe z-50 md:hidden">
      <nav className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = path === item.href
          const Icon = item.icon

          if (item.special) {
            return (
              <Link
                key={item.href}
                to={item.href}
                className="flex flex-col items-center justify-center -mt-6"
              >
                <div className="bg-primary text-primary-foreground rounded-full p-3 shadow-lg shadow-primary/30 transform transition-transform active:scale-95">
                  <Icon className="h-7 w-7" />
                </div>
                <span className="text-[10px] font-medium mt-1 text-primary">
                  {item.label}
                </span>
              </Link>
            )
          }

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground',
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
