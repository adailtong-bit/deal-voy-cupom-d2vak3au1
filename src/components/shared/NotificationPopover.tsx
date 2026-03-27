import { Bell, BellRing, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useNotification } from '@/stores/NotificationContext'
import { useLanguage } from '@/stores/LanguageContext'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

export function NotificationPopover() {
  const { notifications, markAsRead } = useNotification()
  const { t } = useLanguage()

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 text-slate-600 hover:text-primary transition-colors"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-80 p-0 overflow-hidden shadow-lg border-slate-200"
        sideOffset={8}
      >
        <div className="bg-slate-50 border-b border-slate-100 px-4 py-3 flex items-center justify-between">
          <h4 className="font-semibold text-sm text-slate-800 flex items-center gap-2">
            <BellRing className="w-4 h-4 text-primary" />
            {t('notifications.title', 'Notificações')}
          </h4>
          {unreadCount > 0 && (
            <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
              {unreadCount} novas
            </span>
          )}
        </div>
        <div className="max-h-[320px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground flex flex-col items-center justify-center gap-2">
              <Bell className="w-8 h-8 text-slate-200" />
              Nenhuma notificação no momento.
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={cn(
                    'group flex flex-col gap-1.5 p-4 border-b border-slate-100 transition-colors hover:bg-slate-50 cursor-default relative',
                    !notif.read && 'bg-blue-50/30',
                  )}
                  onMouseEnter={() => !notif.read && markAsRead(notif.id)}
                >
                  {!notif.read && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r" />
                  )}
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-sm text-slate-800 leading-tight pr-4">
                      {notif.title}
                    </span>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap shrink-0 pt-0.5">
                      {new Date(notif.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {notif.message}
                  </p>
                  {notif.link && (
                    <Link
                      to={notif.link}
                      className="mt-1 flex items-center text-[11px] font-semibold text-primary hover:underline w-fit"
                    >
                      Ver Detalhes <ArrowRight className="w-3 h-3 ml-1" />
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-slate-50 border-t border-slate-100 p-2">
          <Button
            variant="ghost"
            className="w-full text-xs font-medium h-8 text-slate-600 hover:text-slate-900"
            asChild
          >
            <Link to="/notifications">Ver Todas Atividades</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
