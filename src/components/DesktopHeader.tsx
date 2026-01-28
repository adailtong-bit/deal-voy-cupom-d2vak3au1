import { Link, useLocation } from 'react-router-dom'
import {
  Search,
  Menu,
  ShoppingBag,
  Calendar,
  Map,
  Bell,
  Briefcase,
  ShieldCheck,
  Gift,
  Plane,
  Building,
  CreditCard,
  Settings,
  User,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useLanguage } from '@/stores/LanguageContext'
import { LanguageSelector } from './LanguageSelector'
import { useNotification } from '@/stores/NotificationContext'
import { useCouponStore } from '@/stores/CouponContext'
import { SyncStatus } from './SyncStatus'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import logoImg from '@/assets/whatsapp-image-2026-01-25-at-5.40.56-am.jpeg'

export function DesktopHeader() {
  const location = useLocation()
  const { t } = useLanguage()
  const { unreadCount } = useNotification()
  const { user, selectedRegion, setRegion, regions } = useCouponStore()

  const isActive = (path: string) => location.pathname === path

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 hidden md:block">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <img
              src={logoImg}
              alt="Deal Voy Logo"
              className="h-10 w-10 rounded-md object-contain"
            />
            <span className="font-bold text-xl tracking-tight text-foreground">
              Deal <span className="text-primary">Voy</span>
            </span>
          </Link>

          <div className="hidden xl:flex items-center space-x-6 text-sm font-medium">
            <Link
              to="/"
              className={
                isActive('/')
                  ? 'text-primary font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }
            >
              {t('nav.home')}
            </Link>
            <Link
              to="/travel-hub"
              className={
                isActive('/travel-hub')
                  ? 'text-primary font-bold flex items-center gap-1'
                  : 'text-muted-foreground hover:text-foreground flex items-center gap-1'
              }
            >
              <Plane className="h-4 w-4" /> {t('hub.title')}
            </Link>
            <Link
              to="/agencies"
              className={
                isActive('/agencies')
                  ? 'text-primary font-bold flex items-center gap-1'
                  : 'text-muted-foreground hover:text-foreground flex items-center gap-1'
              }
            >
              <Building className="h-4 w-4" /> {t('agencies.title')}
            </Link>
            <Link
              to="/rewards"
              className={
                isActive('/rewards')
                  ? 'text-primary font-bold flex items-center gap-1'
                  : 'text-muted-foreground hover:text-foreground flex items-center gap-1'
              }
            >
              <Gift className="h-4 w-4" /> {t('nav.rewards')}
            </Link>
            <Link
              to="/travel-planner"
              className={
                isActive('/travel-planner')
                  ? 'text-primary font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }
            >
              {t('nav.travel')}
            </Link>
            {(user?.role === 'super_admin' || user?.role === 'franchisee') && (
              <Link
                to="/admin"
                className={
                  isActive('/admin')
                    ? 'text-primary font-bold flex items-center gap-1'
                    : 'text-muted-foreground hover:text-foreground flex items-center gap-1'
                }
              >
                <ShieldCheck className="h-4 w-4" /> {t('nav.admin')}
              </Link>
            )}
            {user?.role === 'agency' && (
              <Link
                to="/agency"
                className={
                  isActive('/agency')
                    ? 'text-primary font-bold flex items-center gap-1'
                    : 'text-muted-foreground hover:text-foreground flex items-center gap-1'
                }
              >
                <Briefcase className="h-4 w-4" /> {t('nav.agency')}
              </Link>
            )}
            {user?.role === 'shopkeeper' && (
              <Link
                to="/vendor"
                className={
                  isActive('/vendor')
                    ? 'text-primary font-bold flex items-center gap-1'
                    : 'text-muted-foreground hover:text-foreground flex items-center gap-1'
                }
              >
                <Briefcase className="h-4 w-4" /> {t('nav.vendor')}
              </Link>
            )}
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center max-w-sm mx-4">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t('common.search')}
              className="w-full bg-white border-2 border-slate-100 pl-9 rounded-full focus-visible:ring-primary h-9 focus-visible:border-primary/50 transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Select value={selectedRegion} onValueChange={setRegion}>
            <SelectTrigger className="w-[110px] h-8 text-xs bg-muted/50 border-none focus:ring-0 px-2 gap-1 rounded-full">
              <SelectValue placeholder="Region" />
            </SelectTrigger>
            <SelectContent align="end">
              {regions.map((r) => (
                <SelectItem key={r.id} value={r.code}>
                  {r.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <SyncStatus />
          <LanguageSelector />

          <Link to="/notifications">
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-secondary/10"
            >
              <Bell className="h-5 w-5 text-foreground" />
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 rounded-full text-[10px]"
                >
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </Link>

          <Link to={user ? '/profile' : '/login'}>
            <Avatar className="h-8 w-8 cursor-pointer hover:ring-2 hover:ring-secondary hover:ring-offset-2 transition-all">
              <AvatarImage
                src={
                  user?.avatar ||
                  'https://img.usecurling.com/ppl/thumbnail?gender=male'
                }
              />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </Link>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="xl:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Menu Deal Voy</SheetTitle>
                <SheetDescription>Deal Voy App</SheetDescription>
              </SheetHeader>
              <div className="flex flex-col gap-4 mt-6">
                <SheetClose asChild>
                  <Link
                    to="/"
                    className="text-lg font-medium flex items-center gap-2 hover:text-primary transition-colors"
                  >
                    <ShoppingBag className="h-4 w-4" /> {t('nav.home')}
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    to="/profile"
                    className="text-lg font-medium flex items-center gap-2 hover:text-primary transition-colors"
                  >
                    <User className="h-4 w-4" /> {t('nav.profile')}
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    to="/payment-methods"
                    className="text-lg font-medium flex items-center gap-2 hover:text-primary transition-colors"
                  >
                    <CreditCard className="h-4 w-4" />{' '}
                    {t('profile.payment_methods')}
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    to="/settings"
                    className="text-lg font-medium flex items-center gap-2 hover:text-primary transition-colors"
                  >
                    <Settings className="h-4 w-4" /> {t('profile.settings')}
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    to="/travel-hub"
                    className="text-lg font-medium flex items-center gap-2 hover:text-primary transition-colors"
                  >
                    <Plane className="h-4 w-4" /> {t('hub.title')}
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    to="/agencies"
                    className="text-lg font-medium flex items-center gap-2 hover:text-primary transition-colors"
                  >
                    <Building className="h-4 w-4" /> {t('agencies.title')}
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    to="/travel-planner"
                    className="text-lg font-medium flex items-center gap-2 hover:text-primary transition-colors"
                  >
                    <Map className="h-4 w-4" /> {t('nav.travel')}
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    to="/seasonal"
                    className="text-lg font-medium flex items-center gap-2 hover:text-primary transition-colors"
                  >
                    <Calendar className="h-4 w-4" /> {t('nav.seasonal')}
                  </Link>
                </SheetClose>
                {(user?.role === 'super_admin' ||
                  user?.role === 'franchisee') && (
                  <SheetClose asChild>
                    <Link
                      to="/admin"
                      className="text-lg font-medium flex items-center gap-2 hover:text-primary transition-colors"
                    >
                      <ShieldCheck className="h-4 w-4" /> {t('nav.admin')}
                    </Link>
                  </SheetClose>
                )}
                {user?.role === 'agency' && (
                  <SheetClose asChild>
                    <Link
                      to="/agency"
                      className="text-lg font-medium flex items-center gap-2 hover:text-primary transition-colors"
                    >
                      <Briefcase className="h-4 w-4" /> {t('nav.agency')}
                    </Link>
                  </SheetClose>
                )}
                {user?.role === 'shopkeeper' && (
                  <SheetClose asChild>
                    <Link
                      to="/vendor"
                      className="text-lg font-medium flex items-center gap-2 hover:text-primary transition-colors"
                    >
                      <Briefcase className="h-4 w-4" /> {t('nav.vendor')}
                    </Link>
                  </SheetClose>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
