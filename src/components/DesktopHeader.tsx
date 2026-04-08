import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Search, Home, User, LogOut } from 'lucide-react'
import { NotificationPopover } from '@/components/shared/NotificationPopover'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LanguageSelector } from '@/components/LanguageSelector'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
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
import { cn } from '@/lib/utils'

export function DesktopHeader() {
  const { logout } = useCouponStore()
  const { user: authUser, signOut } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    let isMounted = true
    if (authUser) {
      supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()
        .then(({ data }) => {
          if (data && isMounted) setProfile(data)
        })
    } else {
      setProfile(null)
    }
    return () => {
      isMounted = false
    }
  }, [authUser])

  const user = authUser
    ? {
        id: authUser.id,
        name:
          profile?.name ||
          authUser.user_metadata?.name ||
          authUser.email?.split('@')[0] ||
          'User',
        email: authUser.email,
        role: profile?.role || authUser.user_metadata?.role || 'user',
        avatar: authUser.user_metadata?.avatar_url || null,
      }
    : null

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

  const handleLogout = async () => {
    await signOut()
    logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 hidden md:block">
      <div className="container flex h-16 items-center justify-between gap-4 max-w-full">
        <div className="flex items-center gap-4 lg:gap-8 min-w-0 overflow-hidden">
          <Link
            to="/"
            className="flex items-center gap-2 lg:gap-3 transition-transform hover:opacity-90 shrink-0"
          >
            <img
              src={logoUrl}
              alt="Routevoy"
              className="h-10 w-10 rounded-full object-cover shadow-sm border border-slate-200 shrink-0"
            />
            <span className="font-bold text-xl text-primary tracking-tight hidden lg:inline-block">
              Routevoy
            </span>
          </Link>
          <nav className="flex items-center gap-3 lg:gap-6 text-sm font-semibold shrink-0 overflow-x-auto hide-scrollbar">
            <Link
              to="/"
              className="flex items-center gap-1.5 transition-colors hover:text-primary whitespace-nowrap"
            >
              <Home className="h-4 w-4" />
              {t('nav.home', 'Início')}
            </Link>
            {user && (
              <Link
                to="/vouchers"
                className="transition-colors hover:text-primary whitespace-nowrap"
              >
                {t('nav.vouchers', 'Meus Vouchers')}
              </Link>
            )}
            <Link
              to="/explore"
              className="transition-colors hover:text-primary whitespace-nowrap"
            >
              {t('nav.explore', 'Explorar')}
            </Link>
            <Link
              to="/seasonal"
              className="transition-colors hover:text-primary whitespace-nowrap"
            >
              {t('nav.seasonal', 'Sazonal')}
            </Link>
            <Link
              to="/travel"
              className="transition-colors hover:text-primary whitespace-nowrap"
            >
              {t('nav.travel', 'Experiências')}
            </Link>
            {user?.role === 'super_admin' && (
              <Link
                to="/admin"
                className="transition-colors text-primary hover:text-primary/80 font-bold whitespace-nowrap"
              >
                {t('nav.admin', 'Admin')}
              </Link>
            )}
            {user?.role === 'franchisee' && (
              <Link
                to="/franchisee"
                className="transition-colors text-primary hover:text-primary/80 font-bold whitespace-nowrap"
              >
                {t('nav.franchisee', 'Painel Regional')}
              </Link>
            )}
            {user?.role === 'shopkeeper' && (
              <Link
                to="/vendor"
                className="transition-colors text-primary hover:text-primary/80 font-bold whitespace-nowrap"
              >
                {t('nav.vendor', 'Painel do Lojista')}
              </Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-2 lg:gap-4 shrink-0">
          <div className="relative group hidden md:block flex-shrink-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 transition-colors group-focus-within:text-primary z-10 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder={t('nav.search', 'Buscar...')}
              className={cn(
                'h-9 rounded-full border transition-all duration-300 outline-none focus:bg-white focus:border-input focus:ring-2 focus:ring-primary/20 focus:w-48 lg:focus:w-64 focus:pl-9 focus:pr-4 focus:text-foreground focus:placeholder:text-muted-foreground',
                searchQuery
                  ? 'w-48 lg:w-64 pl-9 pr-4 bg-white border-input text-foreground placeholder:text-muted-foreground'
                  : 'w-9 bg-slate-100 border-transparent text-transparent placeholder:text-transparent cursor-pointer hover:bg-slate-200',
              )}
              title={t('nav.search', 'Buscar')}
            />
          </div>
          <LanguageSelector />

          {user ? (
            <>
              <NotificationPopover />
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
              className="font-bold rounded-full px-4 lg:px-6 shrink-0"
            >
              <Link to="/login">{t('auth.login', 'Entrar')}</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
