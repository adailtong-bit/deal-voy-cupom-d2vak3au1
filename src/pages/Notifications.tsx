import { useNotification } from '@/stores/NotificationContext'
import { useLanguage } from '@/stores/LanguageContext'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Bell,
  Tag,
  Info,
  AlertTriangle,
  Settings,
  Zap,
  Target,
  CheckCircle,
} from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { Link } from 'react-router-dom'
import { useCouponStore } from '@/stores/CouponContext'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

export default function Notifications() {
  const {
    notifications,
    markAsRead,
    clearAll,
    smartAlertsEnabled,
    toggleSmartAlerts,
  } = useNotification()
  const { t } = useLanguage()
  const { missions, completeMission } = useCouponStore()

  const getIcon = (type: string) => {
    switch (type) {
      case 'deal':
        return <Tag className="h-5 w-5 text-[#4CAF50]" />
      case 'alert':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />
      case 'mission':
        return <Target className="h-5 w-5 text-blue-500" />
      default:
        return <Info className="h-5 w-5 text-[#2196F3]" />
    }
  }

  const highPriority = notifications.filter((n) => n.priority === 'high')

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
                  className="p-0 h-auto text-xs font-bold text-[#FF5722]"
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

  const MissionList = () => (
    <div className="space-y-4">
      {missions.map((mission) => (
        <Card
          key={mission.id}
          className={cn(
            'border-l-4',
            mission.completed
              ? 'border-l-green-500 opacity-80'
              : 'border-l-blue-500',
          )}
        >
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-500" /> {mission.title}
              </CardTitle>
              {mission.completed ? (
                <span className="text-green-600 flex items-center gap-1 text-xs font-bold">
                  <CheckCircle className="h-3 w-3" /> Completo
                </span>
              ) : (
                <span className="text-blue-600 text-xs font-bold bg-blue-50 px-2 py-1 rounded-full">
                  +{mission.rewardPoints} pts
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {mission.description}
            </p>
            {!mission.completed && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    className="w-full bg-[#2196F3] hover:bg-[#1976D2]"
                  >
                    Iniciar Missão
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{mission.title}</DialogTitle>
                    <DialogDescription>
                      Complete a tarefa abaixo para ganhar{' '}
                      {mission.rewardPoints} pontos.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4 space-y-4">
                    {mission.type === 'survey' ? (
                      <div className="space-y-2">
                        <p className="font-medium text-sm">
                          O que você achou da sua última visita?
                        </p>
                        <Textarea placeholder="Deixe seu comentário..." />
                      </div>
                    ) : (
                      <div className="bg-muted p-4 rounded text-center text-sm">
                        Compartilhe um roteiro público no seu perfil.
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={() => completeMission(mission.id)}
                      className="bg-[#4CAF50] hover:bg-[#43A047]"
                    >
                      Concluir & Receber Pontos
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
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
            {t('common.close')}
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
        <Tabs defaultValue="all">
          <TabsList className="mb-4 grid grid-cols-3">
            <TabsTrigger value="all">
              Todas ({notifications.length})
            </TabsTrigger>
            <TabsTrigger value="high">
              Urgentes ({highPriority.length})
            </TabsTrigger>
            <TabsTrigger value="missions">Missões</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Bell className="h-12 w-12 mb-4 opacity-20" />
                <p>{t('notifications.empty')}</p>
              </div>
            ) : (
              <NotificationList items={notifications} />
            )}
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

          <TabsContent value="missions">
            <MissionList />
          </TabsContent>
        </Tabs>
      </ScrollArea>
    </div>
  )
}
