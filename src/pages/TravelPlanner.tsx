import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCouponStore } from '@/stores/CouponContext'
import { CouponCard } from '@/components/CouponCard'
import { MapPin, ArrowRight, Navigation } from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'

export default function TravelPlanner() {
  const { coupons } = useCouponStore()
  const { t } = useLanguage()
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [isRouteCalculated, setIsRouteCalculated] = useState(false)

  const handlePlanRoute = () => {
    if (origin && destination) {
      setIsRouteCalculated(true)
    }
  }

  // Mock deals along the route (randomly select few)
  const routeDeals = coupons.slice(0, 4)

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
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">
                Ofertas Encontradas no Caminho
              </h2>
              <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
                4 paradas sugeridas
              </span>
            </div>

            {/* Simulated Map View */}
            <div className="relative h-64 w-full rounded-xl overflow-hidden bg-slate-100 border shadow-inner">
              <img
                src="https://img.usecurling.com/p/1200/400?q=highway%20map&color=blue"
                alt="Route Map"
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg text-center">
                  <p className="font-bold text-primary">Rota Otimizada</p>
                  <p className="text-xs text-muted-foreground">
                    Economia estimada: R$ 125,00
                  </p>
                </div>
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
