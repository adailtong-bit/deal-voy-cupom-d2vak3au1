import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
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
import {
  getCrawlerProgress,
  startExtractionTask,
  stopExtractionTask,
  subscribeCrawler,
} from '@/lib/crawlerTask'

export function CrawlerSourcesTab() {
  const { toast } = useToast()

  const [query, setQuery] = useState('')
  const [source, setSource] = useState('all')
  const [limit, setLimit] = useState(20)

  const [progress, setProgress] = useState(getCrawlerProgress())

  // Subscribe to background crawler task updates decoupling UI from extraction logic
  useEffect(() => {
    const unsubscribe = subscribeCrawler(() => {
      setProgress({ ...getCrawlerProgress() })
    })
    return unsubscribe
  }, [])

  const handleStart = async () => {
    if (!query.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a search query.',
        variant: 'destructive',
      })
      return
    }
    startExtractionTask(query, limit, source)
  }

  const progressPercentage =
    progress.total > 0 ? (progress.current / progress.total) * 100 : 0

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>General Organic Crawler</CardTitle>
          <CardDescription>
            Execute flexible organic searches across the web to discover and
            validate real deals.
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
                disabled={progress.isScanning}
              />
            </div>
            <div className="space-y-2">
              <Label>Search Scope</Label>
              <Select
                value={source}
                onValueChange={setSource}
                disabled={progress.isScanning}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Organic Web Search</SelectItem>
                  <SelectItem value="google_shopping">
                    Google Shopping API
                  </SelectItem>
                  <SelectItem value="local_deals">
                    Local Deals Directory
                  </SelectItem>
                  <SelectItem value="social_media">
                    Social Media Scraper
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Batch Limit</Label>
              <Input
                type="number"
                min={1}
                max={100}
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                disabled={progress.isScanning}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {!progress.isScanning ? (
              <Button onClick={handleStart} className="w-full sm:w-auto">
                <Play className="w-4 h-4 mr-2" />
                Start Extraction
              </Button>
            ) : (
              <Button
                onClick={stopExtractionTask}
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

      {(progress.isScanning || progress.total > 0) && (
        <Card className="animate-in fade-in slide-in-from-bottom-4">
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Extraction Status</span>
              {progress.isScanning && (
                <span className="text-sm text-muted-foreground flex items-center">
                  <Globe className="w-4 h-4 mr-2 animate-spin" />
                  Connecting & Validating...
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
