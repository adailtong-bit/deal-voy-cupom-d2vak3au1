import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
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
  Utensils,
  Timer,
  PiggyBank,
  Download,
} from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'
import { useNotification } from '@/stores/NotificationContext'
import { toast } from 'sonner'

export default function TravelPlanner() {
  const { coupons, downloadOffline } = useCouponStore()
  const { t } = useLanguage()
  const { addNotification } = useNotification()
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [isRouteCalculated, setIsRouteCalculated] = useState(false)
  const [isTravelModeActive, setIsTravelModeActive] = useState(false)
  const [routeType, setRouteType] = useState<'fastest' | 'economical'>(
    'fastest',
  )

  const handlePlanRoute = () => {
    if (origin && destination) {
      setIsRouteCalculated(true)
    }
  }

  const toggleTravelMode = () => {
    setIsTravelModeActive(!isTravelModeActive)
  }

  const handleDownloadRoute = () => {
    // Simulate downloading the coupons on the route
    downloadOffline(routeDeals.map((c) => c.id))
  }

  // Real-Time GPS Navigation & Proximity Alerts Simulation
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTravelModeActive) {
      interval = setInterval(() => {
        // Mock random alerts
        const rand = Math.random()
        if (rand > 0.6) {
          if (rand > 0.8) {
            addNotification({
              title: 'Alerta de Almoço!',
              message:
                'Restaurante da Vila tem pratos a R$ 35,00 a 200m de você!',
              type: 'alert',
            })
          } else {
            const randomCoupon =
              coupons[Math.floor(Math.random() * coupons.length)]
            addNotification({
              title: `Oferta próxima em sua rota!`,
              message: `${randomCoupon.storeName} tem ${randomCoupon.discount} - Desvio de apenas 2 min!`,
              type: 'deal',
            })
          }
        }
      }, 5000)
    }
    return () => clearInterval(interval)
  }, [isTravelModeActive, coupons, addNotification])

  // Mock Route Data Calculation
  const routeDeals =
    routeType === 'economical' ? coupons.slice(0, 6) : coupons.slice(0, 2)
  const totalSavings = routeType === 'economical' ? 180 : 45
  const travelTime = routeType === 'economical' ? '45 min' : '28 min'

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">{t('travel.title')}</h1>
          <p className="text-muted-foreground">
            Otimize sua rota por tempo ou por economia.
          </p>
        </div>

        <Card className="mb-8 shadow-lg border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Navigation className="h-5 w-5 text-primary" />
              Defina sua Rota
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-[1fr,auto,1fr] gap-4 items-end">
              <div className="space-y-2">
                <label className="text-sm font-medium">De onde?</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Origem"
                    className="pl-9"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                  />
                </div>
              </div>
              <div className="hidden md:flex pb-3 text-muted-foreground justify-center">
                <ArrowRight className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Para onde?</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Destino"
                    className="pl-9"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Preferência de Rota</label>
              <ToggleGroup
                type="single"
                value={routeType}
                onValueChange={(v) => v && setRouteType(v as any)}
                className="justify-start"
              >
                <ToggleGroupItem
                  value="fastest"
                  className="flex gap-2 px-4 py-2 border data-[state=on]:bg-blue-100 data-[state=on]:text-blue-800 data-[state=on]:border-blue-300"
                >
                  <Timer className="h-4 w-4" /> Mais Rápida
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="economical"
                  className="flex gap-2 px-4 py-2 border data-[state=on]:bg-green-100 data-[state=on]:text-green-800 data-[state=on]:border-green-300"
                >
                  <PiggyBank className="h-4 w-4" /> Maior Economia
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            <Button
              className="w-full"
              onClick={handlePlanRoute}
              disabled={!origin || !destination}
            >
              Calcular Rota
            </Button>
          </CardContent>
        </Card>

        {isRouteCalculated && (
          <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
            <div className="flex flex-col md:flex-row justify-between gap-4 bg-muted/30 p-4 rounded-xl border">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  {routeType === 'economical' ? (
                    <PiggyBank className="text-green-600" />
                  ) : (
                    <Timer className="text-blue-600" />
                  )}
                  Rota {routeType === 'economical' ? 'Econômica' : 'Expressa'}
                </h2>
                <div className="flex flex-wrap gap-4 mt-2">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Timer className="h-4 w-4" /> Tempo estimado:{' '}
                    <span className="font-bold text-foreground">
                      {travelTime}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-green-700 font-bold bg-green-100 px-2 py-0.5 rounded">
                    <Flame className="h-4 w-4" /> Economia estimada: R${' '}
                    {totalSavings},00
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={handleDownloadRoute}>
                  <Download className="mr-2 h-4 w-4" /> Baixar Rota
                </Button>
                <Button
                  onClick={toggleTravelMode}
                  variant={isTravelModeActive ? 'destructive' : 'default'}
                  className={isTravelModeActive ? 'animate-pulse' : ''}
                >
                  {isTravelModeActive ? (
                    <>
                      <StopCircle className="mr-2 h-4 w-4" /> Parar
                    </>
                  ) : (
                    <>
                      <PlayCircle className="mr-2 h-4 w-4" /> Iniciar
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="relative h-64 w-full rounded-xl overflow-hidden bg-slate-100 border shadow-inner">
              <img
                src="https://img.usecurling.com/p/1200/400?q=highway%20map&color=blue"
                alt="Route Map"
                className="w-full h-full object-cover opacity-80"
              />
              {/* Simplified Route Line Visualization */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <path
                  d="M 50,200 Q 400,50 1150,200"
                  fill="none"
                  stroke={routeType === 'economical' ? '#16a34a' : '#2563eb'}
                  strokeWidth="5"
                  strokeDasharray={routeType === 'economical' ? '0' : '10,5'}
                />
                {/* Savings Markers */}
                {routeType === 'economical' && (
                  <>
                    <circle cx="200" cy="150" r="8" fill="#16a34a" />
                    <circle cx="500" cy="100" r="8" fill="#16a34a" />
                    <circle cx="900" cy="160" r="8" fill="#16a34a" />
                  </>
                )}
              </svg>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {routeDeals.map((coupon, index) => (
                <div
                  key={coupon.id}
                  className="relative pl-8 border-l-2 border-dashed border-primary/30 pb-8 last:pb-0"
                >
                  <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-primary" />
                  <div className="mb-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Parada {index + 1}
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
