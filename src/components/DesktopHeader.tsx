import { Link, useLocation } from 'react-router-dom'
import {
  Search,
  MapPin,
  Menu,
  ShoppingBag,
  Calendar,
  Map,
  Bell,
  Trophy,
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
} from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useLanguage } from '@/stores/LanguageContext'
import { LanguageSelector } from './LanguageSelector'
import { useNotification } from '@/stores/NotificationContext'
import logoImg from '@/assets/whatsapp-image-2026-01-25-at-5.40.56-am.jpeg'

export function DesktopHeader() {
  const location = useLocation()
  const { t } = useLanguage()
  const { unreadCount } = useNotification()

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

          <div className="hidden xl:flex items-center space-x-4 text-sm font-medium">
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
              to="/explore"
              className={
                isActive('/explore')
                  ? 'text-primary font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }
            >
              {t('nav.explore')}
            </Link>
            <Link
              to="/challenges"
              className={
                isActive('/challenges')
                  ? 'text-primary font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }
            >
              Desafios
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
            <Link
              to="/vendor"
              className={
                isActive('/vendor')
                  ? 'text-primary font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }
            >
              {t('nav.vendor')}
            </Link>
            <Link
              to="/seasonal"
              className={
                isActive('/seasonal')
                  ? 'text-primary font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }
            >
              {t('nav.seasonal')}
            </Link>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center max-w-sm mx-4">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t('search.placeholder')}
              className="w-full bg-white border-2 border-primary/10 pl-9 rounded-full focus-visible:ring-primary h-9 focus-visible:border-primary/50 transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
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

          <Link to="/upload">
            <Button
              variant="default"
              size="sm"
              className="bg-primary hover:bg-primary/90 h-8 text-xs font-bold"
            >
              {t('nav.upload')}
            </Button>
          </Link>

          <Link to="/profile">
            <Avatar className="h-8 w-8 cursor-pointer hover:ring-2 hover:ring-secondary hover:ring-offset-2 transition-all">
              <AvatarImage src="https://img.usecurling.com/ppl/thumbnail?gender=male" />
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
                <SheetDescription>Navegue pelo aplicativo</SheetDescription>
              </SheetHeader>
              <div className="flex flex-col gap-4 mt-6">
                <Link
                  to="/"
                  className="text-lg font-medium flex items-center gap-2 hover:text-primary transition-colors"
                >
                  <ShoppingBag className="h-4 w-4" /> {t('nav.home')}
                </Link>
                <Link
                  to="/explore"
                  className="text-lg font-medium flex items-center gap-2 hover:text-primary transition-colors"
                >
                  <MapPin className="h-4 w-4" /> {t('nav.explore')}
                </Link>
                <Link
                  to="/challenges"
                  className="text-lg font-medium flex items-center gap-2 hover:text-primary transition-colors"
                >
                  <Trophy className="h-4 w-4" /> Desafios
                </Link>
                <Link
                  to="/travel-planner"
                  className="text-lg font-medium flex items-center gap-2 hover:text-primary transition-colors"
                >
                  <Map className="h-4 w-4" /> {t('nav.travel')}
                </Link>
                <Link
                  to="/seasonal"
                  className="text-lg font-medium flex items-center gap-2 hover:text-primary transition-colors"
                >
                  <Calendar className="h-4 w-4" /> {t('nav.seasonal')}
                </Link>
                <Link
                  to="/vendor"
                  className="text-lg font-medium flex items-center gap-2 hover:text-primary transition-colors"
                >
                  <ShoppingBag className="h-4 w-4" /> {t('nav.vendor')}
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
