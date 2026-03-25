import { useState, useEffect, useRef } from 'react'
import { Coupon } from '@/lib/types'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Radar, MapPin, BellRing } from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const DISTANCE_THRESHOLD_KM = 0.1 // 100 meters

function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

interface ProximityAlertsToggleProps {
  stops: Coupon[]
  tripId: string
}

export function ProximityAlertsToggle({
  stops,
  tripId,
}: ProximityAlertsToggleProps) {
  const { t } = useLanguage()
  const [isActive, setIsActive] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const watchIdRef = useRef<number | null>(null)
  const notifiedStopsRef = useRef<Set<string>>(new Set())

  const isSupported = 'geolocation' in navigator && 'Notification' in window

  useEffect(() => {
    return () => stopTracking()
  }, [])

  const startTracking = () => {
    if (watchIdRef.current) return

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords

        stops.forEach((stop) => {
          if (!stop.coordinates) return
          if (notifiedStopsRef.current.has(stop.id)) return

          const dist = getDistanceKm(
            latitude,
            longitude,
            stop.coordinates.lat,
            stop.coordinates.lng,
          )

          if (dist <= DISTANCE_THRESHOLD_KM) {
            triggerNotification(stop)
            notifiedStopsRef.current.add(stop.id)
          }
        })
      },
      (err) => {
        console.error('Geolocation error:', err)
        if (err.code === err.PERMISSION_DENIED) {
          stopTracking()
          setIsActive(false)
          toast.error(
            t('proximity.location_denied', 'Acesso à localização negado.'),
          )
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000, // Optimize battery
        timeout: 5000,
      },
    )
  }

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
  }

  const triggerNotification = (stop: Coupon) => {
    if (Notification.permission === 'granted') {
      const n = new Notification(
        t('proximity.nearby_alert', 'Você está perto!'),
        {
          body: t(
            'proximity.nearby_desc',
            'Você está a menos de 100m da loja {store}! Clique para usar seu benefício.',
          ).replace('{store}', stop.storeName),
          icon: stop.image || '/icon-192.png',
        },
      )

      n.onclick = (e) => {
        e.preventDefault()
        window.focus()
        const url = new URL(window.location.href)
        url.searchParams.set('stopId', stop.id)
        window.history.pushState({}, '', url.toString())
        window.dispatchEvent(new Event('popstate'))
        n.close()
      }
    } else {
      toast.success(
        `${t('proximity.nearby_alert', 'Você está perto!')} - ${stop.storeName}`,
      )
    }
  }

  const handleToggle = (checked: boolean) => {
    if (checked) {
      if (
        Notification.permission === 'default' ||
        !('geolocation' in navigator)
      ) {
        setShowOnboarding(true)
      } else if (Notification.permission === 'denied') {
        toast.error(
          t(
            'proximity.needs_permission',
            'Por favor, habilite as notificações nas configurações do navegador.',
          ),
        )
      } else {
        requestAndStart()
      }
    } else {
      stopTracking()
      setIsActive(false)
      notifiedStopsRef.current.clear()
      toast.info(
        t('proximity.alerts_disabled', 'Alertas de proximidade desativados.'),
      )
    }
  }

  const requestAndStart = async () => {
    setShowOnboarding(false)
    let notifPerm = Notification.permission
    if (notifPerm === 'default') {
      notifPerm = await Notification.requestPermission()
    }

    if (notifPerm !== 'granted') {
      toast.error(
        t(
          'proximity.notification_denied',
          'Permissão de notificação negada. Ative nas configurações do navegador.',
        ),
      )
      return
    }

    navigator.geolocation.getCurrentPosition(
      () => {
        startTracking()
        setIsActive(true)
        toast.success(
          t(
            'proximity.alerts_enabled',
            'Alertas de proximidade ativados com sucesso! Radar em funcionamento.',
          ),
        )
      },
      (err) => {
        console.error(err)
        toast.error(
          t(
            'proximity.location_denied',
            'Acesso à localização negado. Habilite o GPS no seu dispositivo.',
          ),
        )
      },
    )
  }

  if (!isSupported) return null

  return (
    <>
      <div
        className={cn(
          'flex items-center space-x-3 bg-white px-4 py-1.5 rounded-full border shadow-sm transition-all',
          isActive ? 'border-primary/50 shadow-primary/10' : 'border-slate-200',
        )}
      >
        <div
          className={cn('relative flex h-4 w-4 items-center justify-center')}
        >
          {isActive && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-50"></span>
          )}
          <Radar
            className={cn(
              'relative h-4 w-4',
              isActive ? 'text-primary' : 'text-slate-400',
            )}
          />
        </div>
        <div className="flex flex-col">
          <Label
            htmlFor="proximity-alerts"
            className="font-semibold text-sm cursor-pointer leading-none text-slate-800"
          >
            {t('proximity.alerts_title', 'Radar de Ofertas')}
          </Label>
          <span className="text-[10px] text-slate-500 font-medium mt-0.5">
            {isActive
              ? t('proximity.status_active', 'Monitorando 100m')
              : t('proximity.status_inactive', 'Desativado')}
          </span>
        </div>
        <div className="pl-2">
          <Switch
            id="proximity-alerts"
            checked={isActive}
            onCheckedChange={handleToggle}
            className="data-[state=checked]:bg-primary"
          />
        </div>
      </div>

      <Dialog open={showOnboarding} onOpenChange={setShowOnboarding}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Radar className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-center text-xl">
              {t('proximity.onboarding_title', 'Ativar Radar de Proximidade')}
            </DialogTitle>
            <DialogDescription className="text-center pt-2">
              {t(
                'proximity.onboarding_desc',
                'Para que possamos avisar quando você estiver a menos de 100 metros de uma loja do seu roteiro, precisamos de duas permissões:',
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
              <MapPin className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-sm text-slate-800">
                  {t('proximity.perm_location_title', 'Localização (Sempre)')}
                </p>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  {t(
                    'proximity.perm_location_desc',
                    'Permite monitorar sua distância das lojas em tempo real e ativar os alertas corretamente.',
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
              <BellRing className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-sm text-slate-800">
                  {t('proximity.perm_notif_title', 'Notificações')}
                </p>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  {t(
                    'proximity.perm_notif_desc',
                    'Avisa você imediatamente com o celular bloqueado ao passar perto das promoções.',
                  )}
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-col gap-2 sm:space-x-0">
            <Button onClick={requestAndStart} className="w-full font-bold h-11">
              {t('proximity.grant_permissions', 'Conceder Permissões')}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowOnboarding(false)}
              className="w-full text-slate-500"
            >
              {t('common.cancel', 'Agora não')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
