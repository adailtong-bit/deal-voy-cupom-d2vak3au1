import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCouponStore } from '@/stores/CouponContext'
import {
  Compass,
  Search,
  Save,
  Trash2,
  MapPin,
  Globe,
  Edit,
  Clock,
  Navigation,
  Calendar,
  Plus,
  CheckCircle,
  Map as MapIcon,
  X,
  Luggage,
} from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import { Itinerary, Coupon } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'

export default function TravelPlanner() {
  const {
    coupons,
    saveItinerary,
    updateItinerary,
    deleteItinerary,
    itineraries,
    user,
  } = useCouponStore()
  const { formatCurrency } = useLanguage()

  // Navigation State
  const [activeNav, setActiveNav] = useState<
    'planned' | 'current' | 'past' | 'community'
  >('planned')

  // Selection & Edit State
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [activeDayIndex, setActiveDayIndex] = useState(0)

  // Draft State for Editing
  const [draftTrip, setDraftTrip] = useState<Partial<Itinerary> | null>(null)

  // Discovery Search State
  const [searchQuery, setSearchQuery] = useState('')

  // Filter Itineraries based on activeNav
  const filteredItineraries = useMemo(() => {
    const myIts = itineraries.filter(
      (it) =>
        it.authorId === user?.id || (user?.role === 'agency' && it.agencyId),
    )
    switch (activeNav) {
      case 'planned':
        return myIts.filter((it) => it.status === 'draft')
      case 'current':
        return myIts.filter(
          (it) => it.status === 'approved' || it.status === 'pending',
        )
      case 'past':
        // Mocking past trips
        return myIts.filter((it) => it.status === 'rejected')
      case 'community':
        return itineraries.filter(
          (it) => it.isPublic && it.status === 'approved',
        )
      default:
        return myIts
    }
  }, [itineraries, activeNav, user])

  // Filter Discovery Coupons
  const discoveryCoupons = useMemo(() => {
    if (!searchQuery) return coupons.slice(0, 20)
    const lowerQ = searchQuery.toLowerCase()
    return coupons.filter(
      (c) =>
        c.title.toLowerCase().includes(lowerQ) ||
        c.storeName.toLowerCase().includes(lowerQ) ||
        c.category.toLowerCase().includes(lowerQ),
    )
  }, [coupons, searchQuery])

  const handleSelectTrip = (itinerary: Itinerary) => {
    setSelectedTripId(itinerary.id)
    setIsEditing(false)
    setDraftTrip(null)
  }

  const handleCreateNew = () => {
    setSelectedTripId(null)
    setIsEditing(true)
    setDraftTrip({
      id: Math.random().toString(),
      title: 'My New Trip',
      description: 'A brand new adventure.',
      stops: [],
      days: [
        { id: 'day1', dayNumber: 1, stops: [] },
        { id: 'day2', dayNumber: 2, stops: [] },
        { id: 'day3', dayNumber: 3, stops: [] },
      ],
      tags: ['New'],
      duration: '3 Days',
      totalSavings: 0,
      image: 'https://img.usecurling.com/p/800/400?q=travel%20vacation',
    })
    setActiveDayIndex(0)
  }

  const handleEdit = () => {
    const it = itineraries.find((i) => i.id === selectedTripId)
    if (it) {
      setDraftTrip(JSON.parse(JSON.stringify(it))) // Deep copy
      setIsEditing(true)
      setActiveDayIndex(0)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setDraftTrip(null)
    if (!selectedTripId) {
      setSelectedTripId(null)
    }
  }

  const handleSave = () => {
    if (!draftTrip || !draftTrip.title) {
      toast.error('Title is required')
      return
    }

    const allStops = draftTrip.days?.flatMap((d) => d.stops) || []
    const totalSavings = draftTrip.days?.reduce(
      (acc, day) =>
        acc + day.stops.reduce((dAcc, s) => dAcc + (s.price || 10), 0),
      0,
    )

    const finalItinerary: Itinerary = {
      ...(draftTrip as Itinerary),
      stops: allStops,
      totalSavings: totalSavings || 0,
      duration: `${draftTrip.days?.length || 0} Days`,
      status: draftTrip.status || 'draft',
      authorId: user?.id,
      authorName: user?.name,
      isPublic: draftTrip.isPublic || false,
    }

    if (itineraries.some((i) => i.id === finalItinerary.id)) {
      updateItinerary(finalItinerary)
      toast.success('Trip updated successfully')
    } else {
      saveItinerary(finalItinerary)
      toast.success('Trip created successfully')
      setActiveNav('planned')
    }

    setSelectedTripId(finalItinerary.id)
    setIsEditing(false)
    setDraftTrip(null)
  }

  const handleDelete = () => {
    if (
      selectedTripId &&
      window.confirm('Are you sure you want to delete this trip?')
    ) {
      deleteItinerary(selectedTripId)
      setSelectedTripId(null)
      setIsEditing(false)
      toast.success('Trip deleted')
    }
  }

  const addActivityToDay = (coupon: Coupon) => {
    if (!draftTrip || !draftTrip.days) return

    const updatedDays = [...draftTrip.days]
    const currentDay = updatedDays[activeDayIndex]

    if (currentDay.stops.find((s) => s.id === coupon.id)) {
      toast.info('Activity already added to this day')
      return
    }

    currentDay.stops.push(coupon)
    setDraftTrip({ ...draftTrip, days: updatedDays })
    toast.success(`Added ${coupon.storeName} to Day ${currentDay.dayNumber}`)
  }

  const removeActivityFromDay = (dayIndex: number, stopId: string) => {
    if (!draftTrip || !draftTrip.days) return
    const updatedDays = [...draftTrip.days]
    updatedDays[dayIndex].stops = updatedDays[dayIndex].stops.filter(
      (s) => s.id !== stopId,
    )
    setDraftTrip({ ...draftTrip, days: updatedDays })
  }

  const addDay = () => {
    if (!draftTrip || !draftTrip.days) return
    const newDayNumber = draftTrip.days.length + 1
    const updatedDays = [
      ...draftTrip.days,
      { id: `day${newDayNumber}`, dayNumber: newDayNumber, stops: [] },
    ]
    setDraftTrip({ ...draftTrip, days: updatedDays })
    setActiveDayIndex(updatedDays.length - 1)
  }

  // Get active viewing itinerary
  const viewingItinerary =
    isEditing && draftTrip
      ? (draftTrip as Itinerary)
      : itineraries.find((i) => i.id === selectedTripId)

  // Generate mock time based on index
  const getMockTime = (index: number) => {
    const startHour = 9
    const hour = startHour + index * 2
    return `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50/50 md:flex-row overflow-hidden">
      {/* LEFT SIDEBAR: Navigation */}
      <div className="w-full md:w-[280px] bg-white border-r flex flex-col shrink-0 z-20 shadow-sm h-full">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold flex items-center gap-2 text-slate-800">
            <Luggage className="h-6 w-6 text-primary" /> Trips
          </h1>
          <Button
            className="w-full mt-4 gap-2 bg-primary hover:bg-primary/90 shadow-sm"
            onClick={handleCreateNew}
          >
            <Plus className="h-4 w-4" /> New Trip
          </Button>
        </div>

        <div className="flex flex-col p-2 gap-1 border-b">
          <Button
            variant={activeNav === 'planned' ? 'secondary' : 'ghost'}
            className="justify-start gap-3 h-10"
            onClick={() => setActiveNav('planned')}
          >
            <Calendar className="h-4 w-4 text-blue-500" /> Planned Trips
          </Button>
          <Button
            variant={activeNav === 'current' ? 'secondary' : 'ghost'}
            className="justify-start gap-3 h-10"
            onClick={() => setActiveNav('current')}
          >
            <Navigation className="h-4 w-4 text-green-500" /> Current Trips
          </Button>
          <Button
            variant={activeNav === 'past' ? 'secondary' : 'ghost'}
            className="justify-start gap-3 h-10"
            onClick={() => setActiveNav('past')}
          >
            <CheckCircle className="h-4 w-4 text-slate-500" /> Past Trips
          </Button>
          <Separator className="my-1" />
          <Button
            variant={activeNav === 'community' ? 'secondary' : 'ghost'}
            className="justify-start gap-3 h-10"
            onClick={() => setActiveNav('community')}
          >
            <Globe className="h-4 w-4 text-purple-500" /> Community Trips
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-3 space-y-2">
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-2">
              {activeNav} ({filteredItineraries.length})
            </div>
            {filteredItineraries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm border border-dashed rounded-lg bg-slate-50 mx-2">
                No trips found
              </div>
            ) : (
              filteredItineraries.map((it) => (
                <div
                  key={it.id}
                  onClick={() => handleSelectTrip(it)}
                  className={cn(
                    'p-3 rounded-lg cursor-pointer transition-all border',
                    selectedTripId === it.id && !isEditing
                      ? 'bg-primary/5 border-primary/30 shadow-sm'
                      : 'bg-white hover:bg-slate-50 border-transparent hover:border-slate-200',
                  )}
                >
                  <h4 className="font-bold text-sm text-slate-800 line-clamp-1">
                    {it.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {it.duration}
                    </span>
                    <span>•</span>
                    <span>{it.stops.length} stops</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* CENTRAL AREA: Itinerary Builder / Details */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 relative h-full">
        {!viewingItinerary ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="bg-white p-6 rounded-full shadow-sm mb-6 border">
              <MapIcon className="h-12 w-12 text-slate-300" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              Your Travel Dashboard
            </h2>
            <p className="text-muted-foreground max-w-md mb-6">
              Select a trip from the sidebar to view its details, or create a
              new itinerary to start planning your next adventure.
            </p>
            <Button onClick={handleCreateNew} className="gap-2">
              <Plus className="h-4 w-4" /> Start Planning
            </Button>
          </div>
        ) : (
          <ScrollArea className="flex-1">
            <div className="max-w-3xl mx-auto w-full pb-20">
              {/* Cover Image & Header */}
              <div className="relative h-48 sm:h-64 w-full bg-slate-200">
                <img
                  src={viewingItinerary.image}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />

                {/* Action Buttons Top Right */}
                <div className="absolute top-4 right-4 flex gap-2">
                  {!isEditing && viewingItinerary.authorId === user?.id && (
                    <>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="bg-white/90 hover:bg-white text-slate-800"
                        onClick={handleEdit}
                      >
                        <Edit className="h-4 w-4 mr-2" /> Edit Trip
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="bg-white/90 hover:bg-white text-red-600"
                        onClick={handleDelete}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  {isEditing && (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="bg-red-500/90 hover:bg-red-600 text-white border-0"
                      onClick={handleCancelEdit}
                    >
                      <X className="h-4 w-4 mr-2" /> Cancel
                    </Button>
                  )}
                </div>

                <div className="absolute bottom-6 left-6 right-6 text-white">
                  {isEditing ? (
                    <div className="space-y-3 max-w-xl">
                      <Input
                        value={draftTrip?.title || ''}
                        onChange={(e) =>
                          setDraftTrip({ ...draftTrip, title: e.target.value })
                        }
                        className="text-2xl sm:text-4xl font-extrabold bg-black/40 border-0 text-white placeholder:text-white/50 h-auto py-2 focus-visible:ring-1 focus-visible:ring-white"
                        placeholder="Trip Title"
                      />
                      <Input
                        value={draftTrip?.description || ''}
                        onChange={(e) =>
                          setDraftTrip({
                            ...draftTrip,
                            description: e.target.value,
                          })
                        }
                        className="text-sm bg-black/40 border-0 text-white/90 placeholder:text-white/50 h-auto py-1.5 focus-visible:ring-1 focus-visible:ring-white"
                        placeholder="Short description..."
                      />
                    </div>
                  ) : (
                    <>
                      <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 leading-tight">
                        {viewingItinerary.title}
                      </h1>
                      <p className="text-white/90 text-sm max-w-2xl line-clamp-2">
                        {viewingItinerary.description}
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Day Breakdown Builder */}
              <div className="p-4 sm:p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-800">
                    Itinerary
                  </h2>
                  {isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addDay}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" /> Add Day
                    </Button>
                  )}
                </div>

                <div className="space-y-6">
                  {viewingItinerary.days?.map((day, dIdx) => (
                    <Card
                      key={day.id}
                      className={cn(
                        'overflow-hidden transition-all duration-300',
                        isEditing && activeDayIndex === dIdx
                          ? 'ring-2 ring-primary shadow-md'
                          : 'shadow-sm hover:shadow-md',
                      )}
                    >
                      <CardHeader className="bg-slate-50 border-b py-3 px-4 flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-base font-bold flex items-center gap-2">
                          <div className="bg-primary/10 text-primary h-8 w-8 rounded-full flex items-center justify-center text-sm">
                            {day.dayNumber}
                          </div>
                          Day {day.dayNumber}
                        </CardTitle>
                        {isEditing && activeDayIndex !== dIdx && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:bg-primary/10 h-8"
                            onClick={() => setActiveDayIndex(dIdx)}
                          >
                            Edit this day
                          </Button>
                        )}
                      </CardHeader>
                      <CardContent className="p-0">
                        {day.stops.length === 0 ? (
                          <div className="p-8 text-center text-muted-foreground text-sm">
                            <Compass className="h-8 w-8 mx-auto mb-3 text-slate-300" />
                            <p>No activities planned for this day yet.</p>
                          </div>
                        ) : (
                          <div className="divide-y">
                            {day.stops.map((stop, sIdx) => (
                              <div
                                key={`${stop.id}-${sIdx}`}
                                className="p-4 flex gap-4 hover:bg-slate-50/50 transition-colors group"
                              >
                                <div className="flex flex-col items-center min-w-[60px] text-center pt-1">
                                  <span className="text-xs font-bold text-slate-800">
                                    {getMockTime(sIdx)}
                                  </span>
                                  <div className="h-full w-px bg-slate-200 my-2 group-last:hidden" />
                                </div>
                                <div className="flex-1 min-w-0 bg-white border rounded-lg p-3 shadow-sm flex gap-3 relative overflow-hidden">
                                  <div className="w-16 h-16 rounded-md bg-slate-100 overflow-hidden shrink-0 hidden sm:block">
                                    <img
                                      src={stop.image}
                                      alt={stop.storeName}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-sm text-slate-900 truncate pr-6">
                                      {stop.storeName}
                                    </h4>
                                    <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                                      {stop.title}
                                    </p>
                                    <Badge
                                      variant="secondary"
                                      className="text-[10px] bg-slate-100 text-slate-600 font-medium"
                                    >
                                      {stop.category}
                                    </Badge>
                                  </div>

                                  {isEditing && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="absolute top-2 right-2 h-6 w-6 text-slate-400 hover:text-red-500 hover:bg-red-50"
                                      onClick={() =>
                                        removeActivityFromDay(dIdx, stop.id)
                                      }
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {isEditing && activeDayIndex === dIdx && (
                          <div className="p-4 bg-primary/5 border-t border-primary/10">
                            <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-dashed border-primary/30">
                              <span className="text-sm font-medium text-primary flex items-center gap-2">
                                <Search className="h-4 w-4" />
                                Browse offers in the right panel to add
                              </span>
                              <div className="h-2 w-2 rounded-full bg-primary animate-ping" />
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        )}

        {/* Floating Save Button in Edit Mode */}
        {isEditing && (
          <div className="absolute bottom-6 right-6 md:hidden z-30">
            <Button
              size="lg"
              className="rounded-full shadow-lg h-14 px-8 font-bold gap-2"
              onClick={handleSave}
            >
              <Save className="h-5 w-5" /> Save Trip
            </Button>
          </div>
        )}
      </div>

      {/* RIGHT PANEL: Discovery / Summary */}
      <div className="w-full md:w-[320px] lg:w-[380px] bg-white border-l flex flex-col shrink-0 z-20 shadow-sm h-[50vh] md:h-full hidden md:flex">
        {isEditing ? (
          <>
            <div className="p-4 border-b bg-slate-50">
              <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" /> Discover
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                Adding to{' '}
                <strong className="text-primary">
                  Day {activeDayIndex + 1}
                </strong>
              </p>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search activities, food..."
                  className="pl-9 bg-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-3">
                {discoveryCoupons.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-8">
                    No results found
                  </p>
                ) : (
                  discoveryCoupons.map((coupon) => (
                    <Card
                      key={coupon.id}
                      className="overflow-hidden hover:border-primary/50 transition-colors group"
                    >
                      <div className="h-24 relative">
                        <img
                          src={coupon.image}
                          alt={coupon.storeName}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                        <Badge className="absolute top-2 left-2 text-[10px] bg-white/90 text-slate-800 border-0">
                          {coupon.category}
                        </Badge>
                      </div>
                      <CardContent className="p-3">
                        <h4 className="font-bold text-sm truncate">
                          {coupon.storeName}
                        </h4>
                        <p className="text-xs text-muted-foreground line-clamp-1 mb-3">
                          {coupon.title}
                        </p>
                        <div className="flex justify-between items-center mt-auto">
                          <span className="text-xs font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                            {coupon.discount}
                          </span>
                          <Button
                            size="sm"
                            className="h-7 text-xs gap-1"
                            onClick={() => addActivityToDay(coupon)}
                          >
                            <Plus className="h-3 w-3" /> Add
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
            <div className="p-4 border-t bg-white">
              <Button
                className="w-full h-12 font-bold shadow-md"
                onClick={handleSave}
              >
                <Save className="h-4 w-4 mr-2" /> Save Full Itinerary
              </Button>
            </div>
          </>
        ) : viewingItinerary ? (
          <>
            <div className="p-6 border-b bg-primary/5">
              <h3 className="font-bold text-xl mb-2 text-primary">
                Trip Summary
              </h3>
              <p className="text-sm text-slate-600">
                Quick overview of your selected adventure.
              </p>
            </div>
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center">
                    <Clock className="h-6 w-6 text-blue-500 mb-2" />
                    <span className="text-xs text-muted-foreground">
                      Duration
                    </span>
                    <span className="font-bold text-lg">
                      {viewingItinerary.duration}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center">
                    <MapPin className="h-6 w-6 text-orange-500 mb-2" />
                    <span className="text-xs text-muted-foreground">Stops</span>
                    <span className="font-bold text-lg">
                      {viewingItinerary.stops?.length || 0}
                    </span>
                  </div>
                </div>

                <div className="bg-green-50 p-5 rounded-xl border border-green-100 text-center">
                  <span className="text-sm text-green-800 font-medium block mb-1">
                    Estimated Savings
                  </span>
                  <span className="text-3xl font-extrabold text-green-600">
                    {formatCurrency(viewingItinerary.totalSavings || 0)}
                  </span>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-3 text-slate-800">
                    Trip Tags
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {viewingItinerary.tags?.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="bg-slate-100 text-slate-700 hover:bg-slate-200"
                      >
                        {tag}
                      </Badge>
                    ))}
                    {(!viewingItinerary.tags ||
                      viewingItinerary.tags.length === 0) && (
                      <span className="text-xs text-muted-foreground">
                        No tags added.
                      </span>
                    )}
                  </div>
                </div>

                {viewingItinerary.authorId !== user?.id && (
                  <Button className="w-full gap-2 mt-4" variant="outline">
                    <Save className="h-4 w-4" /> Save to My Trips
                  </Button>
                )}
              </div>
            </ScrollArea>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center bg-slate-50">
            <Compass className="h-16 w-16 mb-4 opacity-20" />
            <p>Your journey details will appear here.</p>
          </div>
        )}
      </div>
    </div>
  )
}
