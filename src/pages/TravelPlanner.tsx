import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useCouponStore } from '@/stores/CouponContext'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Plane,
  Search,
  Save,
  Trash2,
  Utensils,
  Moon,
  Sun,
  MapPin,
  Share2,
  Globe,
  UploadCloud,
  MessageSquare,
  Edit,
  PlayCircle,
  PauseCircle,
  Navigation,
} from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import { GoogleMap, MapMarker } from '@/components/GoogleMap'
import { DayPlan, Itinerary, Coupon } from '@/lib/types'
import { AdSpace } from '@/components/AdSpace'
import { AggregatorFeed } from '@/components/AggregatorFeed'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useNavigate } from 'react-router-dom'
import { useChat } from '@/stores/ChatContext'
import { LocationInput } from '@/components/LocationInput'

export default function TravelPlanner() {
  const {
    coupons,
    userLocation,
    saveItinerary,
    updateItinerary,
    deleteItinerary,
    publishItinerary,
    itineraries,
    user,
    activeItineraryId,
    setActiveItineraryId,
  } = useCouponStore()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const { startChat } = useChat()

  const [activeTab, setActiveTab] = useState<'planner' | 'saved' | 'community'>(
    'planner',
  )
  const [navMode, setNavMode] = useState<'gps' | 'planned'>('gps')

  // New State for Local vs Travel Mode
  const [planningMode, setPlanningMode] = useState<'travel' | 'local'>('travel')

  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [localLocation, setLocalLocation] = useState('')

  const [showRoute, setShowRoute] = useState(false)
  const [currentDay, setCurrentDay] = useState(1)
  const [days, setDays] = useState<DayPlan[]>(
    Array.from({ length: 10 }).map((_, i) => ({
      id: `day${i + 1}`,
      dayNumber: i + 1,
      stops: [],
    })),
  )
  const [planTitle, setPlanTitle] = useState('My Trip')
  const [isAgentMode, setIsAgentMode] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [mapCenter, setMapCenter] = useState<{
    lat: number
    lng: number
  } | null>(null)

  const currentHour = new Date().getHours()
  const isLunchTime = currentHour >= 11 && currentHour <= 14
  const isDinnerTime = currentHour >= 18 && currentHour <= 21

  const currentCenter = useMemo(() => {
    if (navMode === 'planned' && mapCenter) return mapCenter
    if (navMode === 'gps' && userLocation)
      return { lat: userLocation.lat, lng: userLocation.lng }
    return { lat: 28.5383, lng: -81.3792 }
  }, [navMode, mapCenter, userLocation])

  // Filter My Itineraries
  const myItineraries = itineraries.filter(
    (it) =>
      it.authorId === user?.id || (user?.role === 'agency' && it.agencyId),
  )

  // Filter Community Itineraries
  const communityItineraries = itineraries.filter(
    (it) => it.isPublic && it.status === 'approved',
  )

  const handleRouteSearch = (e?: React.FormEvent) => {
    e?.preventDefault()

    if (planningMode === 'local') {
      if (localLocation && mapCenter) {
        setNavMode('planned')
        // Center map already set by input select
        toast.info(t('common.loading'))
      } else {
        toast.error(t('travel.select_location_error'))
      }
      return
    }

    if (origin && destination) {
      setNavMode('planned')
      setShowRoute(true)
      // Logic handled by GoogleMap component via props
      toast.info(t('common.loading'))
    }
  }

  const addToDay = (coupon: Coupon) => {
    setDays((prev) =>
      prev.map((day) => {
        if (day.dayNumber === currentDay) {
          if (day.stops.find((s) => s.id === coupon.id)) {
            toast.info(t('common.error'))
            return day
          }
          toast.success(
            `${t('common.success')} - ${t('travel.day')} ${currentDay}`,
          )
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
        acc + day.stops.reduce((dAcc, s) => dAcc + (s.price || 10), 0),
      0,
    )

    const allStops = days.flatMap((d) => d.stops)

    if (allStops.length === 0) {
      toast.error(t('common.error'))
      return
    }

    const itineraryData: Itinerary = {
      id: editingId || Math.random().toString(),
      title: planTitle,
      description: `${days.length} days, ${allStops.length} stops.`,
      stops: allStops,
      days: days,
      totalSavings,
      duration: `${days.length} Days`,
      image:
        allStops[0]?.image || 'https://img.usecurling.com/p/600/300?q=travel',
      tags: [planningMode === 'local' ? 'Local' : 'Travel'],
      matchScore: 100,
      isTemplate: isAgentMode,
      authorId: user?.id,
      authorName: user?.name,
      status: 'draft',
      isPublic: false,
    }

    if (editingId) {
      updateItinerary(itineraryData)
      setEditingId(null)
    } else {
      saveItinerary(itineraryData)
    }

    // Reset state and go to list
    setPlanTitle('My Trip')
    setDays(
      Array.from({ length: 10 }).map((_, i) => ({
        id: `day${i + 1}`,
        dayNumber: i + 1,
        stops: [],
      })),
    )
    setActiveTab('saved')
  }

  const handleEdit = (it: Itinerary) => {
    setEditingId(it.id)
    setPlanTitle(it.title)
    if (it.days && it.days.length > 0) {
      setDays(it.days)
    } else {
      const newDays = Array.from({ length: 10 }).map((_, i) => ({
        id: `day${i + 1}`,
        dayNumber: i + 1,
        stops: i === 0 ? it.stops : [],
      }))
      setDays(newDays)
    }
    setActiveTab('planner')
  }

  const handleDelete = (id: string) => {
    if (window.confirm(t('travel.delete_confirm'))) {
      deleteItinerary(id)
      if (activeItineraryId === id) setActiveItineraryId(null)
    }
  }

  const handleShare = (it: Itinerary) => {
    navigator.clipboard.writeText(
      `${window.location.origin}/itinerary/${it.id}`,
    )
    toast.success(t('common.success'))
  }

  const handleContactAgent = () => {
    startChat('u_agency', 'Travel Agency')
    navigate('/messages')
  }

  const toggleActiveRoute = (id: string) => {
    if (activeItineraryId === id) {
      setActiveItineraryId(null)
      toast.info(t('travel.route_deactivated'))
    } else {
      setActiveItineraryId(id)
      toast.success(t('travel.route_activated'))
    }
  }

  const currentDayStops = useMemo(() => {
    return days.find((d) => d.dayNumber === currentDay)?.stops || []
  }, [days, currentDay])

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

  const handleLocationSelect = (loc: { lat: number; lng: number }) => {
    setMapCenter(loc)
    setNavMode('planned')
  }

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="flex-1 flex overflow-hidden flex-col md:flex-row">
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
                className="flex-1 font-bold text-xs"
              >
                {t('common.new')}
              </Button>
              <Button
                variant={activeTab === 'saved' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('saved')}
                className="flex-1 font-bold text-xs"
              >
                {t('travel.my_itineraries')}
              </Button>
              <Button
                variant={activeTab === 'community' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('community')}
                className="flex-1 font-bold text-xs"
              >
                {t('travel.community_trips')}
              </Button>
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-4 space-y-6">
              {activeTab === 'planner' ? (
                <>
                  <div className="space-y-3 bg-slate-50 p-4 rounded-lg border">
                    <div className="flex bg-white rounded-md p-1 border mb-2">
                      <Button
                        variant={
                          planningMode === 'travel' ? 'secondary' : 'ghost'
                        }
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => setPlanningMode('travel')}
                      >
                        {t('travel.trip_mode')}
                      </Button>
                      <Button
                        variant={
                          planningMode === 'local' ? 'secondary' : 'ghost'
                        }
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => setPlanningMode('local')}
                      >
                        {t('travel.local_mode')}
                      </Button>
                    </div>

                    <Label className="text-xs uppercase text-muted-foreground font-bold">
                      {planningMode === 'travel'
                        ? t('travel.calculate_route')
                        : t('travel.explore_city')}
                    </Label>

                    {planningMode === 'travel' ? (
                      <>
                        <LocationInput
                          value={origin}
                          onChange={setOrigin}
                          onSelect={(loc) => {
                            // Optionally set map center to origin initially
                          }}
                          placeholder={t('travel.origin')}
                          icon={<MapPin className="h-4 w-4 text-green-500" />}
                        />
                        <LocationInput
                          value={destination}
                          onChange={setDestination}
                          onSelect={(loc) => {
                            setMapCenter(loc)
                          }}
                          placeholder={t('travel.destination')}
                          icon={<MapPin className="h-4 w-4 text-red-500" />}
                        />
                      </>
                    ) : (
                      <LocationInput
                        value={localLocation}
                        onChange={setLocalLocation}
                        onSelect={handleLocationSelect}
                        placeholder={t('travel.select_city')}
                        icon={<Navigation className="h-4 w-4 text-blue-500" />}
                      />
                    )}

                    <Button
                      onClick={handleRouteSearch}
                      className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
                    >
                      <Search className="h-4 w-4" /> {t('travel.optimize')}
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Input
                        value={planTitle}
                        onChange={(e) => setPlanTitle(e.target.value)}
                        className="font-bold text-lg border-none px-0 shadow-none focus-visible:ring-0 bg-transparent h-auto py-1"
                      />
                      {editingId && (
                        <Badge variant="secondary" className="text-xs">
                          {t('travel.editing')}
                        </Badge>
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
                                {t('travel.day')} {day.dayNumber}
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
                                        <Utensils className="h-3 w-3" />
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

                    <div className="flex gap-2">
                      <Button
                        className="flex-1 gap-2 bg-[#4CAF50] hover:bg-[#43A047] font-bold"
                        onClick={handleSavePlan}
                      >
                        <Save className="h-4 w-4" />{' '}
                        {editingId
                          ? t('travel.update_trip')
                          : t('travel.save_itinerary')}
                      </Button>
                      {editingId && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setEditingId(null)
                            setPlanTitle('My Trip')
                            setDays(
                              Array.from({ length: 10 }).map((_, i) => ({
                                id: `day${i + 1}`,
                                dayNumber: i + 1,
                                stops: [],
                              })),
                            )
                          }}
                        >
                          {t('common.cancel')}
                        </Button>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      onClick={handleContactAgent}
                    >
                      <MessageSquare className="h-4 w-4" />{' '}
                      {t('travel.contact_agent')}
                    </Button>
                  </div>
                </>
              ) : activeTab === 'saved' ? (
                <div className="space-y-4">
                  {myItineraries.length === 0 && (
                    <p className="text-center text-muted-foreground text-sm">
                      {t('travel.no_saved_itineraries')}
                    </p>
                  )}
                  {myItineraries.map((it) => (
                    <Card
                      key={it.id}
                      className={
                        activeItineraryId === it.id
                          ? 'border-green-500 border-2 relative cursor-pointer hover:shadow-md transition-all group overflow-hidden'
                          : 'cursor-pointer hover:shadow-md transition-all group relative overflow-hidden'
                      }
                    >
                      <div className="absolute top-2 right-2 flex gap-1 z-10">
                        <Button
                          size="icon"
                          variant={
                            activeItineraryId === it.id
                              ? 'default'
                              : 'secondary'
                          }
                          className={`h-8 w-8 shadow-sm ${activeItineraryId === it.id ? 'bg-green-500 hover:bg-green-600' : 'bg-white/80 hover:bg-white text-green-600'}`}
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleActiveRoute(it.id)
                          }}
                          title={
                            activeItineraryId === it.id
                              ? t('travel.pause_tracking')
                              : t('travel.activate_route')
                          }
                        >
                          {activeItineraryId === it.id ? (
                            <PauseCircle className="h-4 w-4" />
                          ) : (
                            <PlayCircle className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="icon"
                          variant="secondary"
                          className="h-8 w-8 bg-white/80 hover:bg-white text-blue-600 shadow-sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEdit(it)
                          }}
                          title={t('common.edit')}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="secondary"
                          className="h-8 w-8 bg-white/80 hover:bg-white text-red-600 shadow-sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(it.id)
                          }}
                          title={t('common.delete')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        {!it.isPublic && (
                          <Button
                            size="icon"
                            variant="secondary"
                            className="h-8 w-8 bg-white/80 hover:bg-white text-purple-600 shadow-sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              publishItinerary(it.id)
                            }}
                            title={t('common.publish')}
                          >
                            <UploadCloud className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="icon"
                          variant="secondary"
                          className="h-8 w-8 bg-white/80 hover:bg-white text-primary shadow-sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleShare(it)
                          }}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <CardContent className="p-4 flex gap-4">
                        <img
                          src={it.image}
                          className="w-20 h-20 rounded-md object-cover"
                          alt=""
                        />
                        <div className="flex-1 min-w-0 pt-1">
                          <h4 className="font-bold group-hover:text-primary transition-colors truncate pr-24">
                            {it.title}
                          </h4>
                          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mt-1">
                            <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">
                              {it.duration}
                            </span>
                            {it.status && (
                              <Badge
                                variant="outline"
                                className={`text-[10px] ${it.status === 'approved' ? 'text-green-600 bg-green-50' : it.status === 'pending' ? 'text-yellow-600 bg-yellow-50' : 'text-slate-500'}`}
                              >
                                {it.status}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs mt-2 line-clamp-1">
                            {it.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {communityItineraries.length === 0 && (
                    <p className="text-center text-muted-foreground text-sm">
                      {t('travel.no_community_trips')}
                    </p>
                  )}
                  {communityItineraries.map((it) => (
                    <Card
                      key={it.id}
                      className="cursor-pointer hover:shadow-md transition-all group relative border-l-4 border-l-purple-500"
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
                        <Share2 className="h-4 w-4 text-purple-600" />
                      </Button>
                      <CardContent className="p-4 flex gap-4">
                        <img
                          src={it.image}
                          className="w-20 h-20 rounded-md object-cover"
                          alt=""
                        />
                        <div>
                          <h4 className="font-bold group-hover:text-purple-600 transition-colors">
                            {it.title}
                          </h4>
                          <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                            <Globe className="h-3 w-3" />
                            <span>
                              {t('travel.by')} {it.authorName || 'User'}
                            </span>
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

        <div className="flex-1 relative flex flex-col min-h-[300px] min-w-0 overflow-hidden z-0">
          <GoogleMap
            center={currentCenter}
            zoom={navMode === 'planned' ? 12 : 14}
            markers={mapMarkers}
            className="flex-1 w-full h-full"
            origin={showRoute && planningMode === 'travel' ? origin : undefined}
            destination={
              showRoute && planningMode === 'travel'
                ? destination
                : planningMode === 'local'
                  ? localLocation
                  : undefined
            }
          />

          <div className="absolute top-4 left-4 right-4 md:left-auto md:right-4 bg-white/95 backdrop-blur p-3 rounded-lg shadow-lg z-10 max-w-sm border-l-4 border-l-orange-500">
            <div className="flex items-center gap-2 mb-1">
              {currentHour >= 18 ? (
                <Moon className="h-4 w-4 text-blue-900" />
              ) : (
                <Sun className="h-4 w-4 text-orange-500" />
              )}
              <span className="font-bold text-sm">
                {destination || localLocation || 'Current Location'}
              </span>
            </div>
          </div>
        </div>

        <div className="w-full md:w-[320px] bg-white border-l z-20 shadow-xl overflow-hidden shrink-0 h-1/2 md:h-full">
          <AggregatorFeed coupons={coupons} onAddToItinerary={addToDay} />
        </div>
      </div>
    </div>
  )
}
