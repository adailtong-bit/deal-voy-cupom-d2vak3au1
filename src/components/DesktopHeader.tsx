import { Link, useLocation } from 'react-router-dom'
import {
  Bell,
  User,
  Heart,
  Briefcase,
  Map,
  Compass,
  Trophy,
} from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'
import { useNotification } from '@/stores/NotificationContext'
import { useCouponStore } from '@/stores/CouponContext'
import { Button } from './ui/button'
import { LanguageSelector } from './LanguageSelector'

export function DesktopHeader() {
  const location = useLocation()
  const { t } = useLanguage()
  const { unreadCount } = useNotification()
  const { user } = useCouponStore()

  if (
    location.pathname.includes('/login') ||
    location.pathname === '/travel-planner'
  )
    return null

  const isMerchant = user?.role === 'shopkeeper'
  const isAdmin = user?.role === 'super_admin' || user?.role === 'franchisee'
  const isAgency = user?.role === 'agency'

  return (
    <header className="hidden md:flex items-center justify-between px-6 h-16 bg-background border-b sticky top-0 z-50">
      <div className="flex items-center gap-8">
        <Link to="/" className="flex items-center gap-3">
          <img
            src="https://img.usecurling.com/i?q=ticket&color=gradient&shape=fill"
            alt="Deal Voy Logo"
            className="h-8 w-8 object-contain drop-shadow-sm"
          />
          <span className="font-extrabold text-xl tracking-tight text-primary">
            Deal Voy
          </span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            to="/explore"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            <Compass className="h-4 w-4" /> {t('nav.explore')}
          </Link>
          <Link
            to="/travel-hub"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            <Map className="h-4 w-4" /> {t('nav.travel')}
          </Link>

          {isMerchant && (
            <Link
              to="/vendor"
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              <Briefcase className="h-4 w-4" /> {t('nav.vendor')}
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/admin"
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              <Briefcase className="h-4 w-4" /> {t('nav.admin')}
            </Link>
          )}
          {isAgency && (
            <Link
              to="/agency"
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              <Briefcase className="h-4 w-4" /> {t('nav.agency')}
            </Link>
          )}
        </nav>
      </div>

      <div className="flex items-center gap-2">
        <LanguageSelector />

        <Link to="/rewards">
          <Button
            variant="ghost"
            size="icon"
            className="text-amber-500 hover:text-amber-600 hover:bg-amber-50"
          >
            <Trophy className="h-5 w-5" />
          </Button>
        </Link>

        <Link to="/saved">
          <Button variant="ghost" size="icon">
            <Heart className="h-5 w-5" />
          </Button>
        </Link>

        <Link to="/notifications">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 bg-destructive rounded-full border-2 border-background" />
            )}
          </Button>
        </Link>
        <Link to="/profile">
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>
        </Link>
      </div>
    </header>
  )
}
