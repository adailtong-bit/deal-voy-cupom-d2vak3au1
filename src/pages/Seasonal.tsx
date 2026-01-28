import { useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SEASONAL_EVENTS } from '@/lib/data'
import { useLanguage } from '@/stores/LanguageContext'
import { Calendar as CalendarIcon, Gift } from 'lucide-react'

export default function Seasonal() {
  const { t, formatDate } = useLanguage()
  const [date, setDate] = useState<Date | undefined>(new Date())

  const selectedEvent = SEASONAL_EVENTS.find(
    (e) => e.date.toDateString() === date?.toDateString(),
  )

  const activeEvents = SEASONAL_EVENTS.filter((e) => e.date >= new Date())

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
        <CalendarIcon className="h-8 w-8 text-primary" />
        {t('seasonal.title')}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>{t('seasonal.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border mx-auto"
              modifiers={{
                event: SEASONAL_EVENTS.map((e) => e.date),
              }}
              modifiersClassNames={{
                event: 'bg-primary/20 font-bold text-primary',
              }}
            />
          </CardContent>
        </Card>

        <div className="space-y-6">
          {selectedEvent ? (
            <Card className="border-primary bg-primary/5 animate-in fade-in zoom-in-95">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-2xl text-primary">
                    {selectedEvent.title}
                  </CardTitle>
                  <Badge variant="secondary">{selectedEvent.type}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-lg mb-4">{selectedEvent.description}</p>
                <div className="flex items-center gap-2 font-medium">
                  <CalendarIcon className="h-5 w-5" />
                  {formatDate(selectedEvent.date)}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-muted/50 border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Gift className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">{t('seasonal.title')}</p>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            <h3 className="font-bold text-lg">{t('seasonal.title')}</h3>
            {activeEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-center p-4 rounded-lg border bg-card hover:bg-accent transition-colors cursor-pointer"
                onClick={() => setDate(event.date)}
              >
                <div className="flex-1">
                  <h4 className="font-bold">{event.title}</h4>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(event.date)}
                  </p>
                </div>
                <Badge variant="outline">{event.type}</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
