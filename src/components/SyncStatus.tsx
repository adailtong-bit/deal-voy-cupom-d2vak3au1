import { Cloud, Check, RefreshCw } from 'lucide-react'
import { useState, useEffect } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export function SyncStatus() {
  const [status, setStatus] = useState<'synced' | 'syncing'>('synced')

  useEffect(() => {
    // Simulate periodic background sync
    const interval = setInterval(() => {
      setStatus('syncing')
      setTimeout(() => setStatus('synced'), 2000)
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-slate-100 cursor-help transition-colors">
          {status === 'synced' ? (
            <Cloud className="h-4 w-4 text-green-500" />
          ) : (
            <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <div className="flex items-center gap-2 text-xs">
          {status === 'synced' ? (
            <>
              <Check className="h-3 w-3 text-green-500" /> Data Synced
            </>
          ) : (
            'Syncing...'
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  )
}
