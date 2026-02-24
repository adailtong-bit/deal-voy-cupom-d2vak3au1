import { useNotification } from '@/stores/NotificationContext'
import { useLanguage } from '@/stores/LanguageContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Bell, Tag, Info, AlertTriangle, Zap } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn, formatDate } from '@/lib/utils'
import { AdSpace } from '@/components/AdSpace'
import { Label } from '@/components/ui/label'

export default function Notifications() {
  const {
    notifications,
    markAsRead,
    clearAll,
    smartAlertsEnabled,
    toggleSmartAlerts,
  } = useNotification()
  const { t, locale } = useLanguage()

  const getIcon = (type: string) => {
    switch (type) {
      case 'deal':
        return <Tag className="h-5 w-5 text-[#4CAF50]" />
      case 'alert':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />
      default:
        return <Info className="h-5 w-5 text-[#2196F3]" />
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl h-[calc(100vh-64px)] flex flex-col">
      <AdSpace
        position="top"
        className="mb-6 rounded-lg border-none bg-transparent px-0 shrink-0"
      />

      <div className="flex items-center justify-between mb-6 shrink-0">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bell className="h-6 w-6" /> {t('notifications.title')}
        </h1>
        {notifications.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearAll}>
            {t('common.close')}
          </Button>
        )}
      </div>

      <div className="bg-white p-4 rounded-lg border mb-6 space-y-4 shadow-sm shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-2 rounded-full">
              <Zap className="h-5 w-5 text-purple-700" />
            </div>
            <div>
              <Label className="font-semibold text-sm">
                {t('notifications.smart_alerts')}
              </Label>
              <p className="text-xs text-muted-foreground">
                {t('notifications.location_based')}
              </p>
            </div>
          </div>
          <Switch
            checked={smartAlertsEnabled}
            onCheckedChange={toggleSmartAlerts}
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-2 rounded-full">
              <Tag className="h-5 w-5 text-orange-700" />
            </div>
            <div>
              <Label className="font-semibold text-sm">
                {t('notifications.promotions')}
              </Label>
              <p className="text-xs text-muted-foreground">
                {t('notifications.partner_offers')}
              </p>
            </div>
          </div>
          <Switch defaultChecked />
        </div>
      </div>

      <ScrollArea className="flex-1 -mx-4 px-4">
        <div className="space-y-3 pb-4">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Bell className="h-12 w-12 mb-4 opacity-20" />
              <p>{t('notifications.empty')}</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <Card
                key={notification.id}
                className={cn(
                  'transition-all hover:shadow-md cursor-pointer border-l-4',
                  !notification.read ? 'bg-primary/5' : 'bg-card',
                  notification.priority === 'high'
                    ? 'border-l-orange-500'
                    : 'border-l-transparent',
                )}
                onClick={() => markAsRead(notification.id)}
              >
                <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full shadow-sm bg-background border">
                      {getIcon(notification.type)}
                    </div>
                    <div>
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        {notification.title}
                      </CardTitle>
                      <p className="text-[10px] text-muted-foreground">
                        {formatDate(notification.date, locale)}
                      </p>
                    </div>
                  </div>
                  {!notification.read && (
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  )}
                </CardHeader>
                <CardContent className="p-4 pt-0 pl-[60px]">
                  <p className="text-xs text-foreground/80 mb-2">
                    {notification.message}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
      <AdSpace
        position="bottom"
        className="mt-4 rounded-lg border-none bg-transparent px-0 shrink-0"
      />
    </div>
  )
}
