import { Link } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useNotification } from '@/stores/NotificationContext'
import { SyncStatus } from './SyncStatus'
import { LanguageSelector } from './LanguageSelector'
import logoImg from '@/assets/whatsapp-image-2026-01-25-at-5.40.56-am.jpeg'

export function MobileHeader() {
  const { unreadCount } = useNotification()

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden flex flex-col justify-center px-4 transition-all duration-300">
      <div className="flex items-center justify-between h-14 w-full">
        <Link
          to="/"
          reloadDocument
          className="flex items-center gap-1.5 hover:opacity-90 transition-opacity animate-in fade-in slide-in-from-left-2 duration-300"
        >
          <img
            src={logoImg}
            alt="Deal Voy Logo"
            className="h-8 w-8 rounded-md object-contain"
          />
          <span className="font-bold text-lg tracking-tight text-foreground">
            Deal <span className="text-primary">Voy</span>
          </span>
        </Link>

        <div className="flex items-center gap-1">
          <LanguageSelector />
          <SyncStatus />
          <Link to="/notifications">
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-secondary/10"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 rounded-full text-[10px]"
                >
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
