import React, { useEffect, useRef, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Loader2, MapPinOff } from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'

declare global {
  interface Window {
    google: any
    initMap?: () => void
  }
}

export interface MapMarker {
  id: string
  lat: number
  lng: number
  title: string
  category?: string
  color?: string
  icon?: string
  content?: React.ReactNode // For complex info windows, we might render to string
  data?: any
}

interface GoogleMapProps {
  apiKey?: string
  center: { lat: number; lng: number }
  zoom: number
  markers: MapMarker[]
  className?: string
  onMarkerClick?: (marker: MapMarker) => void
  fallback?: React.ReactNode
}

const DEFAULT_CENTER = { lat: -23.55052, lng: -46.633308 }

export function GoogleMap({
  apiKey,
  center,
  zoom,
  markers,
  className,
  onMarkerClick,
  fallback,
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapInstance, setMapInstance] = useState<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const markersRef = useRef<any[]>([])
  const { t } = useLanguage()

  // Helper to load Google Maps Script
  const loadScript = useCallback(() => {
    if (window.google?.maps) {
      setIsLoaded(true)
      return
    }

    const key = apiKey || import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    if (!key) {
      setError('Google Maps API Key is missing')
      return
    }

    const existingScript = document.getElementById('google-maps-script')
    if (existingScript) {
      existingScript.addEventListener('load', () => setIsLoaded(true))
      existingScript.addEventListener('error', () =>
        setError('Failed to load Google Maps script'),
      )
      return
    }

    const script = document.createElement('script')
    script.id = 'google-maps-script'
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`
    script.async = true
    script.defer = true
    script.onload = () => setIsLoaded(true)
    script.onerror = () => setError('Failed to load Google Maps script')
    document.head.appendChild(script)
  }, [apiKey])

  useEffect(() => {
    loadScript()
  }, [loadScript])

  // Initialize Map
  useEffect(() => {
    if (isLoaded && mapRef.current && !mapInstance) {
      try {
        const map = new window.google.maps.Map(mapRef.current, {
          center: center || DEFAULT_CENTER,
          zoom: zoom || 13,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels.text.fill',
              stylers: [{ color: '#747474' }],
            },
          ],
        })
        setMapInstance(map)
      } catch (err) {
        console.error('Error initializing map:', err)
        setError('Error initializing map')
      }
    }
  }, [isLoaded, mapRef, mapInstance, center, zoom])

  // Update Center & Zoom
  useEffect(() => {
    if (mapInstance && center) {
      mapInstance.panTo(center)
      mapInstance.setZoom(zoom)
    }
  }, [mapInstance, center, zoom])

  // Manage Markers
  useEffect(() => {
    if (!mapInstance || !window.google) return

    // Clear existing markers
    markersRef.current.forEach((m) => m.setMap(null))
    markersRef.current = []

    // Add new markers
    markers.forEach((marker) => {
      const pinColor =
        marker.color === 'green'
          ? 'green'
          : marker.color === 'blue'
            ? 'blue'
            : 'orange'
      const iconUrl = `https://img.usecurling.com/i?q=map-pin&color=${pinColor}&shape=fill`

      const mapMarker = new window.google.maps.Marker({
        position: { lat: marker.lat, lng: marker.lng },
        map: mapInstance,
        title: marker.title,
        icon: {
          url: iconUrl,
          scaledSize: new window.google.maps.Size(40, 40),
        },
        animation: window.google.maps.Animation.DROP,
      })

      // Info Window
      if (marker.data) {
        const infoContent = `
          <div style="width: 220px; font-family: 'Inter', sans-serif; padding: 0;">
            <div style="width: 100%; height: 120px; background-color: #f1f5f9; border-radius: 8px; overflow: hidden; margin-bottom: 8px; position: relative;">
              <img src="${marker.data.image}" style="width: 100%; height: 100%; object-fit: cover;" />
              ${marker.data.discount ? `<div style="position: absolute; top: 0; left: 0; background: #FF5722; color: white; font-size: 10px; font-weight: bold; padding: 2px 6px; border-bottom-right-radius: 6px;">${marker.data.discount}</div>` : ''}
            </div>
            <h3 style="font-weight: 700; font-size: 14px; margin: 0 0 4px 0; color: #0f172a; line-height: 1.2;">${marker.title}</h3>
            <p style="font-size: 11px; color: #64748b; margin: 0 0 8px 0; line-height: 1.4;">${marker.data.description || ''}</p>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 10px; color: #2196F3; font-weight: 600; text-transform: uppercase;">${marker.category || ''}</span>
              <button style="background: #2196F3; color: white; border: none; border-radius: 4px; padding: 4px 8px; font-size: 10px; font-weight: bold; cursor: pointer;">${t('common.view')}</button>
            </div>
          </div>
        `

        const infoWindow = new window.google.maps.InfoWindow({
          content: infoContent,
        })

        mapMarker.addListener('click', () => {
          infoWindow.open(mapInstance, mapMarker)
          if (onMarkerClick) onMarkerClick(marker)
        })
      }

      markersRef.current.push(mapMarker)
    })
  }, [mapInstance, markers, onMarkerClick, t])

  if (error && fallback) {
    return <>{fallback}</>
  }

  if (error) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center bg-slate-100 text-slate-500 p-8',
          className,
        )}
      >
        <MapPinOff className="h-10 w-10 mb-4 opacity-50" />
        <p className="text-center font-medium">{t('map.error')}</p>
        <p className="text-xs text-center mt-2 max-w-xs opacity-70">{error}</p>
      </div>
    )
  }

  return (
    <div className={cn('relative bg-slate-100 overflow-hidden', className)}>
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-50 z-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-sm text-slate-500">
            {t('map.loading')}
          </span>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full" />
    </div>
  )
}
