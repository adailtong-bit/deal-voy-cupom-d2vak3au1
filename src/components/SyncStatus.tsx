import { useState, useEffect } from 'react'
import { Cloud, CloudOff, CloudDownload, RotateCw } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useCouponStore } from '@/stores/CouponContext'
import { cn } from '@/lib/utils'

export function SyncStatus() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine)
  const { isDownloading, downloadProgress } = useCouponStore()

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

  if (isDownloading) {
    return (
      <div className="flex items-center gap-2 text-primary animate-pulse">
        <CloudDownload className="h-5 w-5" />
        <span className="text-xs font-bold hidden md:inline-block">
          Syncing {downloadProgress}%
        </span>
      </div>
    )
  }

  if (isOffline) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 text-muted-foreground opacity-70">
            <CloudOff className="h-5 w-5" />
            <span className="text-xs hidden md:inline-block">Pending</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Offline - Data pending synchronization</p>
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-2 text-green-600">
          <Cloud className="h-5 w-5" />
          <div className="absolute -right-1 -top-1 bg-background rounded-full">
            <RotateCw className="h-3 w-3 text-green-600" />
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>All data synchronized</p>
      </TooltipContent>
    </Tooltip>
  )
}
