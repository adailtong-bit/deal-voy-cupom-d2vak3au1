import { Outlet } from 'react-router-dom'
import { MobileNav } from './MobileNav'
import { DesktopHeader } from './DesktopHeader'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function Layout() {
  return (
    <main className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      <DesktopHeader />
      <div className="flex-1 overflow-auto md:pb-0">
        <Outlet />
      </div>
      <MobileNav />
    </main>
  )
}
