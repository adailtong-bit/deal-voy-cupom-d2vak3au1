import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  Search,
  Home,
  Menu,
  Settings,
  Gift,
  Ticket,
  Filter,
  MapPin,
  Globe,
  Compass,
  User,
  LogOut,
  Building,
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
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import logoUrl from '@/assets/whatsapp-image-2026-01-25-at-5.34.51-am-1-9b370.jpeg'
import { useCouponStore } from '@/stores/CouponContext'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { useLanguage } from '@/stores/LanguageContext'
import { CATEGORIES } from '@/lib/data'
import { NotificationPopover } from '@/components/shared/NotificationPopover'
import { useEffect } from 'react'

export function MobileHeader() {
  const { logout } = useCouponStore()
  const { user: authUser, signOut } = useAuth()
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

  const { t, language, setLanguage } = useLanguage()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const searchQuery = searchParams.get('q') || ''

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setIsMenuOpen(false)
  }

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
                  alt="Routevoy"
                  className="h-10 w-10 rounded-full object-cover shadow-sm border border-slate-200"
                />
                <span className="font-bold text-xl text-primary tracking-tight">
                  Routevoy
                </span>
              </div>

              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder={t('nav.search', 'Buscar ofertas...')}
                  className="w-full pl-9 bg-slate-50 border-slate-200 h-10 rounded-xl text-sm transition-all focus:bg-white"
                />
              </form>

              <nav className="flex flex-col gap-1.5 flex-1 overflow-y-auto pb-4">
                <Link
                  to="/"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                >
                  <Home className="h-5 w-5 text-slate-400" />
                  {t('nav.home', 'Home')}
                </Link>

                <Link
                  to="/explore"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                >
                  <Compass className="h-5 w-5 text-slate-400" />
                  {t('nav.explore', 'Explorar')}
                </Link>

                <Link
                  to="/seasonal"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                >
                  <Gift className="h-5 w-5 text-slate-400" />
                  {t('nav.seasonal', 'Ofertas Sazonais')}
                </Link>

                {user && (
                  <Link
                    to="/vouchers"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                  >
                    <Ticket className="h-5 w-5 text-slate-400" />
                    {t('nav.vouchers', 'Meus Vouchers')}
                  </Link>
                )}

                <Link
                  to="/travel"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                >
                  <MapPin className="h-5 w-5 text-slate-400" />
                  {t('nav.travel', 'Experiências')}
                </Link>

                <div className="my-2 border-t border-slate-100"></div>

                <h4 className="text-sm font-semibold text-slate-900 px-3 flex items-center gap-2 mb-2 mt-2">
                  <Filter className="h-4 w-4 text-slate-500" />
                  {t('nav.categories', 'Categorias')}
                </h4>
                <div className="flex flex-wrap gap-2 px-3 mb-2">
                  {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
                    <Badge
                      key={cat.id}
                      variant="secondary"
                      className="font-normal bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t(cat.translationKey, cat.label)}
                    </Badge>
                  ))}
                </div>

                <div className="my-2 border-t border-slate-100"></div>

                <div className="px-3 py-2 flex flex-col gap-2">
                  <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-1">
                    <Globe className="h-4 w-4 text-slate-500" />
                    {t('common.language', 'Idioma')}
                  </h4>
                  <Select
                    value={language}
                    onValueChange={(v) => {
                      setLanguage(v as any)
                      setIsMenuOpen(false)
                    }}
                  >
                    <SelectTrigger className="w-full bg-slate-50 border-slate-200 h-11 rounded-xl">
                      <SelectValue placeholder="Select Language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt">Português</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {user?.role === 'super_admin' && (
                  <>
                    <div className="my-2 border-t border-slate-100"></div>

                    <Link
                      to="/admin"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-base font-bold text-primary bg-primary/5 hover:bg-primary/10 transition-colors"
                    >
                      <Settings className="h-5 w-5 text-primary" />
                      {t('nav.admin', 'Admin Dashboard')}
                    </Link>
                  </>
                )}

                {user?.role === 'franchisee' && (
                  <>
                    <div className="my-2 border-t border-slate-100"></div>

                    <Link
                      to="/franchisee"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-base font-bold text-primary bg-primary/5 hover:bg-primary/10 transition-colors"
                    >
                      <Building className="h-5 w-5 text-primary" />
                      {t('nav.franchisee', 'Painel Regional')}
                    </Link>
                  </>
                )}

                {user?.role === 'shopkeeper' && (
                  <>
                    <div className="my-2 border-t border-slate-100"></div>

                    <Link
                      to="/vendor"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-base font-bold text-primary bg-primary/5 hover:bg-primary/10 transition-colors"
                    >
                      <Building className="h-5 w-5 text-primary" />
                      {t('nav.vendor', 'Painel do Lojista')}
                    </Link>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>

          <Link
            to="/"
            className="flex items-center gap-2 transition-transform hover:opacity-90"
          >
            <img
              src={logoUrl}
              alt="Routevoy"
              className="h-8 w-8 rounded-full object-cover shadow-sm border border-slate-200"
            />
            <span className="font-bold text-lg text-primary tracking-tight">
              Routevoy
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <NotificationPopover />
              <DropdownMenu>
                <DropdownMenuTrigger className="outline-none">
                  <Avatar className="h-8 w-8 border cursor-pointer hover:opacity-80 transition-opacity">
                    <AvatarImage
                      src={user.avatar || undefined}
                      alt={user.name}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-xs font-bold text-primary bg-primary/10">
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
