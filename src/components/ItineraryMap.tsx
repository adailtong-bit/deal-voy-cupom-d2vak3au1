import { useMemo } from 'react'
import { useLanguage } from '@/stores/LanguageContext'
import { useCouponStore } from '@/stores/CouponContext'
import { useRegionFormatting } from '@/hooks/useRegionFormatting'
import { DayPlan } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import {
  Navigation,
  MapPin,
  Map as MapIcon,
  Compass,
  MapPinned,
} from 'lucide-react'

interface ItineraryMapProps {
  day?: DayPlan
}

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371 // km
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export function ItineraryMap({ day }: ItineraryMapProps) {
  const { t } = useLanguage()
  const { userLocation } = useCouponStore()
  const { formatDistance } = useRegionFormatting()

  const mapData = useMemo(() => {
    if (!day || day.stops.length === 0) return null

    const points: any[] = []

    if (userLocation) {
      points.push({
        id: 'start',
        type: 'start',
        lat: userLocation.lat,
        lng: userLocation.lng,
        title: t('travel.departure', 'Ponto de Partida'),
      })
    }

    day.stops.forEach((stop, idx) => {
      if (stop.coordinates) {
        points.push({
          id: stop.id,
          type: 'stop',
          lat: stop.coordinates.lat,
          lng: stop.coordinates.lng,
          index: idx + 1,
          stop,
        })
      }
    })

    if (points.length === 0) return null

    let minLat = points[0].lat
    let maxLat = points[0].lat
    let minLng = points[0].lng
    let maxLng = points[0].lng

    points.forEach((p) => {
      minLat = Math.min(minLat, p.lat)
      maxLat = Math.max(maxLat, p.lat)
      minLng = Math.min(minLng, p.lng)
      maxLng = Math.max(maxLng, p.lng)
    })

    const isSinglePoint = maxLat === minLat && maxLng === minLng

    const latRange = Math.max(maxLat - minLat, 0.001)
    const lngRange = Math.max(maxLng - minLng, 0.001)

    const PAD = 15
    const size = 100 - PAD * 2

    const mappedPoints = points.map((p) => {
      if (isSinglePoint) {
        return { ...p, x: 50, y: 50 }
      }
      return {
        ...p,
        x: PAD + ((p.lng - minLng) / lngRange) * size,
        y: PAD + ((maxLat - p.lat) / latRange) * size,
      }
    })

    let totalDistance = 0
    for (let i = 0; i < points.length - 1; i++) {
      totalDistance += getDistance(
        points[i].lat,
        points[i].lng,
        points[i + 1].lat,
        points[i + 1].lng,
      )
    }

    return {
      points: mappedPoints,
      totalDistance,
    }
  }, [day, userLocation, t])

  if (!day) return null

  return (
    <Card className="overflow-hidden border-slate-200 shadow-md">
      <CardHeader className="bg-slate-50 border-b border-slate-100 py-4 px-5">
        <CardTitle className="text-lg flex items-center gap-2">
          <MapIcon className="h-5 w-5 text-primary" />
          {t('travel.daily_route', 'Rota do Dia')} {day.dayNumber}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 relative">
        {!mapData ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 p-6 text-center">
            <MapPinned className="h-12 w-12 mb-3 text-slate-300" />
            <p>
              {t(
                'travel.map_no_data',
                'Adicione atividades para ver a rota no mapa.',
              )}
            </p>
          </div>
        ) : (
          <>
            <div className="h-72 w-full bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] bg-slate-50 relative overflow-hidden">
              <svg
                viewBox="0 0 100 100"
                className="absolute inset-0 w-full h-full pointer-events-none"
                preserveAspectRatio="none"
              >
                <polyline
                  points={mapData.points.map((p) => `${p.x},${p.y}`).join(' ')}
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="0.75"
                  strokeDasharray="2 1.5"
                  className="opacity-70"
                />
              </svg>

              {mapData.points.map((p) => (
                <div
                  key={p.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
                  style={{ left: `${p.x}%`, top: `${p.y}%` }}
                >
                  {p.type === 'start' ? (
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="h-8 w-8 bg-slate-800 text-white rounded-full flex items-center justify-center border-[3px] border-white shadow-md hover:scale-110 transition-transform">
                          <MapPin className="h-4 w-4" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent side="top" className="w-auto p-3">
                        <p className="font-bold text-sm">{p.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {t('travel.current_location', 'Ponto de partida')}
                        </p>
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="h-8 w-8 bg-primary text-white font-bold text-sm rounded-full flex items-center justify-center border-[3px] border-white shadow-md hover:scale-110 transition-transform ring-2 ring-primary/10">
                          {p.index}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent
                        side="top"
                        className="w-64 p-0 overflow-hidden shadow-xl border-slate-200"
                      >
                        <div className="h-24 bg-slate-200 relative">
                          <img
                            src={p.stop.image}
                            alt={p.stop.storeName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-4">
                          <h4 className="font-bold text-sm leading-tight mb-1">
                            {p.stop.storeName}
                          </h4>
                          <p className="text-xs text-slate-500 line-clamp-2 mb-4">
                            {p.stop.title}
                          </p>
                          <Button
                            asChild
                            size="sm"
                            className="w-full gap-2 h-9 text-xs font-semibold shadow-sm"
                          >
                            <a
                              href={`https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}${userLocation ? `&origin=${userLocation.lat},${userLocation.lng}` : ''}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Navigation className="h-3.5 w-3.5" />{' '}
                              {t('travel.navigate', 'Navegar no Maps')}
                            </a>
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
              ))}
            </div>

            <div className="bg-white border-t border-slate-100 p-3.5 flex justify-between items-center text-sm">
              <span className="text-slate-600 flex items-center gap-1.5 font-medium">
                <Compass className="h-4 w-4 text-slate-400" />
                {t('travel.total_distance', 'Distância Estimada da Rota')}
              </span>
              <span className="font-extrabold text-slate-800 bg-slate-100 px-2 py-1 rounded-md">
                {formatDistance(mapData.totalDistance)}
              </span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
