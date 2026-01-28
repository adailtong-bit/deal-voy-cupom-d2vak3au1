import { useState, useMemo, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useCouponStore } from '@/stores/CouponContext'
import { CouponCard } from '@/components/CouponCard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Navigation,
  Globe,
  LayoutList,
  Map as MapIcon,
  TentTree,
  Plane,
  Share2,
  CalendarDays,
  AlertCircle,
  Download,
  Check,
  MapPin,
  Loader2,
  Plus,
  Save,
  Briefcase,
  Search,
} from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { SEASONAL_EVENTS } from '@/lib/data'
import { GoogleMap, MapMarker } from '@/components/GoogleMap'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { DayPlan, Itinerary, Coupon } from '@/lib/types'
import { AdSpace } from '@/components/AdSpace'

const DESTINATIONS: Record<string, { lat: number; lng: number }> = {
  orlando: { lat: 28.5383, lng: -81.3792 },
  'sao paulo': { lat: -23.55052, lng: -46.633308 },
  miami: { lat: 25.7617, lng: -80.1918 },
  nyc: { lat: 40.7128, lng: -74.006 },
  paris: { lat: 48.8566, lng: 2.3522 },
}

export default function TravelPlanner() {
  const {
    coupons,
    userLocation,
    downloadOffline,
    isDownloading,
    downloadProgress,
    saveItinerary,
    itineraries,
    user,
  } = useCouponStore()
  const { t } = useLanguage()

  const [navMode, setNavMode] = useState<'gps' | 'planned'>('gps')
  const [activeTab, setActiveTab] = useState<'planner' | 'saved'>('planner')
  const [searchQuery, setSearchQuery] = useState('')

  // Route State
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [routeStops, setRouteStops] = useState<string[]>([])
  const [showRoute, setShowRoute] = useState(false)

  // Multi-day State
  const [currentDay, setCurrentDay] = useState(1)
  const [days, setDays] = useState<DayPlan[]>([
    { id: 'day1', dayNumber: 1, stops: [] },
  ])
  const [planTitle, setPlanTitle] = useState('Minha Viagem')
  const [isAgentMode, setIsAgentMode] = useState(false)
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null)

  // Map Center State
  const [mapCenter, setMapCenter] = useState<{
    lat: number
    lng: number
  } | null>(null)

  // Time Sensitive Logic
  const currentHour = new Date().getHours()
  const isLunchTime = currentHour >= 11 && currentHour <= 14
  const isDinnerTime = currentHour >= 18 && currentHour <= 21

  const currentCenter = useMemo(() => {
    if (navMode === 'planned' && mapCenter) return mapCenter
    if (navMode === 'gps' && userLocation)
      return { lat: userLocation.lat, lng: userLocation.lng }
    return { lat: -23.55052, lng: -46.633308 }
  }, [navMode, mapCenter, userLocation])

  // Mock "Along Route" filtering
  // In a real app, calculate distance from polyline. Here, filter by bounding box of start/end or destination city
  const filteredCoupons = useMemo(() => {
    if (navMode === 'gps') return coupons

    if (destination.toLowerCase().includes('orlando')) {
      return coupons.filter((c) => c.id.startsWith('orl'))
    }

    // Fallback: show popular
    return coupons.filter((c) => c.isFeatured || c.isTrending)
  }, [navMode, destination, coupons])

  const handleRouteSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (origin && destination) {
      setNavMode('planned')
      setShowRoute(true)

      // Attempt to center map on destination
      const key = Object.keys(DESTINATIONS).find((k) =>
        destination.toLowerCase().includes(k),
      )
      if (key) setMapCenter(DESTINATIONS[key])

      toast.info('Calculando rota otimizada...')
    }
  }

  const addToDay = (coupon: Coupon) => {
    setDays((prev) =>
      prev.map((day) => {
        if (day.dayNumber === currentDay) {
          if (day.stops.find((s) => s.id === coupon.id)) return day
          toast.success(`Adicionado ao Dia ${currentDay}`)
          return { ...day, stops: [...day.stops, coupon] }
        }
        return day
      }),
    )
  }

  const removeFromDay = (dayNum: number, couponId: string) => {
    setDays((prev) =>
      prev.map((day) => {
        if (day.dayNumber === dayNum) {
          return { ...day, stops: day.stops.filter((s) => s.id !== couponId) }
        }
        return day
      }),
    )
  }

  const addNewDay = () => {
    const nextDay = days.length + 1
    setDays([...days, { id: `day${nextDay}`, dayNumber: nextDay, stops: [] }])
    setCurrentDay(nextDay)
  }

  const handleSavePlan = () => {
    const totalSavings = days.reduce(
      (acc, day) =>
        acc + day.stops.reduce((dAcc, s) => dAcc + (s.price || 10), 0), // Mock savings calc
      0,
    )

    const newItinerary: Itinerary = {
      id: Math.random().toString(),
      title: planTitle,
      description: `Roteiro de ${days.length} dias`,
      stops: days.flatMap((d) => d.stops),
      days: days,
      totalSavings,
      duration: `${days.length} Dias`,
      image:
        days[0]?.stops[0]?.image ||
        'https://img.usecurling.com/p/600/300?q=travel',
      tags: ['Personalizado'],
      matchScore: 100,
      isTemplate: isAgentMode,
    }

    saveItinerary(newItinerary)
  }

  const handleOfflineSave = () => {
    const allIds = days.flatMap((d) => d.stops.map((s) => s.id))
    if (allIds.length === 0) return toast.error('Adicione paradas primeiro')
    downloadOffline(allIds)
  }

  const mapMarkers: MapMarker[] = useMemo(() => {
    const markers: MapMarker[] = []

    filteredCoupons.forEach((coupon) => {
      if (coupon.coordinates) {
        const isFood = coupon.category === 'Alimentação'
        // Highlight based on time
        const highlight = (isLunchTime || isDinnerTime) && isFood

        markers.push({
          id: coupon.id,
          lat: coupon.coordinates.lat,
          lng: coupon.coordinates.lng,
          title: coupon.storeName,
          category: coupon.category,
          color: days.some((d) => d.stops.some((s) => s.id === coupon.id))
            ? 'green'
            : 'orange',
          data: coupon,
          highlight,
        })
      }
    })

    return markers
  }, [filteredCoupons, days, isLunchTime, isDinnerTime])

  const FallbackMap = (
    <div className="w-full h-full relative bg-slate-100 group overflow-hidden">
      <img
        src={`https://img.usecurling.com/p/1200/800?q=map ${navMode === 'planned' ? destination : 'city'}&color=blue`}
        className="w-full h-full object-cover grayscale opacity-50 transition-opacity duration-700"
        alt="Map"
      />
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-2 rounded shadow-sm text-xs z-10 flex items-center gap-2">
        <AlertCircle className="h-4 w-4" />
        <span>Modo Visualização Simplificada (API Key ausente)</span>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50">
      <Dialog open={isDownloading}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('travel.save_offline')}</DialogTitle>
            <DialogDescription>
              Baixando mapas e imagens para acesso sem internet...
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <Progress value={downloadProgress} className="h-3" />
            <p className="text-xs text-center text-muted-foreground">
              {downloadProgress}% Completo
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-full md:w-[400px] bg-white border-r flex flex-col z-10 shadow-xl overflow-hidden">
          <div className="p-4 border-b bg-primary/5">
            <h1 className="text-xl font-bold flex items-center gap-2 text-primary">
              <Plane className="h-6 w-6" /> {t('travel.title')}
            </h1>
            <div className="flex gap-2 mt-3">
              <Button
                variant={activeTab === 'planner' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('planner')}
                className="flex-1"
              >
                Planejar
              </Button>
              <Button
                variant={activeTab === 'saved' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('saved')}
                className="flex-1"
              >
                Meus Roteiros
              </Button>
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-4 space-y-6">
              {activeTab === 'planner' ? (
                <>
                  {/* Route Input */}
                  <div className="space-y-3 bg-slate-50 p-4 rounded-lg border">
                    <Label className="text-xs uppercase text-muted-foreground font-bold">
                      {t('travel.calculate_route')}
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-green-500" />
                      <Input
                        placeholder={t('travel.origin')}
                        className="pl-9 bg-white"
                        value={origin}
                        onChange={(e) => setOrigin(e.target.value)}
                      />
                    </div>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-red-500" />
                      <Input
                        placeholder={t('travel.destination')}
                        className="pl-9 bg-white"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                      />
                    </div>
                    <Button
                      onClick={handleRouteSearch}
                      className="w-full gap-2"
                    >
                      <Search className="h-4 w-4" /> {t('travel.optimize')}
                    </Button>
                  </div>

                  {/* Day Planner */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold flex items-center gap-2">
                        <CalendarDays className="h-5 w-5 text-primary" /> Seu
                        Roteiro
                      </h3>
                      {user?.role === 'admin' && (
                        <div className="flex items-center gap-2">
                          <Label htmlFor="agent-mode" className="text-xs">
                            Agent Mode
                          </Label>
                          <input
                            type="checkbox"
                            id="agent-mode"
                            checked={isAgentMode}
                            onChange={(e) => setIsAgentMode(e.target.checked)}
                          />
                        </div>
                      )}
                    </div>

                    <Input
                      value={planTitle}
                      onChange={(e) => setPlanTitle(e.target.value)}
                      className="font-bold text-lg border-none px-0 shadow-none focus-visible:ring-0"
                    />

                    <Tabs
                      value={`day${currentDay}`}
                      onValueChange={(v) =>
                        setCurrentDay(parseInt(v.replace('day', '')))
                      }
                    >
                      <ScrollArea className="w-full whitespace-nowrap pb-2">
                        <TabsList>
                          {days.map((d) => (
                            <TabsTrigger key={d.id} value={d.id}>
                              {t('travel.day')} {d.dayNumber}
                            </TabsTrigger>
                          ))}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={addNewDay}
                            className="h-7 px-2 ml-1"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </TabsList>
                      </ScrollArea>

                      {days.map((day) => (
                        <TabsContent
                          key={day.id}
                          value={day.id}
                          className="mt-2 space-y-3"
                        >
                          {day.stops.length === 0 ? (
                            <div className="text-center py-8 border-2 border-dashed rounded-lg text-muted-foreground text-sm">
                              Adicione paradas clicando no mapa
                            </div>
                          ) : (
                            day.stops.map((stop, idx) => (
                              <div
                                key={`${stop.id}-${idx}`}
                                className="relative group"
                              >
                                <div className="absolute left-[-12px] top-6 w-0.5 h-full bg-slate-200" />
                                <div className="flex gap-2">
                                  <div className="mt-1 bg-primary text-white text-[10px] h-5 w-5 rounded-full flex items-center justify-center font-bold z-10 ring-2 ring-white">
                                    {idx + 1}
                                  </div>
                                  <div className="flex-1">
                                    <CouponCard
                                      coupon={stop}
                                      variant="horizontal"
                                      className="h-auto"
                                    />
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80"
                                      onClick={() =>
                                        removeFromDay(day.dayNumber, stop.id)
                                      }
                                    >
                                      ✕
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </TabsContent>
                      ))}
                    </Tabs>

                    <div className="flex gap-2 pt-4">
                      <Button
                        className="flex-1 gap-2"
                        variant="outline"
                        onClick={handleOfflineSave}
                      >
                        <Download className="h-4 w-4" /> Offline
                      </Button>
                      <Button
                        className="flex-1 gap-2 bg-[#4CAF50] hover:bg-[#43A047]"
                        onClick={handleSavePlan}
                      >
                        <Save className="h-4 w-4" />{' '}
                        {isAgentMode ? t('travel.save_template') : 'Salvar'}
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  {itineraries.map((it) => (
                    <Card
                      key={it.id}
                      className="cursor-pointer hover:shadow-md transition-all"
                    >
                      <CardContent className="p-4 flex gap-4">
                        <img
                          src={it.image}
                          className="w-20 h-20 rounded-md object-cover"
                          alt=""
                        />
                        <div>
                          <h4 className="font-bold">{it.title}</h4>
                          <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                            <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                              {it.duration}
                            </span>
                            {it.isTemplate && (
                              <span className="bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">
                                Template
                              </span>
                            )}
                          </div>
                          <p className="text-xs mt-2 line-clamp-2">
                            {it.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <AdSpace className="mt-4" />
          </ScrollArea>
        </div>

        {/* Map Area */}
        <div className="flex-1 relative hidden md:block">
          <GoogleMap
            center={currentCenter}
            zoom={navMode === 'planned' ? 12 : 14}
            markers={mapMarkers}
            className="w-full h-full"
            origin={showRoute ? origin : undefined}
            destination={showRoute ? destination : undefined}
            fallback={FallbackMap}
            onMarkerClick={(m) => {
              if (m.data) {
                // In a real implementation this would open a side panel or modal
                toast(m.title, {
                  description: m.data.discount,
                  action: {
                    label: 'Adicionar',
                    onClick: () => addToDay(m.data),
                  },
                })
              }
            }}
          />

          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur p-2 rounded-lg shadow-lg max-w-xs z-10">
            <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
              <TentTree className="h-4 w-4 text-green-600" /> Discovery
            </h4>
            <p className="text-xs text-muted-foreground mb-2">
              Ofertas próximas à sua rota.
              {(isLunchTime || isDinnerTime) && (
                <span className="block text-orange-600 font-bold mt-1 animate-pulse">
                  🍽 Hora de comer! Restaurantes destacados.
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
