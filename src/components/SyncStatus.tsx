import { Cloud, RefreshCw, CheckCircle2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export function SyncStatus() {
  const [status, setStatus] = useState<'idle' | 'syncing' | 'synced'>('idle')

  useEffect(() => {
    // Simulate periodic data linking logic (User Story requirement)
    const interval = setInterval(() => {
      setStatus('syncing')
      setTimeout(() => setStatus('synced'), 2000)
      setTimeout(() => setStatus('idle'), 5000)
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 cursor-help transition-colors">
          {status === 'syncing' ? (
            <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
          ) : status === 'synced' ? (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          ) : (
            <Cloud className="h-4 w-4 text-slate-400" />
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>
          {status === 'syncing'
            ? 'Sincronizando dados com parceiros...'
            : status === 'synced'
              ? 'Dados atualizados e vinculados.'
              : 'Conectado à nuvem Deal Voy.'}
        </p>
      </TooltipContent>
    </Tooltip>
  )
}
