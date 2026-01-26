import { useState, useMemo } from 'react'
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
} from '@/components/ui/dialog'

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
    tripIds,
    userLocation,
    downloadOffline,
    downloadedIds,
    isDownloading,
    downloadProgress,
  } = useCouponStore()
  const { t } = useLanguage()

  const [navMode, setNavMode] = useState<'gps' | 'planned'>('gps')
  const [destination, setDestination] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewType, setViewType] = useState<'list' | 'map'>('map')
  const [activeTab, setActiveTab] = useState<'explore' | 'itinerary'>('explore')
  const [showEvents, setShowEvents] = useState(true)
  const [mapCenter, setMapCenter] = useState<{
    lat: number
    lng: number
  } | null>(null)

  const currentCenter = useMemo(() => {
    if (navMode === 'planned' && mapCenter) return mapCenter
    if (navMode === 'gps' && userLocation)
      return { lat: userLocation.lat, lng: userLocation.lng }
    return { lat: -23.55052, lng: -46.633308 }
  }, [navMode, mapCenter, userLocation])

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

      const key = Object.keys(DESTINATIONS).find((k) =>
        searchQuery.toLowerCase().includes(k),
      )
      if (key) {
        setMapCenter(DESTINATIONS[key])
      } else {
        toast.info(`${t('home.detecting_location')} ${searchQuery}...`)
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
          title: t('travel.itinerary_title'),
          text: shareText,
          url: shareUrl,
        })
        toast.success(t('common.share'))
      } catch (err) {
        console.error('Share failed:', err)
      }
    } else {
      navigator.clipboard.writeText(`${shareText} ${shareUrl}`)
      toast.success(t('common.share'))
    }
  }

  const handleDownloadOffline = () => {
    if (tripIds.length === 0) return
    downloadOffline(tripIds)
  }

  const allTripDownloaded =
    tripIds.length > 0 && tripIds.every((id) => downloadedIds.includes(id))

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
            data: { ...event, image: event.image },
          })
        }
      })
    }

    return markers
  }, [displayedCoupons, showEvents, tripIds])

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
      {displayedCoupons.slice(0, 8).map((coupon, idx) => (
        <div
          key={coupon.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 hover:z-50 group/pin"
          style={{
            top: `${20 + ((idx * 13) % 60)}%`,
            left: `${20 + ((idx * 17) % 60)}%`,
          }}
        >
          <div
            className={cn(
              'p-2 rounded-full shadow-lg transition-transform hover:scale-110 cursor-pointer',
              tripIds.includes(coupon.id)
                ? 'bg-[#4CAF50] text-white'
                : 'bg-[#FF5722] text-white',
            )}
          >
            <MapPin className="h-4 w-4" />
          </div>
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 bg-white rounded-lg shadow-xl p-2 hidden group-hover/pin:block text-xs z-50">
            <p className="font-bold truncate">{coupon.storeName}</p>
            <p className="text-[#FF5722] font-bold">{coupon.discount}</p>
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <Dialog open={isDownloading}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Salvando Offline</DialogTitle>
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

      <div className="bg-white border-b z-20 shadow-sm flex-shrink-0">
        <div className="container mx-auto px-4 py-4 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2 text-[#2196F3]">
                <Plane className="h-6 w-6" /> {t('travel.title')}
              </h1>
              <p className="text-sm text-muted-foreground hidden md:block">
                {t('travel.subtitle')}
              </p>
            </div>

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
                <Navigation className="h-4 w-4" /> {t('travel.gps')}
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
                <Globe className="h-4 w-4" /> {t('travel.plan_destination')}
              </button>
            </div>
          </div>

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
                placeholder={t('travel.search_placeholder')}
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
                {t('common.search')}
              </Button>
            </form>
            {navMode === 'planned' && destination && (
              <div className="flex justify-center mt-2">
                <Badge
                  variant="outline"
                  className="gap-2 bg-blue-50 text-[#2196F3] border-blue-200 px-3 py-1"
                >
                  {t('travel.showing_offers_for')}{' '}
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
                <TentTree className="h-4 w-4" /> {t('travel.explore_offers')}
              </TabsTrigger>
              <TabsTrigger
                value="itinerary"
                className="px-6 gap-2 data-[state=active]:bg-white data-[state=active]:text-[#4CAF50]"
              >
                <LayoutList className="h-4 w-4" /> {t('travel.my_itinerary')} (
                {tripIds.length})
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent
            value="explore"
            className="flex-1 overflow-hidden mt-0 data-[state=active]:flex flex-col"
          >
            <div className="flex items-center justify-between px-4 py-2 md:hidden bg-white border-b">
              <span className="text-xs text-muted-foreground">
                {displayedCoupons.length} {t('travel.offers_found')}
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
              <div
                className={cn(
                  'w-full md:w-[400px] lg:w-[450px] bg-white flex flex-col absolute md:relative inset-0 z-10 transition-transform duration-300 md:translate-x-0 md:border-r shadow-lg md:shadow-none',
                  viewType === 'map'
                    ? 'translate-x-[-100%] md:translate-x-0'
                    : 'translate-x-0',
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
                    {showEvents ? t('common.hide') : t('common.show')}
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
                        <p>{t('travel.no_offers')}</p>
                        {navMode === 'planned' && (
                          <Button variant="link" onClick={clearDestination}>
                            {t('travel.back_to_gps')}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>

              <div
                className={cn(
                  'flex-1 bg-slate-100 relative transition-transform duration-300 md:translate-x-0',
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
                        <LayoutList className="h-6 w-6" />{' '}
                        {t('travel.itinerary_title')}
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        {tripCoupons.length} {t('travel.saved_coupons')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {tripCoupons.length > 0 && (
                        <>
                          <Button
                            variant="outline"
                            onClick={handleDownloadOffline}
                            disabled={allTripDownloaded || isDownloading}
                            className="bg-white border-[#4CAF50]/30 text-[#2e7d32] hover:bg-[#4CAF50]/10 gap-2"
                          >
                            {isDownloading ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />{' '}
                                Baixando
                              </>
                            ) : allTripDownloaded ? (
                              <>
                                <Check className="h-4 w-4" /> Offline OK
                              </>
                            ) : (
                              <>
                                <Download className="h-4 w-4" /> Salvar Offline
                              </>
                            )}
                          </Button>
                          <Button
                            onClick={handleShare}
                            className="bg-[#4CAF50] hover:bg-[#43A047] gap-2"
                          >
                            <Share2 className="h-4 w-4" /> {t('common.share')}
                          </Button>
                        </>
                      )}
                    </div>
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
                            {t('travel.empty_itinerary')}
                          </h3>
                          <p className="text-sm text-muted-foreground max-w-xs mb-6">
                            {t('travel.empty_desc')}
                          </p>
                          <Button
                            onClick={() => setActiveTab('explore')}
                            className="bg-[#FF5722] hover:bg-[#F4511E]"
                          >
                            {t('travel.explore_offers')}
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
