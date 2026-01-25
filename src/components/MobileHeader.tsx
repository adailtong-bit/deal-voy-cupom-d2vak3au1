import { Link } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useNotification } from '@/stores/NotificationContext'

export function MobileHeader() {
  const { unreadCount } = useNotification()

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden flex items-center justify-between px-4 h-14">
      <Link to="/" className="flex items-center gap-2">
        <div className="bg-primary h-7 w-7 rounded-lg flex items-center justify-center text-primary-foreground font-bold text-lg">
          C
        </div>
        <span className="font-bold text-lg tracking-tight text-foreground">
          Cupom<span className="text-primary">Geo</span>
        </span>
      </Link>

      <Link to="/notifications">
        <Button variant="ghost" size="icon" className="relative">
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
    </header>
  )
}
