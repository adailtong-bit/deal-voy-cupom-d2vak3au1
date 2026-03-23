import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bell,
  Search,
  Home,
  Menu,
  Settings,
  Gift,
  Ticket,
  BarChart3,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import logoUrl from '@/assets/whatsapp-image-2026-01-25-at-5.34.51-am-1-9b370.jpeg'
import { useCouponStore } from '@/stores/CouponContext'
import { useLanguage } from '@/stores/LanguageContext'

export function MobileHeader() {
  const { user } = useCouponStore()
  const { t } = useLanguage()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setIsMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-600 hover:text-primary -ml-2"
                aria-label="Toggle menu"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-[300px] sm:w-[350px] flex flex-col gap-6 pt-12"
            >
              <SheetHeader className="text-left sr-only">
                <SheetTitle>{t('nav.menu', 'Navigation Menu')}</SheetTitle>
              </SheetHeader>

              <div className="flex items-center gap-3 px-1">
                <img
                  src={logoUrl}
                  alt="Deal Voy"
                  className="h-10 w-10 rounded-full object-cover shadow-sm border border-slate-200"
                />
                <span className="font-bold text-xl text-primary tracking-tight">
                  Deal Voy
                </span>
              </div>

              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={t('nav.search', 'Search')}
                  className="w-full pl-9 bg-slate-50 border-slate-200 h-11 rounded-xl"
                />
              </form>

              <nav className="flex flex-col gap-1.5 flex-1">
                <Link
                  to="/"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                >
                  <Home className="h-5 w-5 text-slate-400" />
                  {t('nav.home', 'Home')}
                </Link>

                <Link
                  to="/seasonal"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                >
                  <Gift className="h-5 w-5 text-slate-400" />
                  {t('nav.seasonal', 'Seasonal Offers')}
                </Link>

                <Link
                  to="/vouchers"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                >
                  <Ticket className="h-5 w-5 text-slate-400" />
                  {t('nav.vouchers', 'My Vouchers')}
                </Link>

                <Link
                  to="/reports"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                >
                  <BarChart3 className="h-5 w-5 text-slate-400" />
                  {t('nav.reports', 'Reports')}
                </Link>

                <div className="my-4 border-t border-slate-100"></div>

                <Link
                  to="/admin"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-base font-bold text-primary bg-primary/5 hover:bg-primary/10 transition-colors"
                >
                  <Settings className="h-5 w-5 text-primary" />
                  {t('nav.admin', 'Admin Dashboard')}
                </Link>
              </nav>
            </SheetContent>
          </Sheet>

          <Link
            to="/"
            className="flex items-center gap-2 transition-transform hover:opacity-90"
          >
            <img
              src={logoUrl}
              alt="Deal voy cupom"
              className="h-8 w-8 rounded-full object-cover shadow-sm border border-slate-200"
            />
            <span className="font-bold text-lg text-primary tracking-tight">
              Deal Voy
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-600 hover:text-primary"
                asChild
              >
                <Link to="/notifications">
                  <Bell className="h-5 w-5" />
                </Link>
              </Button>
              <Link to="/profile">
                <Avatar className="h-8 w-8 border">
                  <AvatarImage
                    src={user.avatar || undefined}
                    alt={user.name}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-xs font-bold text-primary bg-primary/10">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </>
          ) : (
            <Button
              asChild
              size="sm"
              variant="default"
              className="font-bold rounded-full ml-1"
            >
              <Link to="/login">{t('auth.login', 'Entrar')}</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
