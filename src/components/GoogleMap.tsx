import React from 'react'
import { cn } from '@/lib/utils'
import { MapPinOff } from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'

export interface MapMarker {
  id: string
  lat: number
  lng: number
  title: string
  category?: string
  color?: string
  icon?: string
  content?: React.ReactNode
  data?: any
  highlight?: boolean
}

interface GoogleMapProps {
  apiKey?: string
  center: { lat: number; lng: number }
  zoom: number
  markers: MapMarker[]
  className?: string
  onMarkerClick?: (marker: MapMarker) => void
  fallback?: React.ReactNode
  origin?: string
  destination?: string
}

export function GoogleMap({
  center,
  zoom,
  className,
  origin,
  destination,
}: GoogleMapProps) {
  const { t } = useLanguage()

  // Use iframe embedding as a robust, non-API-key dependent solution for displaying the map
  const getEmbedUrl = () => {
    const baseUrl = 'https://maps.google.com/maps'
    const params = new URLSearchParams()

    // If destination is provided, search for it
    if (destination) {
      params.append('q', destination)
    } else {
      // Otherwise use lat/lng
      params.append('q', `${center.lat},${center.lng}`)
    }

    params.append('t', 'm') // map type
    params.append('z', zoom.toString())
    params.append('ie', 'UTF8')
    params.append('iwloc', '') // hide info window initially
    params.append('output', 'embed')

    return `${baseUrl}?${params.toString()}`
  }

  // Construct external link for navigation
  const getExternalLink = () => {
    const baseUrl = 'https://www.google.com/maps/dir/'
    const originParam = origin ? encodeURIComponent(origin) : ''
    const destParam = destination
      ? encodeURIComponent(destination)
      : `${center.lat},${center.lng}`
    return `${baseUrl}${originParam}/${destParam}`
  }

  return (
    <div
      className={cn('relative bg-slate-100 overflow-hidden group', className)}
    >
      <iframe
        width="100%"
        height="100%"
        frameBorder="0"
        scrolling="no"
        marginHeight={0}
        marginWidth={0}
        src={getEmbedUrl()}
        title="Google Map"
        className="w-full h-full"
      />

      {/* Overlay to allow opening in new tab for real navigation */}
      <a
        href={getExternalLink()}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-2 left-2 bg-white/90 px-2 py-1 text-[10px] text-blue-600 font-bold rounded shadow hover:bg-white z-10"
      >
        {origin && destination
          ? 'Ver Rota no Google Maps'
          : 'Ver no Google Maps'}
      </a>

      {/* Since iframe doesn't support custom markers overlay easily without API, 
          we show a subtle indicator that this is an embedded view */}
      <div className="absolute top-2 right-2 bg-white/80 backdrop-blur px-2 py-1 rounded text-[10px] text-slate-500 shadow-sm pointer-events-none">
        Map View
      </div>
    </div>
  )
}
