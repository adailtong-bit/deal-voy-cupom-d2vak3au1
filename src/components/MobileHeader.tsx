import { Link } from 'react-router-dom'
import { Bell, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import logoUrl from '@/assets/whatsapp-image-2026-01-25-at-5.34.51-am-1-9b370.jpeg'
import { useCouponStore } from '@/stores/CouponContext'
import { useLanguage } from '@/stores/LanguageContext'

export function MobileHeader() {
  const { user } = useCouponStore()
  const { t } = useLanguage()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="flex h-14 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <img
            src={logoUrl}
            alt="Deal voy cupom"
            className="h-8 w-8 rounded-full object-cover shadow-sm border border-slate-200"
          />
          <span className="font-bold text-lg text-primary tracking-tight">
            Deal Voy
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-600 hover:text-primary"
          >
            <Search className="h-5 w-5" />
          </Button>

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
              <Link to="/login">{t('auth.login')}</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
