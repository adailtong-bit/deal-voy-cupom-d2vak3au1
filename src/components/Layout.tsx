import { Outlet, useLocation } from 'react-router-dom'
import { MobileNav } from './MobileNav'
import { DesktopHeader } from './DesktopHeader'
import { MobileHeader } from './MobileHeader'
import { OfflineIndicator } from './OfflineIndicator'
import { useEffect, useState, useRef } from 'react'
import { AdSpace } from './AdSpace'
import { useCouponStore } from '@/stores/CouponContext'
import { useNotification } from '@/stores/NotificationContext'
import { differenceInHours, parseISO } from 'date-fns'
import { SEASONAL_EVENTS } from '@/lib/data'
import { useLanguage } from '@/stores/LanguageContext'

export default function Layout() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine)
  const { userLocation, savedIds, coupons, activeItineraryId, itineraries } =
    useCouponStore()
  const { addNotification } = useNotification()
  const location = useLocation()
  const { t } = useLanguage()

  const notifiedCoupons = useRef<Set<string>>(new Set())

  const calculateDistance = (
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ) => {
    const R = 6371e3
    const φ1 = (lat1 * Math.PI) / 180
    const φ2 = (lat2 * Math.PI) / 180
    const Δφ = ((lat2 - lat1) * Math.PI) / 180
    const Δλ = ((lng2 - lng1) * Math.PI) / 180

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // Effect for Proximity Alerts (Saved Coupons AND Active Route Stops)
  useEffect(() => {
    if (!userLocation) return

    // 1. Check Saved Coupons
    const savedCoupons = coupons.filter((c) => savedIds.includes(c.id))

    // 2. Check Active Route Stops (if any)
    const activeRoute = itineraries.find((i) => i.id === activeItineraryId)
    const activeStops = activeRoute ? activeRoute.stops : []

    // Merge lists to check
    const couponsToCheck = [...savedCoupons, ...activeStops]
    // Deduplicate by ID
    const uniqueCoupons = Array.from(
      new Map(couponsToCheck.map((item) => [item.id, item])).values(),
    )

    uniqueCoupons.forEach((coupon) => {
      if (!coupon.coordinates) return

      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        coupon.coordinates.lat,
        coupon.coordinates.lng,
      )

      // 500m radius
      if (distance < 500 && !notifiedCoupons.current.has(coupon.id)) {
        const isRouteStop = activeStops.some((s) => s.id === coupon.id)
        const message = isRouteStop
          ? `${t('travel.stop_nearby')}: ${coupon.storeName}`
          : `${t('coupon.distance')}: ${coupon.storeName}!`

        addNotification({
          title: isRouteStop
            ? t('travel.route_alert')
            : t('notifications.title'),
          message: message,
          type: isRouteStop ? 'alert' : 'deal',
          priority: 'high',
          category: 'smart',
          link: `/coupon/${coupon.id}`,
        })
        notifiedCoupons.current.add(coupon.id)
      }
    })

    SEASONAL_EVENTS.forEach((event) => {
      if (!event.coordinates) return

      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        event.coordinates.lat,
        event.coordinates.lng,
      )

      const eventKey = `event-${event.id}`

      if (distance < 1000 && !notifiedCoupons.current.has(eventKey)) {
        addNotification({
          title: t('seasonal.title'),
          message: `${event.title}`,
          type: 'event',
          priority: 'medium',
          category: 'smart',
          link: `/seasonal`,
        })
        notifiedCoupons.current.add(eventKey)
      }
    })
  }, [
    userLocation,
    savedIds,
    coupons,
    activeItineraryId,
    itineraries,
    addNotification,
    t,
  ])

  useEffect(() => {
    const savedCoupons = coupons.filter((c) => savedIds.includes(c.id))

    savedCoupons.forEach((coupon) => {
      if (!coupon.expiryDate) return
      const hoursLeft = differenceInHours(
        parseISO(coupon.expiryDate),
        new Date(),
      )

      const expiryKey = `${coupon.id}-exp`

      if (
        hoursLeft > 0 &&
        hoursLeft < 24 &&
        !notifiedCoupons.current.has(expiryKey)
      ) {
        addNotification({
          title: t('notifications.title'),
          message: `${coupon.storeName}: ${t('coupon.expires')}`,
          type: 'alert',
          priority: 'high',
          category: 'system',
          link: `/coupon/${coupon.id}`,
        })
        notifiedCoupons.current.add(expiryKey)
      }
    })
  }, [savedIds, coupons, addNotification, t])

  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const isAuthPage = location.pathname.includes('/login')

  return (
    <main className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      {isOffline && <OfflineIndicator />}
      <DesktopHeader />
      <MobileHeader />

      <div className="flex-1 overflow-hidden flex flex-col pb-16 md:pb-0 relative">
        {!isAuthPage && location.pathname !== '/travel-planner' && (
          <AdSpace position="top" />
        )}

        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>

        {!isAuthPage && location.pathname !== '/travel-planner' && (
          <AdSpace position="bottom" className="mb-0 border-t" />
        )}
      </div>

      <MobileNav />
    </main>
  )
}
