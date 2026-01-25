import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCouponStore } from '@/stores/CouponContext'
import { CouponCard } from '@/components/CouponCard'
import {
  MapPin,
  ArrowRight,
  Navigation,
  PlayCircle,
  StopCircle,
  BellRing,
  Flame,
} from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'
import { useNotification } from '@/stores/NotificationContext'

export default function TravelPlanner() {
  const { coupons } = useCouponStore()
  const { t } = useLanguage()
  const { addNotification } = useNotification()
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [isRouteCalculated, setIsRouteCalculated] = useState(false)
  const [isTravelModeActive, setIsTravelModeActive] = useState(false)

  const handlePlanRoute = () => {
    if (origin && destination) {
      setIsRouteCalculated(true)
    }
  }

  const toggleTravelMode = () => {
    setIsTravelModeActive(!isTravelModeActive)
  }

  // Mock travel mode simulation
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTravelModeActive) {
      interval = setInterval(() => {
        if (Math.random() > 0.7) {
          const randomCoupon =
            coupons[Math.floor(Math.random() * coupons.length)]
          addNotification({
            title: `Oferta próxima em sua rota!`,
            message: `${randomCoupon.storeName} tem ${randomCoupon.discount} - Desvio de apenas 2 min!`,
            type: 'deal',
          })
        }
      }, 5000)
    }
    return () => clearInterval(interval)
  }, [isTravelModeActive, coupons, addNotification])

  const routeDeals = coupons.slice(0, 4)
  // Calculate potential savings for visualization
  const totalSavings = routeDeals.length * 25 // Arbitrary mock value

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">{t('travel.title')}</h1>
          <p className="text-muted-foreground">
            Encontre as melhores ofertas no seu caminho.
          </p>
        </div>

        <Card className="mb-8 shadow-lg border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Navigation className="h-5 w-5 text-primary" />
              Defina sua Rota
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 md:space-y-0 md:flex md:items-end md:gap-4">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">De onde?</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cidade de origem (ex: São Paulo)"
                  className="pl-9"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                />
              </div>
            </div>
            <div className="hidden md:flex pb-3 text-muted-foreground">
              <ArrowRight className="h-6 w-6" />
            </div>
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">Para onde?</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cidade de destino (ex: Rio de Janeiro)"
                  className="pl-9"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                />
              </div>
            </div>
            <Button
              className="w-full md:w-auto"
              onClick={handlePlanRoute}
              disabled={!origin || !destination}
            >
              Buscar Ofertas na Rota
            </Button>
          </CardContent>
        </Card>

        {isRouteCalculated && (
          <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">
                  Ofertas Encontradas no Caminho
                </h2>
                <div className="flex gap-2 mt-1">
                  <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
                    4 paradas sugeridas
                  </span>
                  <span className="text-sm text-green-700 bg-green-100 px-3 py-1 rounded-full font-bold flex items-center gap-1">
                    <Flame className="h-3 w-3 fill-current" /> Hotspot de
                    Economia: R$ {totalSavings},00
                  </span>
                </div>
              </div>

              <Button
                onClick={toggleTravelMode}
                variant={isTravelModeActive ? 'destructive' : 'default'}
                className={isTravelModeActive ? 'animate-pulse' : ''}
              >
                {isTravelModeActive ? (
                  <>
                    <StopCircle className="mr-2 h-4 w-4" /> Parar Modo Viagem
                  </>
                ) : (
                  <>
                    <PlayCircle className="mr-2 h-4 w-4" /> Iniciar Modo Viagem
                  </>
                )}
              </Button>
            </div>

            {isTravelModeActive && (
              <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-md flex items-center gap-3">
                <BellRing className="h-5 w-5 animate-bounce" />
                <div>
                  <p className="font-bold text-sm">Monitoramento Ativo</p>
                  <p className="text-xs">
                    Você receberá alertas de ofertas conforme avança na rota.
                  </p>
                </div>
              </div>
            )}

            <div className="relative h-64 w-full rounded-xl overflow-hidden bg-slate-100 border shadow-inner">
              <img
                src="https://img.usecurling.com/p/1200/400?q=highway%20map&color=blue"
                alt="Route Map"
                className="w-full h-full object-cover opacity-80"
              />
              {/* Savings Hotspot Marker on Map (Mock) */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="bg-green-600 text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg animate-bounce">
                  $$$ Hotspot
                </div>
                <div className="h-4 w-4 bg-green-600 rounded-full border-2 border-white shadow-md"></div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {routeDeals.map((coupon, index) => (
                <div
                  key={coupon.id}
                  className="relative pl-8 border-l-2 border-dashed border-primary/30 pb-8 last:pb-0"
                >
                  <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-primary" />
                  <div className="mb-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Parada {index + 1} • {coupon.distance / 10}km do início
                  </div>
                  <CouponCard
                    coupon={coupon}
                    variant="horizontal"
                    className="h-32"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
