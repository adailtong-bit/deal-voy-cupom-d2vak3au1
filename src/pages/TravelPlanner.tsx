import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useCouponStore } from '@/stores/CouponContext'
import {
  Search,
  Trash2,
  MapPin,
  Clock,
  Calendar,
  Plus,
  ArrowLeft,
  Luggage,
  MoreVertical,
  ImageOff,
  QrCode,
  CalendarDays,
  Info,
} from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import { Itinerary, Coupon, DayPlan } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function TravelPlanner() {
  const {
    coupons,
    saveItinerary,
    updateItinerary,
    deleteItinerary,
    itineraries,
    user,
  } = useCouponStore()
  const { t } = useLanguage()

  // Views: 'dashboard' | 'detail'
  const [view, setView] = useState<'dashboard' | 'detail'>('dashboard')
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null)
  const [activeDayId, setActiveDayId] = useState<string>('')

  // Create Trip State
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newTripTitle, setNewTripTitle] = useState('')
  const [newTripDays, setNewTripDays] = useState('3')

  // Add Activity State
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Filter Itineraries
  const myTrips = useMemo(() => {
    return itineraries.filter((it) => it.authorId === user?.id)
  }, [itineraries, user])

  const activeTrip = useMemo(() => {
    return itineraries.find((i) => i.id === selectedTripId) || null
  }, [itineraries, selectedTripId])

  // Filter Discovery Coupons
  const discoveryCoupons = useMemo(() => {
    if (!searchQuery) return coupons.slice(0, 30)
    const lowerQ = searchQuery.toLowerCase()
    return coupons.filter(
      (c) =>
        c.title.toLowerCase().includes(lowerQ) ||
        c.storeName.toLowerCase().includes(lowerQ) ||
        c.category.toLowerCase().includes(lowerQ),
    )
  }, [coupons, searchQuery])

  // Navigation
  const handleSelectTrip = (trip: Itinerary) => {
    setSelectedTripId(trip.id)
    if (trip.days && trip.days.length > 0) {
      setActiveDayId(trip.days[0].id)
    }
    setView('detail')
  }

  const handleBackToDashboard = () => {
    setView('dashboard')
    setSelectedTripId(null)
  }

  // Create Trip
  const handleCreateTrip = () => {
    if (!newTripTitle.trim()) {
      toast.error('Trip title is required')
      return
    }

    const numDays = parseInt(newTripDays) || 1
    const days: DayPlan[] = Array.from({ length: numDays }).map((_, i) => ({
      id: `day-${Math.random().toString(36).substring(2, 9)}`,
      dayNumber: i + 1,
      stops: [],
    }))

    const newTrip: Itinerary = {
      id: Math.random().toString(36).substring(2, 9),
      title: newTripTitle,
      description: 'A new adventure awaits.',
      stops: [],
      days: days,
      tags: ['New'],
      duration: `${numDays} Days`,
      totalSavings: 0,
      image: `https://img.usecurling.com/p/800/400?q=${encodeURIComponent(newTripTitle)}&fallback=travel`,
      status: 'draft',
      authorId: user?.id,
      authorName: user?.name,
      matchScore: 100,
    }

    saveItinerary(newTrip)
    setIsCreateOpen(false)
    setNewTripTitle('')
    setNewTripDays('3')
    toast.success('Trip created successfully!')
    handleSelectTrip(newTrip)
  }

  const handleDeleteTrip = (id: string) => {
    deleteItinerary(id)
    if (selectedTripId === id) {
      handleBackToDashboard()
    }
    toast.success('Trip deleted')
  }

  // Activity Management
  const handleAddActivity = (coupon: Coupon) => {
    if (!activeTrip || !activeTrip.days) return

    const updatedDays = activeTrip.days.map((day) => {
      if (day.id === activeDayId) {
        if (day.stops.find((s) => s.id === coupon.id)) {
          toast.info('Activity already added to this day')
          return day
        }
        return { ...day, stops: [...day.stops, coupon] }
      }
      return day
    })

    const allStops = updatedDays.flatMap((d) => d.stops)
    const updatedTrip = { ...activeTrip, days: updatedDays, stops: allStops }

    updateItinerary(updatedTrip)
    toast.success('Activity added to day')
    setIsAddSheetOpen(false)
  }

  const handleRemoveActivity = (dayId: string, stopId: string) => {
    if (!activeTrip || !activeTrip.days) return

    const updatedDays = activeTrip.days.map((day) => {
      if (day.id === dayId) {
        return { ...day, stops: day.stops.filter((s) => s.id !== stopId) }
      }
      return day
    })

    const allStops = updatedDays.flatMap((d) => d.stops)
    const updatedTrip = { ...activeTrip, days: updatedDays, stops: allStops }

    updateItinerary(updatedTrip)
    toast.success('Activity removed')
  }

  // Helper
  const getMockTime = (index: number) => {
    const startHour = 9
    const hour = startHour + index * 2
    return `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`
  }

  if (view === 'dashboard') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl min-h-[calc(100vh-64px)]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
              <Luggage className="h-8 w-8 text-primary" />
              My Travel Plans
            </h1>
            <p className="text-muted-foreground mt-1">
              Organize your upcoming trips and adventures.
            </p>
          </div>
          <Button
            size="lg"
            className="font-bold shadow-sm"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus className="h-5 w-5 mr-2" /> New Trip
          </Button>
        </div>

        {myTrips.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed">
            <Luggage className="h-16 w-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-bold text-slate-700 mb-2">
              No trips planned yet
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Start planning your next vacation, weekend getaway, or business
              trip right here.
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              Create Your First Trip
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myTrips.map((trip) => (
              <Card
                key={trip.id}
                className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group flex flex-col"
                onClick={() => handleSelectTrip(trip)}
              >
                <div className="h-40 relative bg-slate-200 overflow-hidden">
                  <img
                    src={trip.image}
                    alt={trip.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 text-white">
                    <h3 className="font-bold text-lg leading-tight">
                      {trip.title}
                    </h3>
                  </div>
                  <div className="absolute top-3 right-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-8 w-8 bg-white/90 hover:bg-white text-slate-800 rounded-full"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-700"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteTrip(trip.id)
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Delete Trip
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <CardContent className="p-4 flex-1 flex flex-col justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      {trip.duration}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      {trip.stops.length} Activities
                    </span>
                  </div>
                  <Button variant="outline" className="w-full bg-slate-50">
                    View Itinerary
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl">Create New Trip</DialogTitle>
            </DialogHeader>
            <div className="space-y-5 py-4">
              <div className="space-y-2">
                <Label htmlFor="tripTitle">Destination or Trip Name</Label>
                <Input
                  id="tripTitle"
                  placeholder="e.g. Summer in Paris"
                  value={newTripTitle}
                  onChange={(e) => setNewTripTitle(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tripDays">Duration (Days)</Label>
                <Input
                  id="tripDays"
                  type="number"
                  min="1"
                  max="30"
                  value={newTripDays}
                  onChange={(e) => setNewTripDays(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTrip}>Start Planning</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  // Detail View
  if (!activeTrip) return null

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-64px)] pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-20 shadow-sm">
        <div className="container mx-auto px-4 max-w-4xl py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleBackToDashboard}
            className="gap-2 -ml-3 text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Trips
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => handleDeleteTrip(activeTrip.id)}
            >
              <Trash2 className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Delete</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-4xl py-8">
        <div className="mb-8 text-center sm:text-left flex flex-col sm:flex-row items-center gap-6">
          <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-2xl overflow-hidden shrink-0 shadow-md">
            <img
              src={activeTrip.image}
              alt={activeTrip.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-2">
              {activeTrip.title}
            </h1>
            <div className="flex flex-wrap justify-center sm:justify-start items-center gap-4 text-slate-600 font-medium">
              <span className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full shadow-sm border">
                <Calendar className="h-4 w-4 text-primary" />
                {activeTrip.duration}
              </span>
              <span className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full shadow-sm border">
                <MapPin className="h-4 w-4 text-orange-500" />
                {activeTrip.stops.length} Total Activities
              </span>
            </div>
          </div>
        </div>

        {/* Tabbed Day Navigation */}
        <div className="bg-white rounded-2xl shadow-sm border p-4 sm:p-6">
          <Tabs
            value={activeDayId}
            onValueChange={setActiveDayId}
            className="w-full"
          >
            <ScrollArea className="w-full mb-6">
              <TabsList className="inline-flex w-max min-w-full h-12 bg-slate-100 p-1 rounded-xl">
                {activeTrip.days?.map((day) => (
                  <TabsTrigger
                    key={day.id}
                    value={day.id}
                    className="rounded-lg px-6 font-semibold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all flex-1"
                  >
                    Day {day.dayNumber}
                  </TabsTrigger>
                ))}
              </TabsList>
              <ScrollBar orientation="horizontal" className="invisible" />
            </ScrollArea>

            {activeTrip.days?.map((day) => (
              <TabsContent
                key={day.id}
                value={day.id}
                className="mt-0 outline-none animate-in fade-in-50 duration-500"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-slate-800">
                    Activities for Day {day.dayNumber}
                  </h3>
                  <Button
                    onClick={() => setIsAddSheetOpen(true)}
                    className="gap-2 bg-primary hover:bg-primary/90"
                  >
                    <Plus className="h-4 w-4" /> Add Activity
                  </Button>
                </div>

                {day.stops.length === 0 ? (
                  <div className="text-center py-16 bg-slate-50 border-2 border-dashed rounded-xl">
                    <MapPin className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-lg font-medium text-slate-700">
                      Your day is empty
                    </p>
                    <p className="text-slate-500 mb-6">
                      Add places to visit, restaurants, or events.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setIsAddSheetOpen(true)}
                    >
                      Browse Discoveries
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {day.stops.map((stop, idx) => (
                      <div
                        key={`${stop.id}-${idx}`}
                        className="flex gap-4 group"
                      >
                        {/* Time Column */}
                        <div className="w-16 sm:w-20 shrink-0 flex flex-col items-center pt-4">
                          <span className="text-xs sm:text-sm font-bold text-slate-700 text-center leading-tight">
                            {getMockTime(idx).replace(' ', '\n')}
                          </span>
                          <div className="flex-1 w-px bg-slate-200 mt-2 group-last:hidden" />
                        </div>

                        {/* Activity Card */}
                        <Card className="flex-1 overflow-hidden hover:shadow-md transition-shadow bg-white border-slate-200">
                          <div className="flex flex-col sm:flex-row">
                            <div className="w-full sm:w-48 h-40 sm:h-auto shrink-0 relative bg-slate-100 flex items-center justify-center">
                              {stop.image ? (
                                <img
                                  src={stop.image}
                                  alt={stop.storeName}
                                  className="w-full h-full object-cover"
                                  onError={(e) =>
                                    (e.currentTarget.style.display = 'none')
                                  }
                                />
                              ) : (
                                <ImageOff className="h-8 w-8 text-slate-400" />
                              )}
                              <Badge className="absolute top-2 left-2 bg-white/90 text-slate-900 border-none shadow-sm">
                                {stop.category}
                              </Badge>
                            </div>
                            <CardContent className="p-4 sm:p-5 flex-1 flex flex-col">
                              <div className="flex justify-between items-start gap-4 mb-2">
                                <div>
                                  <h4 className="text-lg font-bold text-slate-900 leading-tight mb-1">
                                    {stop.storeName}
                                  </h4>
                                  <p className="text-sm text-primary font-medium">
                                    {stop.title}
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-slate-400 hover:text-red-600 hover:bg-red-50 shrink-0 -mr-2 -mt-2"
                                  onClick={() =>
                                    handleRemoveActivity(day.id, stop.id)
                                  }
                                  title="Remove activity"
                                >
                                  <Trash2 className="h-5 w-5" />
                                </Button>
                              </div>

                              <p className="text-sm text-slate-600 line-clamp-2 mb-4">
                                {stop.description}
                              </p>

                              {/* Address and Validity */}
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-5">
                                <div className="flex items-start sm:items-center gap-1.5 text-xs text-slate-600">
                                  <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5 sm:mt-0" />
                                  <span className="line-clamp-1">
                                    {stop.address || 'Address unavailable'}
                                  </span>
                                </div>
                                <div className="hidden sm:block w-1 h-1 rounded-full bg-slate-300" />
                                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                  <CalendarDays className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                  <span>
                                    Valid until:{' '}
                                    {stop.expiryDate
                                      ? new Date(
                                          stop.expiryDate,
                                        ).toLocaleDateString()
                                      : 'N/A'}
                                  </span>
                                </div>
                              </div>

                              {/* Instructions and QR block */}
                              <div className="mt-auto bg-slate-50 rounded-lg border border-slate-100 p-3 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                                <div className="flex-1 space-y-1.5">
                                  <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                    <Info className="h-3.5 w-3.5 text-primary" />
                                    How to Use
                                  </h5>
                                  <p className="text-xs text-slate-600 leading-relaxed">
                                    {stop.instructions ||
                                      'Present this screen at the counter. Ensure the code is clearly visible to claim your benefit.'}
                                  </p>
                                </div>
                                <div className="shrink-0 bg-white border border-slate-200 rounded p-2 flex flex-col items-center justify-center min-w-[110px] w-full sm:w-auto shadow-sm">
                                  <QrCode
                                    className="h-10 w-10 text-slate-800 mb-1"
                                    strokeWidth={1.5}
                                  />
                                  <span className="text-[10px] font-mono font-bold text-slate-500 tracking-widest uppercase text-center w-full truncate px-1">
                                    {stop.code || 'NO-CODE'}
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </div>
                        </Card>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>

      {/* Add Activity Sheet */}
      <Sheet open={isAddSheetOpen} onOpenChange={setIsAddSheetOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md p-0 flex flex-col bg-slate-50"
        >
          <SheetHeader className="p-6 bg-white border-b">
            <SheetTitle className="text-xl">Discover Activities</SheetTitle>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search restaurants, places, events..."
                className="pl-9 bg-slate-50 border-transparent focus-visible:ring-primary/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </SheetHeader>
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {discoveryCoupons.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  No activities found.
                </div>
              ) : (
                discoveryCoupons.map((coupon) => (
                  <Card key={coupon.id} className="overflow-hidden bg-white">
                    <div className="flex h-28">
                      <div className="w-28 shrink-0 relative bg-slate-200">
                        <img
                          src={coupon.image}
                          alt={coupon.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                        <div>
                          <h4 className="font-bold text-sm truncate">
                            {coupon.storeName}
                          </h4>
                          <p className="text-xs text-muted-foreground truncate">
                            {coupon.title}
                          </p>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <Badge
                            variant="secondary"
                            className="text-[10px] bg-green-50 text-green-700 hover:bg-green-50"
                          >
                            {coupon.discount}
                          </Badge>
                          <Button
                            size="sm"
                            className="h-7 text-xs px-3"
                            onClick={() => handleAddActivity(coupon)}
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  )
}
