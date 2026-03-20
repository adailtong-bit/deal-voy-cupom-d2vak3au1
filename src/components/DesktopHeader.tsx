import { Link } from 'react-router-dom'
import { Search, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LanguageSelector } from '@/components/LanguageSelector'
import logoUrl from '@/assets/whatsapp-image-2026-01-25-at-5.34.51-am-1-9b370.jpeg'
import useUserStore from '@/stores/useUserStore'
import { useLanguage } from '@/stores/LanguageContext'

export function DesktopHeader() {
  const { user } = useUserStore()
  const { t } = useLanguage()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 hidden md:block">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <img
              src={logoUrl}
              alt="Deal voy cupom"
              className="h-10 w-10 rounded-full object-cover shadow-sm"
            />
            <span className="font-bold text-xl text-primary tracking-tight">
              Deal Voy
            </span>
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link
              to="/explore"
              className="transition-colors hover:text-primary"
            >
              {t('nav.explore')}
            </Link>
            <Link
              to="/seasonal"
              className="transition-colors hover:text-primary"
            >
              Ofertas
            </Link>
            <Link
              to="/travel-planner"
              className="transition-colors hover:text-primary"
            >
              {t('nav.planner')}
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder={t('nav.search')}
              className="h-9 w-64 rounded-md border border-input bg-background pl-8 pr-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
          <LanguageSelector />
          <Button variant="ghost" size="icon" asChild>
            <Link to="/notifications">
              <Bell className="h-5 w-5" />
            </Link>
          </Button>
          <Link to="/profile">
            <Avatar className="h-8 w-8 transition-transform hover:scale-105">
              <AvatarImage
                src={user.avatar || undefined}
                alt={user.name}
                className="object-cover"
              />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </div>
    </header>
  )
}
