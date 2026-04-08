import { Outlet } from 'react-router-dom'
import { DesktopHeader } from './DesktopHeader'
import { MobileHeader } from './MobileHeader'
import { ProximityAlertsToggle } from './ProximityAlertsToggle'
import { DevNavigation } from './DevNavigation'

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-x-hidden w-full max-w-[100vw]">
      <DesktopHeader />
      <MobileHeader />
      <main className="flex-1 w-full min-w-0 relative max-w-full overflow-x-hidden">
        <Outlet />
      </main>
      <ProximityAlertsToggle />

      {/* Botões flutuantes para o Admin transitar de forma fácil entre ambientes */}
      <DevNavigation />
    </div>
  )
}
