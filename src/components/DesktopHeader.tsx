import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Search, Bell, Home, User, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LanguageSelector } from '@/components/LanguageSelector'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import logoUrl from '@/assets/whatsapp-image-2026-01-25-at-5.34.51-am-1-9b370.jpeg'
import { useLanguage } from '@/stores/LanguageContext'
import { useCouponStore } from '@/stores/CouponContext'

export function DesktopHeader() {
  const { user, logout } = useCouponStore()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const searchQuery = searchParams.get('q') || ''

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setSearchParams(
      (prev) => {
        if (val) prev.set('q', val)
        else prev.delete('q')
        return prev
      },
      { replace: true },
    )
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

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
            {user && (
              <Link
                to="/vouchers"
                className="transition-colors hover:text-primary"
              >
                {t('nav.vouchers', 'Meus Vouchers')}
              </Link>
            )}
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
            <Link to="/travel" className="transition-colors hover:text-primary">
              {t('nav.travel', 'Experiências')}
            </Link>
            {user?.role === 'super_admin' && (
              <Link
                to="/admin"
                className="transition-colors text-primary hover:text-primary/80 font-bold"
              >
                {t('nav.admin', 'Admin')}
              </Link>
            )}
            {user?.role === 'franchisee' && (
              <Link
                to="/franchisee"
                className="transition-colors text-primary hover:text-primary/80 font-bold"
              >
                {t('nav.franchisee', 'Painel Regional')}
              </Link>
            )}
            {user?.role === 'shopkeeper' && (
              <Link
                to="/vendor"
                className="transition-colors text-primary hover:text-primary/80 font-bold"
              >
                {t('nav.vendor', 'Painel do Lojista')}
              </Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <input
              type="search"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder={t('nav.search', 'Buscar...')}
              className="h-8 w-32 md:w-40 lg:w-48 rounded-full border border-input bg-slate-50/50 pl-8 pr-4 text-xs transition-all focus:w-56 lg:focus:w-64 focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none placeholder:text-muted-foreground/70"
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
              <DropdownMenu>
                <DropdownMenuTrigger className="outline-none">
                  <Avatar className="h-9 w-9 transition-transform hover:scale-105 border cursor-pointer">
                    <AvatarImage
                      src={user.avatar || undefined}
                      alt={user.name}
                      className="object-cover"
                    />
                    <AvatarFallback className="font-bold text-primary bg-primary/10">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/profile" className="flex items-center w-full">
                      <User className="mr-2 h-4 w-4" />
                      {t('profile.title', 'Meu Perfil')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {t('auth.logout', 'Sair')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
