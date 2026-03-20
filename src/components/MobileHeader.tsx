import { Link, useLocation } from 'react-router-dom'
import { Bell, Trophy } from 'lucide-react'
import { useNotification } from '@/stores/NotificationContext'
import { useCouponStore } from '@/stores/CouponContext'

export function MobileHeader() {
  const location = useLocation()
  const { unreadCount } = useNotification()
  const { user } = useCouponStore()

  if (
    location.pathname.includes('/login') ||
    location.pathname === '/travel-planner'
  )
    return null

  return (
    <header className="md:hidden flex items-center justify-between px-4 h-14 bg-background border-b sticky top-0 z-50">
      <Link
        className="font-extrabold text-xl tracking-tight text-primary flex items-center gap-2.5"
        to="/"
      >
        <img
          src="https://img.usecurling.com/i?q=ticket&color=gradient&shape=fill"
          alt="Deal Voy Logo"
          className="h-7 w-7 object-contain drop-shadow-sm"
        />
        Deal Voy
      </Link>
      <div className="flex items-center gap-1">
        <Link to="/rewards" className="p-2 relative text-amber-500">
          <Trophy className="h-5 w-5" />
        </Link>
        <Link to="/notifications" className="p-2 relative text-slate-600">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-destructive rounded-full border-2 border-background" />
          )}
        </Link>
      </div>
    </header>
  )
}
