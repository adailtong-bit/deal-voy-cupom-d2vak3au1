import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useCouponStore } from '@/stores/CouponContext'
import { CouponCard } from '@/components/CouponCard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  MapPin,
  Navigation,
  Globe,
  LayoutList,
  Map as MapIcon,
  TentTree,
  Plane,
  Check,
  Share2,
  CalendarDays,
  AlertCircle,
} from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { SEASONAL_EVENTS } from '@/lib/data'
import { GoogleMap, MapMarker } from '@/components/GoogleMap'

// Known destinations for mock geocoding
const DESTINATIONS: Record<string, { lat: number; lng: number }> = {
  orlando: { lat: 28.5383, lng: -81.3792 },
  'sao paulo': { lat: -23.55052, lng: -46.633308 },
  miami: { lat: 25.7617, lng: -80.1918 },
  nyc: { lat: 40.7128, lng: -74.006 },
  paris: { lat: 48.8566, lng: 2.3522 },
}

export default function TravelPlanner() {
  const { coupons, tripIds, userLocation } = useCouponStore()
  const { t } = useLanguage()

  // State for View Mode: GPS (Current) vs Planned (Destination)
  const [navMode, setNavMode] = useState<'gps' | 'planned'>('gps')
  const [destination, setDestination] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewType, setViewType] = useState<'list' | 'map'>('list')
  const [activeTab, setActiveTab] = useState<'explore' | 'itinerary'>('explore')
  const [showEvents, setShowEvents] = useState(true)
  const [mapCenter, setMapCenter] = useState<{
    lat: number
    lng: number
  } | null>(null)

  // Determine current map center logic
  const currentCenter = useMemo(() => {
    if (navMode === 'planned' && mapCenter) return mapCenter
    if (navMode === 'gps' && userLocation)
      return { lat: userLocation.lat, lng: userLocation.lng }
    return { lat: -23.55052, lng: -46.633308 } // Fallback default
  }, [navMode, mapCenter, userLocation])

  // Mocking "Dynamic Offer Loading" based on destination
  // If destination includes "Orlando", we show specific coupons
  const destinationCoupons = useMemo(() => {
    if (!destination) return []
    if (destination.toLowerCase().includes('orlando')) {
      return coupons.filter((c) => c.id.startsWith('orl'))
    }
    return coupons.filter((c) => c.isTrending || c.isFeatured)
  }, [destination, coupons])

  const displayedCoupons = navMode === 'gps' ? coupons : destinationCoupons
  const tripCoupons = coupons.filter((c) => tripIds.includes(c.id))

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery) {
      setNavMode('planned')
      setDestination(searchQuery)
      setActiveTab('explore')

      // Simple mock geocoding
      const key = Object.keys(DESTINATIONS).find((k) =>
        searchQuery.toLowerCase().includes(k),
      )
      if (key) {
        setMapCenter(DESTINATIONS[key])
      } else {
        // If unknown, just keep current but show toast (in real app, use Geocoding API)
        toast.info(`Localizando ofertas em ${searchQuery}...`)
        // Fallback to random nearby shift for demo
        setMapCenter({
          lat: -23.55052 + Math.random() * 0.1,
          lng: -46.633308 + Math.random() * 0.1,
        })
      }
    }
  }

  const clearDestination = () => {
    setNavMode('gps')
    setDestination('')
    setSearchQuery('')
    setMapCenter(null)
  }

  const handleShare = async () => {
    const shareText = `Confira meu roteiro de viagem no Deal Voy com ${tripCoupons.length} paradas econômicas!`
    const shareUrl = window.location.href

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Meu Roteiro Deal Voy',
          text: shareText,
          url: shareUrl,
        })
        toast.success('Compartilhado com sucesso!')
      } catch (err) {
        console.error('Share failed:', err)
      }
    } else {
      navigator.clipboard.writeText(`${shareText} ${shareUrl}`)
      toast.success('Link copiado para a área de transferência!')
    }
  }

  // Convert coupons and events to map markers
  const mapMarkers: MapMarker[] = useMemo(() => {
    const markers: MapMarker[] = []

    displayedCoupons.forEach((coupon) => {
      if (coupon.coordinates) {
        markers.push({
          id: coupon.id,
          lat: coupon.coordinates.lat,
          lng: coupon.coordinates.lng,
          title: coupon.storeName,
          category: coupon.category,
          color: tripIds.includes(coupon.id) ? 'green' : 'orange',
          data: coupon,
        })
      }
    })

    if (showEvents) {
      SEASONAL_EVENTS.forEach((event) => {
        if (event.coordinates) {
          markers.push({
            id: `event-${event.id}`,
            lat: event.coordinates.lat,
            lng: event.coordinates.lng,
            title: event.title,
            category: 'Evento',
            color: 'blue',
            data: event,
          })
        }
      })
    }

    return markers
  }, [displayedCoupons, showEvents, tripIds])

  // Fallback content in case map fails (Static Image)
  const FallbackMap = (
    <div className="w-full h-full relative bg-slate-100">
      <img
        src={`https://img.usecurling.com/p/1200/800?q=map ${navMode === 'planned' ? destination : 'city'}&color=blue`}
        className="w-full h-full object-cover grayscale opacity-50"
        alt="Map"
      />
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-2 rounded shadow-sm text-xs z-10 flex items-center gap-2">
        <AlertCircle className="h-4 w-4" />
        <span>Modo de visualização estática (Chave de API ausente)</span>
      </div>
      {/* Simulate markers on static image */}
      {displayedCoupons.slice(0, 5).map((coupon, idx) => (
        <div
          key={coupon.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2"
          style={{
            top: `${20 + ((idx * 15) % 60)}%`,
            left: `${20 + ((idx * 20) % 60)}%`,
          }}
        >
          <div
            className={cn(
              'p-1.5 rounded-full shadow-lg',
              tripIds.includes(coupon.id) ? 'bg-green-500' : 'bg-orange-500',
            )}
          >
            <div className="h-2 w-2 bg-white rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="flex flex-col h-[calc(100vh-64px-64px)] md:h-[calc(100vh-64px)] overflow-hidden bg-slate-50">
      {/* Header & Controls Area */}
      <div className="bg-white border-b z-20 shadow-sm flex-shrink-0">
        <div className="container mx-auto px-4 py-4 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2 text-[#2196F3]">
                <Plane className="h-6 w-6" /> {t('travel.title')}
              </h1>
              <p className="text-sm text-muted-foreground hidden md:block">
                Planeje sua economia, não importa onde você esteja.
              </p>
            </div>

            {/* Dual-Mode Toggle */}
            <div className="bg-slate-100 p-1 rounded-lg inline-flex">
              <button
                onClick={clearDestination}
                className={cn(
                  'px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2',
                  navMode === 'gps'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Navigation className="h-4 w-4" /> GPS Atual
              </button>
              <button
                onClick={() => setNavMode('planned')}
                className={cn(
                  'px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2',
                  navMode === 'planned'
                    ? 'bg-[#2196F3] text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Globe className="h-4 w-4" /> Planejar Destino
              </button>
            </div>
          </div>

          {/* Destination Search Bar */}
          <div
            className={cn(
              'relative transition-all duration-300',
              navMode === 'planned'
                ? 'opacity-100 translate-y-0'
                : 'opacity-100',
            )}
          >
            <form
              onSubmit={handleSearch}
              className="relative max-w-2xl mx-auto"
            >
              <MapPin className="absolute left-4 top-3.5 h-5 w-5 text-[#FF5722]" />
              <Input
                placeholder="Para onde você vai? (Ex: Orlando, FL)"
                className={cn(
                  'pl-12 h-12 rounded-full text-base border-2 focus-visible:ring-offset-0',
                  navMode === 'planned'
                    ? 'border-[#2196F3] bg-blue-50/50'
                    : 'border-slate-200',
                )}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button
                type="submit"
                className="absolute right-1.5 top-1.5 h-9 rounded-full bg-[#FF5722] hover:bg-[#F4511E] text-white font-bold px-6"
              >
                Buscar
              </Button>
            </form>
            {navMode === 'planned' && destination && (
              <div className="flex justify-center mt-2">
                <Badge
                  variant="outline"
                  className="gap-2 bg-blue-50 text-[#2196F3] border-blue-200 px-3 py-1"
                >
                  Exibindo ofertas para:{' '}
                  <span className="font-bold">{destination}</span>
                  <button
                    onClick={clearDestination}
                    className="ml-1 hover:text-red-500"
                  >
                    ✕
                  </button>
                </Badge>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden relative container mx-auto px-0 md:px-4 py-0 md:py-4">
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as any)}
          className="h-full flex flex-col"
        >
          <div className="px-4 py-2 bg-white md:bg-transparent md:p-0 flex justify-center flex-shrink-0">
            <TabsList className="bg-slate-200 p-1">
              <TabsTrigger
                value="explore"
                className="px-6 gap-2 data-[state=active]:bg-white data-[state=active]:text-[#2196F3]"
              >
                <TentTree className="h-4 w-4" /> Explorar{' '}
                {navMode === 'planned' ? 'Destino' : 'Local'}
              </TabsTrigger>
              <TabsTrigger
                value="itinerary"
                className="px-6 gap-2 data-[state=active]:bg-white data-[state=active]:text-[#4CAF50]"
              >
                <LayoutList className="h-4 w-4" /> Meu Roteiro ({tripIds.length}
                )
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent
            value="explore"
            className="flex-1 overflow-hidden mt-0 data-[state=active]:flex flex-col"
          >
            <div className="flex items-center justify-between px-4 py-2 md:hidden bg-white border-b">
              <span className="text-xs text-muted-foreground">
                {displayedCoupons.length} ofertas encontradas
              </span>
              <div className="flex gap-1">
                <Button
                  variant={viewType === 'list' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewType('list')}
                  className="h-8 w-8 p-0"
                >
                  <LayoutList className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewType === 'map' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewType('map')}
                  className="h-8 w-8 p-0"
                >
                  <MapIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex-1 relative flex overflow-hidden md:rounded-xl md:border md:shadow-sm md:bg-white">
              {/* List View */}
              <div
                className={cn(
                  'w-full md:w-[400px] lg:w-[450px] bg-white flex flex-col absolute md:relative inset-0 z-10 transition-transform duration-300 md:translate-x-0 md:border-r shadow-lg md:shadow-none',
                  viewType === 'map' ? 'translate-x-[-100%]' : 'translate-x-0',
                )}
              >
                <div className="p-2 border-b flex items-center justify-between bg-slate-50">
                  <h3 className="font-semibold text-sm px-2">
                    {t('travel.events')}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => setShowEvents(!showEvents)}
                  >
                    {showEvents ? 'Ocultar' : 'Mostrar'}
                  </Button>
                </div>
                <ScrollArea className="flex-1">
                  <div className="p-4 space-y-4">
                    {showEvents &&
                      SEASONAL_EVENTS.filter((e) => e.coordinates).map(
                        (event) => (
                          <Card
                            key={`event-${event.id}`}
                            className="border-l-4 border-l-purple-500 bg-purple-50/30"
                          >
                            <CardContent className="p-3">
                              <div className="flex gap-3">
                                <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
                                  <CalendarDays className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                  <h4 className="font-bold text-sm">
                                    {event.title}
                                  </h4>
                                  <p className="text-xs text-muted-foreground line-clamp-2">
                                    {event.description}
                                  </p>
                                  <p className="text-xs font-medium text-purple-600 mt-1">
                                    {event.date.toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ),
                      )}

                    {displayedCoupons.length > 0 ? (
                      displayedCoupons.map((coupon) => (
                        <CouponCard
                          key={coupon.id}
                          coupon={coupon}
                          variant="horizontal"
                          className="h-auto"
                        />
                      ))
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <p>Nenhuma oferta encontrada nesta região.</p>
                        {navMode === 'planned' && (
                          <Button variant="link" onClick={clearDestination}>
                            Voltar ao GPS atual
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>

              {/* Map View - Interactive Google Map */}
              <div
                className={cn(
                  'flex-1 bg-slate-100 relative absolute md:relative inset-0 transition-transform duration-300 md:translate-x-0',
                  viewType === 'list'
                    ? 'translate-x-[100%] md:translate-x-0'
                    : 'translate-x-0',
                )}
              >
                <GoogleMap
                  center={currentCenter}
                  zoom={navMode === 'planned' ? 12 : 14}
                  markers={mapMarkers}
                  className="w-full h-full"
                  fallback={FallbackMap}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent
            value="itinerary"
            className="flex-1 overflow-hidden mt-0 data-[state=active]:flex flex-col"
          >
            <div className="flex-1 container max-w-4xl mx-auto md:py-6">
              <Card className="h-full flex flex-col shadow-none md:shadow-sm border-0 md:border bg-white">
                <CardContent className="p-0 flex-1 flex flex-col">
                  <div className="p-6 bg-[#4CAF50]/10 border-b border-[#4CAF50]/20 flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-bold flex items-center gap-2 text-[#2e7d32]">
                        <LayoutList className="h-6 w-6" /> Meu Roteiro de
                        Economia
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        {tripCoupons.length} cupons salvos para sua viagem.
                      </p>
                    </div>
                    {tripCoupons.length > 0 && (
                      <Button
                        onClick={handleShare}
                        className="bg-[#4CAF50] hover:bg-[#43A047] gap-2"
                      >
                        <Share2 className="h-4 w-4" /> Compartilhar
                      </Button>
                    )}
                  </div>

                  <ScrollArea className="flex-1">
                    <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {tripCoupons.length > 0 ? (
                        tripCoupons.map((coupon) => (
                          <CouponCard key={coupon.id} coupon={coupon} />
                        ))
                      ) : (
                        <div className="col-span-full flex flex-col items-center justify-center py-20 text-center opacity-70">
                          <TentTree className="h-16 w-16 text-slate-300 mb-4" />
                          <h3 className="text-lg font-semibold mb-2">
                            Seu roteiro está vazio
                          </h3>
                          <p className="text-sm text-muted-foreground max-w-xs mb-6">
                            Explore ofertas e clique em "Add Trip" para
                            organizar sua viagem.
                          </p>
                          <Button
                            onClick={() => setActiveTab('explore')}
                            className="bg-[#FF5722] hover:bg-[#F4511E]"
                          >
                            Explorar Ofertas
                          </Button>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
