import { Outlet } from 'react-router-dom'
import { DesktopHeader } from './DesktopHeader'
import { MobileHeader } from './MobileHeader'

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <DesktopHeader />
      <MobileHeader />
      <main className="flex-1 w-full relative">
        <Outlet />
      </main>
    </div>
  )
}
