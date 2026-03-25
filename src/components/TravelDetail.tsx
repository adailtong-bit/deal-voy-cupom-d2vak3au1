import { useState, useMemo } from 'react'
import { useCouponStore } from '@/stores/CouponContext'
import { useLanguage } from '@/stores/LanguageContext'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Trash2, Calendar, MapPin, Plus } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { TravelActivityCard } from './TravelActivityCard'
import { DiscoverActivitiesSheet } from './DiscoverActivitiesSheet'
import { Coupon } from '@/lib/types'
import { toast } from 'sonner'

export function TravelDetail({
  tripId,
  onBack,
}: {
  tripId: string
  onBack: () => void
}) {
  const { t } = useLanguage()
  const { itineraries, deleteItinerary, updateItinerary } = useCouponStore()
  const activeTrip = useMemo(
    () => itineraries.find((i) => i.id === tripId) || null,
    [itineraries, tripId],
  )
  const [activeDayId, setActiveDayId] = useState<string>(
    activeTrip?.days?.[0]?.id || '',
  )
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false)

  if (!activeTrip) return null

  const handleDeleteTrip = () => {
    deleteItinerary(activeTrip.id)
    onBack()
    toast.success(t('travel.trip_deleted', 'Roteiro deletado'))
  }

  const handleAddActivity = (coupon: Coupon) => {
    if (!activeTrip.days) return
    const updatedDays = activeTrip.days.map((day) => {
      if (day.id === activeDayId) {
        if (day.stops.find((s) => s.id === coupon.id)) {
          toast.info(
            t(
              'travel.activity_already_added',
              'Activity already added to this day',
            ),
          )
          return day
        }
        return { ...day, stops: [...day.stops, coupon] }
      }
      return day
    })
    updateItinerary({
      ...activeTrip,
      days: updatedDays,
      stops: updatedDays.flatMap((d) => d.stops),
    })
    toast.success(t('travel.activity_added', 'Activity added'))
    setIsAddSheetOpen(false)
  }

  const handleRemoveActivity = (dayId: string, stopId: string) => {
    if (!activeTrip.days) return
    const updatedDays = activeTrip.days.map((day) => {
      if (day.id === dayId) {
        return { ...day, stops: day.stops.filter((s) => s.id !== stopId) }
      }
      return day
    })
    updateItinerary({
      ...activeTrip,
      days: updatedDays,
      stops: updatedDays.flatMap((d) => d.stops),
    })
    toast.success(t('travel.activity_removed', 'Activity removed'))
  }

  const getMockTime = (index: number) => {
    const startHour = 9
    const hour = startHour + index * 2
    return `${hour > 12 ? hour - 12 : hour}:00\n${hour >= 12 ? 'PM' : 'AM'}`
  }

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-64px)] pb-20 animate-in fade-in duration-500">
      <div className="bg-white border-b sticky top-0 z-20 shadow-sm">
        <div className="container mx-auto px-4 max-w-4xl py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={onBack}
            className="gap-2 -ml-3 text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />{' '}
            {t('travel.back_to_trips', 'Voltar para Roteiros')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={handleDeleteTrip}
          >
            <Trash2 className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">
              {t('common.delete', 'Delete')}
            </span>
          </Button>
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
                <Calendar className="h-4 w-4 text-primary" />{' '}
                {activeTrip.duration}
              </span>
              <span className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full shadow-sm border">
                <MapPin className="h-4 w-4 text-orange-500" />{' '}
                {activeTrip.stops.length}{' '}
                {t('travel.total_activities', 'Total Activities')}
              </span>
            </div>
          </div>
        </div>

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
                    {t('travel.day', 'Day')} {day.dayNumber}
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
                    {t('travel.activities_for_day', 'Activities for Day')}{' '}
                    {day.dayNumber}
                  </h3>
                  <Button
                    onClick={() => setIsAddSheetOpen(true)}
                    className="gap-2 bg-primary hover:bg-primary/90"
                  >
                    <Plus className="h-4 w-4" />{' '}
                    {t('travel.add_activity', 'Add Activity')}
                  </Button>
                </div>

                {day.stops.length === 0 ? (
                  <div className="text-center py-16 bg-slate-50 border-2 border-dashed rounded-xl">
                    <MapPin className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-lg font-medium text-slate-700">
                      {t('travel.empty_day', 'Your day is empty')}
                    </p>
                    <p className="text-slate-500 mb-6">
                      {t(
                        'travel.empty_day_desc',
                        'Add places to visit, restaurants, or events.',
                      )}
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setIsAddSheetOpen(true)}
                    >
                      {t('travel.browse_discoveries', 'Browse Discoveries')}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {day.stops.map((stop, idx) => (
                      <TravelActivityCard
                        key={`${stop.id}-${idx}`}
                        stop={stop}
                        dayId={day.id}
                        mockTime={getMockTime(idx)}
                        onRemove={handleRemoveActivity}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
      <DiscoverActivitiesSheet
        isOpen={isAddSheetOpen}
        onClose={() => setIsAddSheetOpen(false)}
        onAdd={handleAddActivity}
      />
    </div>
  )
}
