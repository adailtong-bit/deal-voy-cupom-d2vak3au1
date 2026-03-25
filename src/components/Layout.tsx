import { Outlet } from 'react-router-dom'
import { DesktopHeader } from './DesktopHeader'
import { MobileHeader } from './MobileHeader'
import { ProximityAlertsToggle } from './ProximityAlertsToggle'

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen bg-background relative">
      <DesktopHeader />
      <MobileHeader />
      <main className="flex-1 w-full relative">
        <Outlet />
      </main>
      <ProximityAlertsToggle />
    </div>
  )
}
