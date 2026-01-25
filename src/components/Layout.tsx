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

export default function Layout() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine)
  const { userLocation, savedIds, coupons } = useCouponStore()
  const { addNotification } = useNotification()
  const location = useLocation()

  // Track notifications to avoid spam
  const notifiedCoupons = useRef<Set<string>>(new Set())

  // Geo-Fencing Logic (Smart Notifications)
  useEffect(() => {
    if (!userLocation) return

    const savedCoupons = coupons.filter((c) => savedIds.includes(c.id))

    savedCoupons.forEach((coupon) => {
      // Calculate distance (simple Euclidean for demo, real app uses Haversine)
      // Lat ~ 111km per deg, Lng ~ 111km * cos(lat)
      if (!coupon.coordinates) return

      const R = 6371e3 // metres
      const φ1 = (userLocation.lat * Math.PI) / 180
      const φ2 = (coupon.coordinates.lat * Math.PI) / 180
      const Δφ = ((coupon.coordinates.lat - userLocation.lat) * Math.PI) / 180
      const Δλ = ((coupon.coordinates.lng - userLocation.lng) * Math.PI) / 180

      const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      const distance = R * c

      // If close (e.g., 500m) and not notified yet
      if (distance < 500 && !notifiedCoupons.current.has(coupon.id)) {
        addNotification({
          title: 'Oferta Próxima!',
          message: `Você está perto de ${coupon.storeName}. Aproveite ${coupon.discount}!`,
          type: 'deal',
          priority: 'high',
          category: 'smart',
          link: `/coupon/${coupon.id}`,
        })
        notifiedCoupons.current.add(coupon.id)
      }
    })
  }, [userLocation, savedIds, coupons, addNotification])

  // Expiration Alert Logic
  useEffect(() => {
    const savedCoupons = coupons.filter((c) => savedIds.includes(c.id))

    savedCoupons.forEach((coupon) => {
      const hoursLeft = differenceInHours(
        parseISO(coupon.expiryDate),
        new Date(),
      )

      const expiryKey = `${coupon.id}-exp`

      if (
        hoursLeft > 0 &&
        hoursLeft < 48 &&
        !notifiedCoupons.current.has(expiryKey)
      ) {
        addNotification({
          title: 'Expira em breve!',
          message: `Seu cupom da ${coupon.storeName} vence em menos de 48h.`,
          type: 'alert',
          priority: 'high',
          category: 'system',
          link: `/coupon/${coupon.id}`,
        })
        notifiedCoupons.current.add(expiryKey)
      }
    })
  }, [savedIds, coupons, addNotification])

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

  // Avoid showing ads on login page or admin root if needed (but requirement says every screen)
  const isAuthPage = location.pathname.includes('/login')

  return (
    <main className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      {isOffline && <OfflineIndicator />}
      <DesktopHeader />
      <MobileHeader />

      <div className="flex-1 overflow-auto md:pb-0 flex flex-col">
        {/* Top Ad Slot - Ad 1 of 2 */}
        {!isAuthPage && <AdSpace position="top" />}

        <div className="flex-1">
          <Outlet />
        </div>

        {/* Bottom Ad Slot - Ad 2 of 2 */}
        {!isAuthPage && <AdSpace position="bottom" className="mb-0 border-t" />}
      </div>

      <MobileNav />
    </main>
  )
}
