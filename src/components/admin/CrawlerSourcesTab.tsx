import { useState, useRef, useEffect } from 'react'
import { useLanguage } from '@/stores/LanguageContext'
import { useToast } from '@/hooks/use-toast'
import {
  fetchWebSearchPromotions,
  saveDiscoveredPromotion,
  saveCrawlerLog,
} from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  Play,
  StopCircle,
  CheckCircle2,
  AlertTriangle,
  Globe,
} from 'lucide-react'

export function CrawlerSourcesTab() {
  const { t } = useLanguage()
  const { toast } = useToast()

  const [isScanning, setIsScanning] = useState(
    () => sessionStorage.getItem('crawler_isScanning') === 'true',
  )
  const [query, setQuery] = useState('')
  const [source, setSource] = useState('all')
  const [limit, setLimit] = useState(20)

  const [progress, setProgress] = useState({
    total: 0,
    current: 0,
    found: 0,
    imported: 0,
    errors: 0,
    logs: [] as string[],
  })

  const abortControllerRef = useRef<AbortController | null>(null)

  // Session-Stable Batch Processing: store scanning state so navigation doesn't disrupt it conceptually
  useEffect(() => {
    sessionStorage.setItem('crawler_isScanning', isScanning.toString())
  }, [isScanning])

  // Cleanup on unmount if it was running
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        // We don't abort on unmount to allow background extraction as per AC:
        // "Auth Bypass for Background Tasks: The extraction routine must run independently..."
      }
    }
  }, [])

  const startExtraction = async () => {
    if (!query.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a search query.',
        variant: 'destructive',
      })
      return
    }

    setIsScanning(true)
    setProgress({
      total: limit,
      current: 0,
      found: 0,
      imported: 0,
      errors: 0,
      logs: [],
    })
    abortControllerRef.current = new AbortController()
    const errorDetails: string[] = []

    try {
      addLog('Initiating Real-Time Marketplace Connector...')

      // 1. Fetch from connectors
      const items = await fetchWebSearchPromotions(query, limit, {
        platform: source === 'all' ? undefined : source,
      })

      const itemsFound = items.length
      setProgress((p) => ({ ...p, found: itemsFound }))
      addLog(`Extracted ${itemsFound} raw items. Validating...`)

      let itemsImported = 0
      let itemsDiscarded = 0

      // 2. Atomic Persistence Sync & Mandatory Field Validation
      for (let i = 0; i < items.length; i++) {
        if (abortControllerRef.current?.signal.aborted) {
          errorDetails.push('Extraction aborted by user.')
          break
        }

        setProgress((p) => ({ ...p, current: i + 1 }))
        const item = items[i]
        const missingFields = []

        if (!item.title?.trim()) missingFields.push('Title')
        if (item.price === undefined || item.price === null || item.price <= 0)
          missingFields.push('Price')
        if (!item.image?.trim() || !item.image.startsWith('http'))
          missingFields.push('Image URL')
        if (!item.sourceUrl?.trim() || !item.sourceUrl.startsWith('http'))
          missingFields.push('Direct Product Link')

        if (missingFields.length > 0) {
          itemsDiscarded++
          const errMsg = `Discarded Item [Index ${i}]: Missing/Invalid fields (${missingFields.join(', ')})`
          errorDetails.push(errMsg)
          addLog(errMsg)
          setProgress((p) => ({ ...p, errors: itemsDiscarded }))
          continue
        }

        try {
          // Atomic import
          await saveDiscoveredPromotion(item)
          itemsImported++
          setProgress((p) => ({ ...p, imported: itemsImported }))
        } catch (err: any) {
          itemsDiscarded++
          const errMsg = `Failed to save "${item.title}": ${err.message}`
          errorDetails.push(errMsg)
          addLog(errMsg)
          setProgress((p) => ({ ...p, errors: itemsDiscarded }))
        }
      }

      // 3. Save detailed error logs
      addLog('Finalizing batch execution and generating audit logs...')
      await saveCrawlerLog({
        date: new Date().toISOString(),
        storeName: source === 'all' ? 'All Connectors' : source,
        status:
          errorDetails.length > 0
            ? itemsImported > 0
              ? 'warning'
              : 'error'
            : 'success',
        itemsFound,
        itemsImported,
        sourceId: `connector_${source.toLowerCase()}`,
        errorMessage:
          errorDetails.length > 0
            ? `Extraction completed with ${errorDetails.length} errors/discards.`
            : undefined,
        errorDetails: errorDetails,
      })

      toast({
        title: 'Extraction Complete',
        description: `${itemsFound} Found, ${itemsImported} Imported, ${itemsDiscarded} Invalid/Discarded.`,
      })
      addLog(
        `Done. ${itemsFound} Found, ${itemsImported} Imported, ${itemsDiscarded} Invalid/Discarded.`,
      )
    } catch (err: any) {
      toast({
        title: 'Extraction Failed',
        description: err.message,
        variant: 'destructive',
      })
      addLog(`Fatal Error: ${err.message}`)
      await saveCrawlerLog({
        date: new Date().toISOString(),
        storeName: source,
        status: 'error',
        itemsFound: 0,
        itemsImported: 0,
        sourceId: `connector_${source.toLowerCase()}`,
        errorMessage: err.message,
        errorDetails: [err.message],
      })
    } finally {
      setIsScanning(false)
      abortControllerRef.current = null
      sessionStorage.setItem('crawler_isScanning', 'false')
    }
  }

  const stopExtraction = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    setIsScanning(false)
    sessionStorage.setItem('crawler_isScanning', 'false')
    addLog('Extraction manually aborted.')
  }

  const addLog = (msg: string) => {
    setProgress((p) => ({
      ...p,
      logs: [`[${new Date().toLocaleTimeString()}] ${msg}`, ...p.logs].slice(
        0,
        50,
      ),
    }))
  }

  const progressPercentage =
    progress.total > 0 ? (progress.current / progress.total) * 100 : 0

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Real-Time Marketplace Connectors</CardTitle>
          <CardDescription>
            Extract live deals directly from Amazon, Walmart, and Target.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label>Search Query</Label>
              <Input
                placeholder="e.g. Laptops, Headphones..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={isScanning}
              />
            </div>
            <div className="space-y-2">
              <Label>Target Marketplace</Label>
              <Select
                value={source}
                onValueChange={setSource}
                disabled={isScanning}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Marketplaces</SelectItem>
                  <SelectItem value="Amazon">Amazon</SelectItem>
                  <SelectItem value="Walmart">Walmart</SelectItem>
                  <SelectItem value="Target">Target</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Batch Limit (Max 100)</Label>
              <Input
                type="number"
                min={1}
                max={100}
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                disabled={isScanning}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {!isScanning ? (
              <Button onClick={startExtraction} className="w-full sm:w-auto">
                <Play className="w-4 h-4 mr-2" />
                Start Extraction
              </Button>
            ) : (
              <Button
                onClick={stopExtraction}
                variant="destructive"
                className="w-full sm:w-auto animate-pulse"
              >
                <StopCircle className="w-4 h-4 mr-2" />
                Stop Extraction
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {(isScanning || progress.total > 0) && (
        <Card className="animate-in fade-in slide-in-from-bottom-4">
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Extraction Status</span>
              {isScanning && (
                <span className="text-sm text-muted-foreground flex items-center">
                  <Globe className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>
                  Processing item {progress.current} of {progress.total}
                </span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-50 p-4 rounded-lg border text-center">
                <p className="text-sm text-muted-foreground font-medium mb-1">
                  Raw Found
                </p>
                <p className="text-2xl font-bold">{progress.found}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-100 text-center">
                <p className="text-sm text-green-600 font-medium mb-1 flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Imported
                </p>
                <p className="text-2xl font-bold text-green-700">
                  {progress.imported}
                </p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg border border-red-100 text-center">
                <p className="text-sm text-red-600 font-medium mb-1 flex items-center justify-center gap-1">
                  <AlertTriangle className="w-4 h-4" /> Discarded
                </p>
                <p className="text-2xl font-bold text-red-700">
                  {progress.errors}
                </p>
              </div>
            </div>

            <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-xs h-48 overflow-y-auto space-y-1">
              {progress.logs.map((log, i) => (
                <div key={i} className="opacity-90">
                  {log}
                </div>
              ))}
              {progress.logs.length === 0 && (
                <div className="text-muted-foreground">Waiting for logs...</div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
