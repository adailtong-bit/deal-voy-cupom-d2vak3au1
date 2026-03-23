import { Link } from 'react-router-dom'
import { Search, Bell, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LanguageSelector } from '@/components/LanguageSelector'
import logoUrl from '@/assets/whatsapp-image-2026-01-25-at-5.34.51-am-1-9b370.jpeg'
import { useLanguage } from '@/stores/LanguageContext'
import { useCouponStore } from '@/stores/CouponContext'

export function DesktopHeader() {
  const { user } = useCouponStore()
  const { t } = useLanguage()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 hidden md:block">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="flex items-center gap-3 transition-transform hover:opacity-90"
          >
            <img
              src={logoUrl}
              alt="Deal voy cupom"
              className="h-10 w-10 rounded-full object-cover shadow-sm border border-slate-200"
            />
            <span className="font-bold text-xl text-primary tracking-tight">
              Deal Voy
            </span>
          </Link>
          <nav className="flex items-center gap-6 text-sm font-semibold">
            <Link
              to="/"
              className="flex items-center gap-1.5 transition-colors hover:text-primary"
            >
              <Home className="h-4 w-4" />
              {t('nav.home', 'Início')}
            </Link>
            <Link
              to="/vouchers"
              className="transition-colors hover:text-primary"
            >
              {t('nav.vouchers', 'Meus Vouchers')}
            </Link>
            <Link
              to="/explore"
              className="transition-colors hover:text-primary"
            >
              {t('nav.explore', 'Explorar')}
            </Link>
            <Link
              to="/seasonal"
              className="transition-colors hover:text-primary"
            >
              {t('nav.seasonal', 'Sazonal')}
            </Link>
            <Link
              to="/travel-planner"
              className="transition-colors hover:text-primary"
            >
              {t('nav.planner', 'Roteiros')}
            </Link>
            <Link
              to="/admin"
              className="transition-colors text-primary hover:text-primary/80 font-bold"
            >
              {t('nav.admin', 'Admin')}
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder={t('nav.search', 'Buscar...')}
              className="h-9 w-64 rounded-full border border-input bg-slate-50 pl-9 pr-4 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:bg-white transition-all"
            />
          </div>
          <LanguageSelector />

          {user ? (
            <>
              <Button variant="ghost" size="icon" asChild>
                <Link to="/notifications">
                  <Bell className="h-5 w-5" />
                </Link>
              </Button>
              <Link to="/profile">
                <Avatar className="h-9 w-9 transition-transform hover:scale-105 border">
                  <AvatarImage
                    src={user.avatar || undefined}
                    alt={user.name}
                    className="object-cover"
                  />
                  <AvatarFallback className="font-bold text-primary bg-primary/10">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </>
          ) : (
            <Button
              asChild
              variant="default"
              className="font-bold rounded-full px-6"
            >
              <Link to="/login">{t('auth.login', 'Entrar')}</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
