import { Outlet } from 'react-router-dom'
import { MobileNav } from './MobileNav'
import { DesktopHeader } from './DesktopHeader'
import { MobileHeader } from './MobileHeader'
import { OfflineIndicator } from './OfflineIndicator'
import { useEffect, useState } from 'react'

export default function Layout() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine)

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

  return (
    <main className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      {isOffline && <OfflineIndicator />}
      <DesktopHeader />
      <MobileHeader />
      <div className="flex-1 overflow-auto md:pb-0">
        <Outlet />
      </div>
      <MobileNav />
    </main>
  )
}
