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
  Leaf,
  Timer,
  PiggyBank,
  Download,
  Locate,
} from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'
import { useNotification } from '@/stores/NotificationContext'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'

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
      toast.success('Rota calculada com sucesso!')
    }
  }

  const toggleTravelMode = () => {
    setIsTravelModeActive(!isTravelModeActive)
    if (!isTravelModeActive) {
      toast.info('Navegação iniciada. Alertas de ofertas ativos.')
    } else {
      toast.info('Navegação encerrada.')
    }
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
            toast('Oferta Encontrada: Restaurante da Vila', {
              description: 'Desvie 200m para economizar R$ 15,00',
              action: { label: 'Ver', onClick: () => console.log('Navigate') },
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
      }, 8000)
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
          <Badge className="mb-2 bg-secondary text-white">
            Intelligent GPS
          </Badge>
          <h1 className="text-3xl font-bold mb-2">{t('travel.title')}</h1>
          <p className="text-muted-foreground">
            Otimize sua rota para máxima economia ou rapidez.
          </p>
        </div>

        <Card className="mb-8 shadow-lg border-primary/10">
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
                  <Locate className="absolute left-3 top-3 h-4 w-4 text-primary" />
                  <Input
                    placeholder="Sua localização"
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
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-red-500" />
                  <Input
                    placeholder="Destino final"
                    className="pl-9"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Modo de Viagem</label>
              <ToggleGroup
                type="single"
                value={routeType}
                onValueChange={(v) => v && setRouteType(v as any)}
                className="justify-start"
              >
                <ToggleGroupItem
                  value="fastest"
                  className="flex gap-2 px-4 py-2 border data-[state=on]:bg-secondary/10 data-[state=on]:text-secondary data-[state=on]:border-secondary transition-all"
                >
                  <Timer className="h-4 w-4" /> Mais Rápida
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="economical"
                  className="flex gap-2 px-4 py-2 border data-[state=on]:bg-accent/10 data-[state=on]:text-accent data-[state=on]:border-accent transition-all"
                >
                  <Leaf className="h-4 w-4" /> Rota Econômica
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            <Button
              className="w-full h-12 text-lg font-bold bg-primary hover:bg-primary/90"
              onClick={handlePlanRoute}
              disabled={!origin || !destination}
            >
              Calcular Melhor Rota
            </Button>
          </CardContent>
        </Card>

        {isRouteCalculated && (
          <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
            <div className="flex flex-col md:flex-row justify-between gap-4 bg-white p-6 rounded-xl border shadow-sm">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2 mb-2">
                  {routeType === 'economical' ? (
                    <Leaf className="text-accent" />
                  ) : (
                    <Timer className="text-secondary" />
                  )}
                  Rota {routeType === 'economical' ? 'Econômica' : 'Expressa'}
                </h2>
                <div className="flex flex-wrap gap-4 mt-2">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Timer className="h-4 w-4" /> Tempo:{' '}
                    <span className="font-bold text-foreground">
                      {travelTime}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-accent font-bold bg-accent/10 px-3 py-1 rounded-full border border-accent/20">
                    <PiggyBank className="h-4 w-4" /> Economia: R${' '}
                    {totalSavings},00
                  </div>
                </div>
              </div>

              <div className="flex gap-2 items-center">
                <Button
                  variant="outline"
                  onClick={handleDownloadRoute}
                  className="h-12 border-primary/20 text-primary hover:bg-primary/5"
                >
                  <Download className="mr-2 h-4 w-4" /> Baixar
                </Button>
                <Button
                  onClick={toggleTravelMode}
                  className={`h-12 px-6 font-bold ${isTravelModeActive ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-secondary hover:bg-secondary/90'}`}
                >
                  {isTravelModeActive ? (
                    <>
                      <StopCircle className="mr-2 h-5 w-5" /> Parar GPS
                    </>
                  ) : (
                    <>
                      <PlayCircle className="mr-2 h-5 w-5" /> Iniciar Navegação
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="relative h-80 w-full rounded-xl overflow-hidden bg-slate-100 border-2 border-white shadow-lg">
              <img
                src="https://img.usecurling.com/p/1200/400?q=gps%20navigation%20map&color=blue"
                alt="Route Map"
                className="w-full h-full object-cover opacity-90"
              />
              {/* Simplified Route Line Visualization */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-lg">
                <path
                  d="M 50,250 Q 400,50 1150,250"
                  fill="none"
                  stroke={routeType === 'economical' ? '#4CAF50' : '#2196F3'}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={routeType === 'economical' ? '0' : '15,10'}
                />
                {/* Savings Markers */}
                {routeType === 'economical' && (
                  <>
                    <circle
                      cx="200"
                      cy="180"
                      r="10"
                      fill="white"
                      stroke="#4CAF50"
                      strokeWidth="3"
                    />
                    <circle
                      cx="500"
                      cy="120"
                      r="10"
                      fill="white"
                      stroke="#4CAF50"
                      strokeWidth="3"
                    />
                    <circle
                      cx="900"
                      cy="190"
                      r="10"
                      fill="white"
                      stroke="#4CAF50"
                      strokeWidth="3"
                    />
                  </>
                )}
              </svg>
              {/* User Location Marker */}
              {isTravelModeActive && (
                <div className="absolute top-[60%] left-[10%] transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 bg-primary rounded-full ring-4 ring-white shadow-xl animate-ping absolute"></div>
                  <div className="w-4 h-4 bg-primary rounded-full ring-2 ring-white shadow-xl relative z-10"></div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <h3 className="md:col-span-2 font-bold text-lg text-muted-foreground mt-4">
                Paradas de Economia
              </h3>
              {routeDeals.map((coupon, index) => (
                <div
                  key={coupon.id}
                  className="relative pl-8 border-l-2 border-dashed border-accent/40 pb-8 last:pb-0"
                >
                  <div className="absolute -left-[11px] top-0 h-6 w-6 rounded-full bg-accent text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
                    {index + 1}
                  </div>
                  <CouponCard
                    coupon={coupon}
                    variant="horizontal"
                    className="h-auto"
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
