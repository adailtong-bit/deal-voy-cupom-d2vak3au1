import { useNotification } from '@/stores/NotificationContext'
import { useLanguage } from '@/stores/LanguageContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Bell, Check, Tag, Info, AlertTriangle } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

export default function Notifications() {
  const { notifications, markAsRead, clearAll } = useNotification()
  const { t } = useLanguage()

  const getIcon = (type: string) => {
    switch (type) {
      case 'deal':
        return <Tag className="h-5 w-5 text-green-500" />
      case 'alert':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bell className="h-6 w-6" /> {t('notifications.title')}
        </h1>
        {notifications.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearAll}>
            Limpar tudo
          </Button>
        )}
      </div>

      <ScrollArea className="h-[calc(100vh-150px)]">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Bell className="h-12 w-12 mb-4 opacity-20" />
            <p>{t('notifications.empty')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={cn(
                  'transition-all hover:shadow-md cursor-pointer',
                  !notification.read ? 'bg-primary/5 border-primary/20' : '',
                )}
                onClick={() => markAsRead(notification.id)}
              >
                <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-background rounded-full shadow-sm border">
                      {getIcon(notification.type)}
                    </div>
                    <div>
                      <CardTitle className="text-base font-semibold">
                        {notification.title}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(notification.date), 'dd/MM HH:mm')}
                      </p>
                    </div>
                  </div>
                  {!notification.read && (
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  )}
                </CardHeader>
                <CardContent className="p-4 pt-0 pl-[60px]">
                  <p className="text-sm text-foreground/80">
                    {notification.message}
                  </p>
                  {notification.link && (
                    <Button variant="link" className="p-0 h-auto mt-2 text-xs">
                      {t('common.view')}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
