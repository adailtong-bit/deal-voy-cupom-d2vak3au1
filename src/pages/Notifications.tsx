import { useNotification } from '@/stores/NotificationContext'
import { useLanguage } from '@/stores/LanguageContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Bell,
  Check,
  Tag,
  Info,
  AlertTriangle,
  Settings,
  Zap,
} from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { Link } from 'react-router-dom'

export default function Notifications() {
  const {
    notifications,
    markAsRead,
    clearAll,
    smartAlertsEnabled,
    toggleSmartAlerts,
  } = useNotification()
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

  const highPriority = notifications.filter((n) => n.priority === 'high')
  const others = notifications.filter(
    (n) => !n.priority || n.priority !== 'high',
  )

  const NotificationList = ({ items }: { items: typeof notifications }) => (
    <div className="space-y-4">
      {items.map((notification) => (
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
              <div
                className={cn(
                  'p-2 rounded-full shadow-sm border',
                  notification.category === 'smart'
                    ? 'bg-purple-50 border-purple-200'
                    : 'bg-background',
                )}
              >
                {notification.category === 'smart' ? (
                  <Zap className="h-5 w-5 text-purple-600" />
                ) : (
                  getIcon(notification.type)
                )}
              </div>
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  {notification.title}
                  {notification.priority === 'high' && (
                    <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full uppercase">
                      Urgente
                    </span>
                  )}
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
          <CardContent className="p-4 pt-0 pl-[68px]">
            <p className="text-sm text-foreground/80 mb-2">
              {notification.message}
            </p>
            {notification.link && (
              <Link to={notification.link}>
                <Button
                  variant="link"
                  className="p-0 h-auto text-xs font-bold text-primary"
                >
                  {t('common.view')}
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )

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

      <div className="bg-muted/30 p-4 rounded-lg border mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-purple-100 p-2 rounded-full">
            <Settings className="h-5 w-5 text-purple-700" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Alertas Inteligentes</h3>
            <p className="text-xs text-muted-foreground">
              Receba ofertas baseadas no seu comportamento
            </p>
          </div>
        </div>
        <Switch
          checked={smartAlertsEnabled}
          onCheckedChange={toggleSmartAlerts}
        />
      </div>

      <ScrollArea className="h-[calc(100vh-220px)]">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Bell className="h-12 w-12 mb-4 opacity-20" />
            <p>{t('notifications.empty')}</p>
          </div>
        ) : (
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">
                Todas ({notifications.length})
              </TabsTrigger>
              <TabsTrigger value="high">
                Prioridade ({highPriority.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <NotificationList items={notifications} />
            </TabsContent>
            <TabsContent value="high">
              {highPriority.length > 0 ? (
                <NotificationList items={highPriority} />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma notificação prioritária.
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </ScrollArea>
    </div>
  )
}
