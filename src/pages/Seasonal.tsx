import { useState, useMemo } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useLanguage } from '@/stores/LanguageContext'
import { useCouponStore } from '@/stores/CouponContext'
import { Calendar as CalendarIcon, Gift, Store } from 'lucide-react'

export default function Seasonal() {
  const { t, formatDate } = useLanguage()
  const { seasonalEvents, companies, trackSeasonalClick } = useCouponStore()
  const [date, setDate] = useState<Date | undefined>(new Date())

  const activeEvents = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return seasonalEvents.filter((e) => {
      if (e.status !== 'active') return false
      const end = new Date(e.endDate)
      end.setHours(23, 59, 59, 999)
      return end >= today
    })
  }, [seasonalEvents])

  const selectedEvent = useMemo(() => {
    if (!date) return null
    // Normalize selected date to ignore time for comparison
    const searchDate = new Date(date)
    searchDate.setHours(0, 0, 0, 0)

    return activeEvents.find((e) => {
      const start = new Date(e.startDate)
      start.setHours(0, 0, 0, 0)
      const end = new Date(e.endDate)
      end.setHours(23, 59, 59, 999)
      return searchDate >= start && searchDate <= end
    })
  }, [date, activeEvents])

  const upcomingEvents = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return activeEvents.filter((e) => new Date(e.endDate) >= today)
  }, [activeEvents])

  const getCompanyName = (id?: string) => {
    if (!id) return ''
    return companies.find((c) => c.id === id)?.name || id
  }

  // Generate an array of dates to highlight on the calendar
  const highlightDates = useMemo(() => {
    const dates: Date[] = []
    activeEvents.forEach((event) => {
      let current = new Date(event.startDate)
      current.setHours(0, 0, 0, 0)
      const end = new Date(event.endDate)
      end.setHours(0, 0, 0, 0)

      while (current <= end) {
        dates.push(new Date(current))
        current.setDate(current.getDate() + 1)
      }
    })
    return dates
  }, [activeEvents])

  const handleEventClick = (eventId: string, newDate: Date) => {
    trackSeasonalClick(eventId)
    setDate(newDate)
  }

  return (
    <div className="container mx-auto px-4 py-8 mb-16 md:mb-0">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
        <CalendarIcon className="h-8 w-8 text-primary" />
        {t('seasonal.title')}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>{t('seasonal.calendar_title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => {
                if (d) {
                  setDate(d)
                  const searchDate = new Date(d)
                  searchDate.setHours(0, 0, 0, 0)
                  const ev = activeEvents.find((e) => {
                    const s = new Date(e.startDate)
                    s.setHours(0, 0, 0, 0)
                    const en = new Date(e.endDate)
                    en.setHours(23, 59, 59, 999)
                    return searchDate >= s && searchDate <= en
                  })
                  if (ev) trackSeasonalClick(ev.id)
                } else {
                  setDate(undefined)
                }
              }}
              className="rounded-md border mx-auto"
              modifiers={{
                event: highlightDates,
              }}
              modifiersClassNames={{
                event: 'bg-primary/20 font-bold text-primary',
              }}
            />
          </CardContent>
        </Card>

        <div className="space-y-6">
          {selectedEvent ? (
            <Card className="border-primary bg-primary/5 animate-in fade-in zoom-in-95 overflow-hidden">
              {selectedEvent.image && (
                <div className="w-full h-48 bg-muted relative">
                  <img
                    src={selectedEvent.image}
                    alt={selectedEvent.title}
                    className="w-full h-full object-cover"
                  />
                  {selectedEvent.images && selectedEvent.images.length > 0 && (
                    <div className="absolute bottom-2 right-2 flex gap-1">
                      {selectedEvent.images.slice(0, 3).map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt=""
                          className="w-10 h-10 border-2 border-white rounded-md object-cover shadow-sm"
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
              <CardHeader>
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <CardTitle className="text-2xl text-primary">
                      {selectedEvent.title}
                    </CardTitle>
                    {selectedEvent.companyId && (
                      <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                        <Store className="h-4 w-4" />
                        {getCompanyName(selectedEvent.companyId)}
                      </p>
                    )}
                  </div>
                  <Badge variant="secondary">{selectedEvent.type}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-lg mb-4">{selectedEvent.description}</p>
                <div className="flex items-center gap-2 font-medium text-sm">
                  <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                  {formatDate(selectedEvent.startDate)} -{' '}
                  {formatDate(selectedEvent.endDate)}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-muted/50 border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Gift className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {t(
                    'seasonal.no_event',
                    'Selecione uma data para ver os detalhes do evento.',
                  )}
                </p>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            <h3 className="font-bold text-lg">{t('seasonal.upcoming')}</h3>
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center p-4 rounded-lg border bg-card hover:bg-accent transition-colors cursor-pointer group"
                  onClick={() =>
                    handleEventClick(event.id, new Date(event.startDate))
                  }
                >
                  <div className="flex-1">
                    <h4 className="font-bold group-hover:text-primary transition-colors">
                      {event.title}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(event.startDate)} -{' '}
                      {formatDate(event.endDate)}
                    </p>
                    {event.companyId && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Por: {getCompanyName(event.companyId)}
                      </p>
                    )}
                  </div>
                  <Badge variant="outline">{event.type}</Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                {t('common.none')}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
