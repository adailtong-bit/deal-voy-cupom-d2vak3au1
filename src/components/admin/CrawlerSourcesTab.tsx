import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Play, Square, Loader2, Globe } from 'lucide-react'
import {
  startExtractionTask,
  stopExtractionTask,
  getCrawlerProgress,
  subscribeCrawler,
} from '@/lib/crawlerTask'
import { cn } from '@/lib/utils'

export function CrawlerSourcesTab() {
  const [query, setQuery] = useState('')
  const [limit, setLimit] = useState(100)

  const [progress, setProgress] = useState(getCrawlerProgress())

  useEffect(() => {
    return subscribeCrawler(() => {
      setProgress({ ...getCrawlerProgress() })
    })
  }, [])

  const handleStart = () => {
    if (!query.trim()) return
    startExtractionTask(query, limit, 'all') // 'all' source for agnostic organic search
  }

  const handleStop = () => {
    stopExtractionTask()
  }

  const percentage =
    progress.total > 0 ? (progress.current / progress.total) * 100 : 0

  return (
    <div className="space-y-6">
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Globe className="h-5 w-5 text-blue-600" />
            Agnostic Organic Search
          </CardTitle>
          <CardDescription className="text-sm">
            Search and import promotional data from any source. The crawler will
            validate links and require complete product data including Site Name
            and Country of Origin.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="text-slate-700 font-medium">Search Query</Label>
              <Input
                placeholder="e.g., Laptops, Flight Tickets, Fashion Deals..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={progress.isScanning}
                className="bg-slate-50 focus-visible:bg-white"
              />
            </div>
            <div className="space-y-3">
              <Label className="text-slate-700 font-medium">
                Maximum Items to Process
              </Label>
              <Input
                type="number"
                min={1}
                max={500}
                value={limit}
                onChange={(e) => setLimit(parseInt(e.target.value) || 100)}
                disabled={progress.isScanning}
                className="bg-slate-50 focus-visible:bg-white"
              />
            </div>
          </div>

          <div className="pt-2 flex gap-4 border-t border-slate-100">
            {!progress.isScanning ? (
              <Button
                onClick={handleStart}
                className="gap-2 w-full md:w-auto mt-4 px-6 font-semibold"
                disabled={!query.trim()}
              >
                <Play className="h-4 w-4" />
                Start Search Process
              </Button>
            ) : (
              <Button
                onClick={handleStop}
                variant="destructive"
                className="gap-2 w-full md:w-auto mt-4 px-6 font-semibold shadow-sm"
              >
                <Square className="h-4 w-4" />
                Stop Search Process
              </Button>
            )}
          </div>

          {(progress.isScanning || progress.total > 0) && (
            <div className="space-y-5 p-5 mt-6 border rounded-xl bg-slate-50 shadow-inner">
              <div className="flex items-center justify-between text-sm font-semibold text-slate-800">
                <span className="flex items-center gap-2">
                  {progress.isScanning && (
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  )}
                  {progress.isScanning
                    ? 'Executing Crawler Task...'
                    : 'Extraction Cycle Completed'}
                </span>
                <span className="text-slate-500">
                  {progress.current} / {progress.total} scanned
                </span>
              </div>

              <Progress value={percentage} className="h-2.5 bg-slate-200" />

              <div className="grid grid-cols-3 gap-4 text-center mt-6">
                <div className="p-4 bg-white rounded-lg border shadow-sm flex flex-col justify-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {progress.found}
                  </div>
                  <div className="text-xs text-slate-500 font-medium mt-1">
                    Items Found
                  </div>
                </div>
                <div className="p-4 bg-white rounded-lg border shadow-sm flex flex-col justify-center">
                  <div className="text-3xl font-bold text-emerald-600">
                    {progress.imported}
                  </div>
                  <div className="text-xs text-slate-500 font-medium mt-1">
                    Verified & Imported
                  </div>
                </div>
                <div className="p-4 bg-white rounded-lg border shadow-sm flex flex-col justify-center">
                  <div className="text-3xl font-bold text-red-500">
                    {progress.errors}
                  </div>
                  <div className="text-xs text-slate-500 font-medium mt-1">
                    Discarded (Errors)
                  </div>
                </div>
              </div>

              <div className="mt-4 bg-slate-900 text-slate-300 p-4 rounded-lg h-48 overflow-y-auto font-mono text-[11px] leading-relaxed shadow-inner border border-slate-800">
                {progress.logs.map((log, i) => (
                  <div
                    key={i}
                    className="mb-1.5 border-b border-slate-800/60 pb-1.5 break-words"
                  >
                    <span
                      className={cn(
                        'opacity-90',
                        log.includes('Fatal Error') && 'text-red-400 font-bold',
                        log.includes('Imported:') &&
                          'text-emerald-400 font-medium',
                        log.includes('Discarded') && 'text-amber-400',
                        log.includes('Initiating') &&
                          'text-blue-300 font-medium',
                        log.includes('Done.') && 'text-blue-300 font-medium',
                      )}
                    >
                      {log}
                    </span>
                  </div>
                ))}
                {progress.logs.length === 0 && (
                  <div className="opacity-40 italic">
                    Waiting for execution logs...
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
