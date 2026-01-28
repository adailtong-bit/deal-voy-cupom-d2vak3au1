import { useState, useMemo, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useCouponStore } from '@/stores/CouponContext'
import { CouponCard } from '@/components/CouponCard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Navigation,
  Map as MapIcon,
  TentTree,
  Plane,
  CalendarDays,
  Download,
  Search,
  Plus,
  Save,
  Trash2,
  Utensils,
  Moon,
  Sun,
  MapPin,
  Share2,
} from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { GoogleMap, MapMarker } from '@/components/GoogleMap'
import { DayPlan, Itinerary, Coupon } from '@/lib/types'
import { AdSpace } from '@/components/AdSpace'
import { AggregatorFeed } from '@/components/AggregatorFeed'
import { Label } from '@/components/ui/label'

const DESTINATIONS: Record<string, { lat: number; lng: number }> = {
  orlando: { lat: 28.5383, lng: -81.3792 },
  'sao paulo': { lat: -23.55052, lng: -46.633308 },
  miami: { lat: 25.7617, lng: -80.1918 },
  nyc: { lat: 40.7128, lng: -74.006 },
  paris: { lat: 48.8566, lng: 2.3522 },
}

export default function TravelPlanner() {
  const { coupons, userLocation, saveItinerary, itineraries, user } =
    useCouponStore()
  const { t } = useLanguage()

  const [activeTab, setActiveTab] = useState<'planner' | 'saved'>('planner')
  const [navMode, setNavMode] = useState<'gps' | 'planned'>('gps')

  // Route State
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [showRoute, setShowRoute] = useState(false)

  // Multi-day State
  const [currentDay, setCurrentDay] = useState(1)
  const [days, setDays] = useState<DayPlan[]>(
    Array.from({ length: 10 }).map((_, i) => ({
      id: `day${i + 1}`,
      dayNumber: i + 1,
      stops: [],
    })),
  )
  const [planTitle, setPlanTitle] = useState('Minha Viagem - 10 Dias')
  const [isAgentMode, setIsAgentMode] = useState(false)

  // Map Center State
  const [mapCenter, setMapCenter] = useState<{
    lat: number
    lng: number
  } | null>(null)

  // Time Sensitive Logic
  const currentHour = new Date().getHours()
  const isLunchTime = currentHour >= 11 && currentHour <= 14
  const isDinnerTime = currentHour >= 18 && currentHour <= 21

  // Initialize with some mock data if empty for demo purposes
  useEffect(() => {
    // Optional: Load saved draft logic here
  }, [])

  const currentCenter = useMemo(() => {
    if (navMode === 'planned' && mapCenter) return mapCenter
    if (navMode === 'gps' && userLocation)
      return { lat: userLocation.lat, lng: userLocation.lng }
    // Default fallback (e.g. Orlando for demo)
    return { lat: 28.5383, lng: -81.3792 }
  }, [navMode, mapCenter, userLocation])

  const handleRouteSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (origin && destination) {
      setNavMode('planned')
      setShowRoute(true)

      // Attempt to center map on destination
      const key = Object.keys(DESTINATIONS).find((k) =>
        destination.toLowerCase().includes(k),
      )
      if (key) {
        setMapCenter(DESTINATIONS[key])
      } else {
        // Generic fallback for search demo
        setMapCenter({ lat: 28.5383, lng: -81.3792 })
      }

      toast.info('Calculando rota otimizada...')
    }
  }

  const addToDay = (coupon: Coupon) => {
    setDays((prev) =>
      prev.map((day) => {
        if (day.dayNumber === currentDay) {
          if (day.stops.find((s) => s.id === coupon.id)) {
            toast.info('Item já adicionado a este dia.')
            return day
          }
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

  const handleSavePlan = () => {
    const totalSavings = days.reduce(
      (acc, day) =>
        acc + day.stops.reduce((dAcc, s) => dAcc + (s.price || 10), 0), // Mock savings calc
      0,
    )

    const allStops = days.flatMap((d) => d.stops)

    if (allStops.length === 0) {
      toast.error('Adicione pelo menos um item ao roteiro.')
      return
    }

    const newItinerary: Itinerary = {
      id: Math.random().toString(),
      title: planTitle,
      description: `Roteiro de ${days.length} dias com ${allStops.length} paradas.`,
      stops: allStops,
      days: days,
      totalSavings,
      duration: `${days.length} Dias`,
      image:
        allStops[0]?.image || 'https://img.usecurling.com/p/600/300?q=travel',
      tags: ['Personalizado'],
      matchScore: 100,
      isTemplate: isAgentMode,
    }

    saveItinerary(newItinerary)
  }

  const handleShare = (it: Itinerary) => {
    navigator.clipboard.writeText(
      `${window.location.origin}/itinerary/${it.id}`,
    )
    toast.success('Link do roteiro copiado!', {
      description: 'Envie para seus amigos para colaborarem.',
    })
  }

  // Get current day's stops for map highlighting
  const currentDayStops = useMemo(() => {
    return days.find((d) => d.dayNumber === currentDay)?.stops || []
  }, [days, currentDay])

  // Generate markers for the map
  const mapMarkers: MapMarker[] = useMemo(() => {
    return currentDayStops.map((stop) => ({
      id: stop.id,
      lat: stop.coordinates.lat,
      lng: stop.coordinates.lng,
      title: stop.storeName,
      category: stop.category,
      color: 'blue',
      highlight: true,
    }))
  }, [currentDayStops])

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50">
      <div className="flex-1 flex overflow-hidden flex-col md:flex-row">
        {/* Sidebar - Planner Controls */}
        <div className="w-full md:w-[380px] bg-white border-r flex flex-col z-20 shadow-xl overflow-hidden shrink-0">
          <div className="p-4 border-b bg-primary/5">
            <h1 className="text-xl font-bold flex items-center gap-2 text-primary">
              <Plane className="h-6 w-6" /> {t('travel.title')}
            </h1>
            <div className="flex gap-2 mt-3">
              <Button
                variant={activeTab === 'planner' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('planner')}
                className="flex-1 font-bold"
              >
                Planejar
              </Button>
              <Button
                variant={activeTab === 'saved' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('saved')}
                className="flex-1 font-bold"
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
                      className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
                    >
                      <Search className="h-4 w-4" /> {t('travel.optimize')}
                    </Button>
                  </div>

                  {/* Day Planner */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Input
                        value={planTitle}
                        onChange={(e) => setPlanTitle(e.target.value)}
                        className="font-bold text-lg border-none px-0 shadow-none focus-visible:ring-0 bg-transparent h-auto py-1"
                      />
                      {user?.role === 'admin' && (
                        <div className="flex items-center gap-1 bg-purple-50 px-2 py-1 rounded border border-purple-100">
                          <input
                            type="checkbox"
                            id="agent-mode"
                            checked={isAgentMode}
                            onChange={(e) => setIsAgentMode(e.target.checked)}
                            className="accent-purple-600"
                          />
                          <Label
                            htmlFor="agent-mode"
                            className="text-[10px] text-purple-700 font-bold cursor-pointer"
                          >
                            Agent
                          </Label>
                        </div>
                      )}
                    </div>

                    <Tabs
                      value={`day${currentDay}`}
                      onValueChange={(v) =>
                        setCurrentDay(parseInt(v.replace('day', '')))
                      }
                    >
                      <ScrollArea className="w-full whitespace-nowrap pb-2">
                        <TabsList className="h-9">
                          {days.map((d) => (
                            <TabsTrigger
                              key={d.id}
                              value={d.id}
                              className="text-xs px-2"
                            >
                              {t('travel.day')} {d.dayNumber}
                            </TabsTrigger>
                          ))}
                        </TabsList>
                      </ScrollArea>

                      {days.map((day) => (
                        <TabsContent
                          key={day.id}
                          value={day.id}
                          className="mt-2 space-y-3 min-h-[100px]"
                        >
                          {day.stops.length === 0 ? (
                            <div className="text-center py-6 border-2 border-dashed rounded-lg text-muted-foreground text-sm bg-slate-50">
                              <p className="font-medium">
                                Dia {day.dayNumber} Livre
                              </p>
                              <p className="text-xs mt-1">
                                Adicione ofertas do feed ao lado.
                              </p>
                            </div>
                          ) : (
                            day.stops.map((stop, idx) => (
                              <div
                                key={`${stop.id}-${idx}`}
                                className="relative group bg-white rounded-lg border shadow-sm p-2 flex gap-3 items-center"
                              >
                                <div className="bg-primary text-white text-xs h-6 w-6 rounded-full flex items-center justify-center font-bold shrink-0">
                                  {idx + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-bold text-sm truncate">
                                    {stop.storeName}
                                  </h4>
                                  <p className="text-xs text-muted-foreground truncate">
                                    {stop.title}
                                  </p>
                                  {stop.category === 'Alimentação' &&
                                    (isLunchTime || isDinnerTime) && (
                                      <span className="text-[10px] text-orange-600 font-bold flex items-center gap-1">
                                        <Utensils className="h-3 w-3" /> Horário
                                        de Comer!
                                      </span>
                                    )}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-red-500 hover:bg-red-50"
                                  onClick={() =>
                                    removeFromDay(day.dayNumber, stop.id)
                                  }
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            ))
                          )}
                        </TabsContent>
                      ))}
                    </Tabs>

                    <Button
                      className="w-full gap-2 bg-[#4CAF50] hover:bg-[#43A047] font-bold"
                      onClick={handleSavePlan}
                    >
                      <Save className="h-4 w-4" />{' '}
                      {isAgentMode
                        ? t('travel.save_template')
                        : 'Salvar Roteiro'}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  {itineraries.map((it) => (
                    <Card
                      key={it.id}
                      className="cursor-pointer hover:shadow-md transition-all group relative"
                    >
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute top-2 right-2 h-8 w-8 bg-white/50 hover:bg-white z-10"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleShare(it)
                        }}
                      >
                        <Share2 className="h-4 w-4 text-primary" />
                      </Button>
                      <CardContent className="p-4 flex gap-4">
                        <img
                          src={it.image}
                          className="w-20 h-20 rounded-md object-cover"
                          alt=""
                        />
                        <div>
                          <h4 className="font-bold group-hover:text-primary transition-colors">
                            {it.title}
                          </h4>
                          <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                            <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">
                              {it.duration}
                            </span>
                            {it.isTemplate && (
                              <span className="bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-medium">
                                Oficial
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
                  {itineraries.length === 0 && (
                    <p className="text-center text-muted-foreground text-sm py-8">
                      Nenhum roteiro salvo.
                    </p>
                  )}
                </div>
              )}
            </div>

            <AdSpace className="mt-4" />
          </ScrollArea>
        </div>

        {/* Center - Map Area */}
        <div className="flex-1 relative flex flex-col min-h-[300px]">
          <GoogleMap
            center={currentCenter}
            zoom={navMode === 'planned' ? 12 : 14}
            markers={mapMarkers}
            className="flex-1"
            origin={showRoute ? origin : undefined}
            destination={showRoute ? destination : undefined}
          />

          {/* Map Overlay Context */}
          <div className="absolute top-4 left-4 right-4 md:left-auto md:right-4 bg-white/95 backdrop-blur p-3 rounded-lg shadow-lg z-10 max-w-sm border-l-4 border-l-orange-500">
            <div className="flex items-center gap-2 mb-1">
              {currentHour >= 18 ? (
                <Moon className="h-4 w-4 text-blue-900" />
              ) : (
                <Sun className="h-4 w-4 text-orange-500" />
              )}
              <span className="font-bold text-sm">
                {currentHour >= 18 ? 'Noite em' : 'Dia em'}{' '}
                {destination || 'Orlando'}
              </span>
            </div>
            <p className="text-xs text-slate-600">
              {isLunchTime || isDinnerTime
                ? 'Hora de comer! Confira as ofertas de restaurantes no feed.'
                : 'Explore ofertas ao longo da sua rota no feed.'}
            </p>
          </div>
        </div>

        {/* Right Sidebar - Global Deal Aggregator Feed */}
        <div className="w-full md:w-[320px] bg-white border-l z-20 shadow-xl overflow-hidden shrink-0 h-1/2 md:h-full">
          <AggregatorFeed coupons={coupons} onAddToItinerary={addToDay} />
        </div>
      </div>
    </div>
  )
}
