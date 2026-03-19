import { useState } from 'react'
import { useCouponStore } from '@/stores/CouponContext'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Play,
  Plus,
  Globe,
  MapPin,
  CheckCircle,
  XCircle,
  Box,
} from 'lucide-react'
import { REGIONS, CATEGORIES } from '@/lib/data'
import { toast } from 'sonner'

export function PromotionCrawler() {
  const {
    user,
    crawlerSources,
    discoveredPromotions,
    addCrawlerSource,
    importPromotion,
    ignorePromotion,
    triggerScan,
  } = useCouponStore()

  const [isSourceOpen, setIsSourceOpen] = useState(false)
  const [newSource, setNewSource] = useState({
    name: '',
    url: '',
    type: 'web',
    region: user?.region || 'Global',
    scanRadius: 50,
  })
  const [importCategory, setImportCategory] = useState<string>('all')

  const isFranchisee = user?.role === 'franchisee'

  const relevantSources = isFranchisee
    ? crawlerSources.filter((s) => s.region === user?.region)
    : crawlerSources
  const relevantPromotions = isFranchisee
    ? discoveredPromotions.filter((p) => p.region === user?.region)
    : discoveredPromotions

  const handleAddSource = (e: React.FormEvent) => {
    e.preventDefault()
    addCrawlerSource({
      id: Math.random().toString(),
      ...newSource,
      type: newSource.type as any,
      status: 'active',
    })
    setIsSourceOpen(false)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Promotion Crawler & Importer</CardTitle>
          <CardDescription>
            Configure external sources to scrape and automatically import deals
            into the platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="sources">
            <TabsList className="mb-4">
              <TabsTrigger value="sources">
                <Globe className="h-4 w-4 mr-2" /> Data Sources
              </TabsTrigger>
              <TabsTrigger value="promotions">
                <Box className="h-4 w-4 mr-2" /> Discovered Deals (
                {
                  relevantPromotions.filter((p) => p.status === 'pending')
                    .length
                }
                )
              </TabsTrigger>
            </TabsList>

            <TabsContent value="sources">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Active Scrapers</h3>
                <Dialog open={isSourceOpen} onOpenChange={setIsSourceOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" /> Add Source
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Register New Source</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddSource} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Source Name</Label>
                        <Input
                          value={newSource.name}
                          onChange={(e) =>
                            setNewSource({ ...newSource, name: e.target.value })
                          }
                          required
                          placeholder="e.g. Local City Deals"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>URL / Endpoint</Label>
                        <Input
                          value={newSource.url}
                          onChange={(e) =>
                            setNewSource({ ...newSource, url: e.target.value })
                          }
                          required
                          placeholder="https://"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Source Type</Label>
                          <Select
                            value={newSource.type}
                            onValueChange={(v) =>
                              setNewSource({ ...newSource, type: v })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="web">
                                Website Scraper
                              </SelectItem>
                              <SelectItem value="api">JSON API</SelectItem>
                              <SelectItem value="app">
                                Mobile App Link
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Target Region</Label>
                          <Select
                            disabled={isFranchisee}
                            value={newSource.region}
                            onValueChange={(v) =>
                              setNewSource({ ...newSource, region: v })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {REGIONS.map((r) => (
                                <SelectItem key={r.code} value={r.code}>
                                  {r.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Scan Radius (km)</Label>
                        <Input
                          type="number"
                          value={newSource.scanRadius}
                          onChange={(e) =>
                            setNewSource({
                              ...newSource,
                              scanRadius: Number(e.target.value),
                            })
                          }
                          min={1}
                        />
                      </div>
                      <DialogFooter>
                        <Button type="submit">Save Configuration</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Source</TableHead>
                    <TableHead>Region & Radius</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Scan</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {relevantSources.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>
                        <div className="font-medium">{s.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {s.url}
                        </div>
                        <Badge
                          variant="outline"
                          className="mt-1 text-[10px] uppercase"
                        >
                          {s.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="h-3 w-3 text-muted-foreground" />{' '}
                          {s.region}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Radius: {s.scanRadius}km
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            s.status === 'active'
                              ? 'bg-green-500 hover:bg-green-600'
                              : 'bg-slate-500'
                          }
                        >
                          {s.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {s.lastScan
                          ? new Date(s.lastScan).toLocaleString()
                          : 'Never'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => triggerScan(s.id)}
                        >
                          <Play className="h-4 w-4 text-blue-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {relevantSources.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No sources configured for your region.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="promotions">
              <div className="space-y-4">
                {relevantPromotions.map((promo) => (
                  <Card key={promo.id} className="overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                      <div className="w-full md:w-48 h-32 md:h-auto relative bg-slate-100">
                        <img
                          src={promo.image}
                          alt={promo.title}
                          className="w-full h-full object-cover"
                        />
                        <Badge className="absolute top-2 left-2">
                          {promo.discount}
                        </Badge>
                      </div>
                      <div className="flex-1 p-4 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-bold text-lg">
                                {promo.title}
                              </h4>
                              <p className="text-sm font-medium text-primary">
                                {promo.storeName}
                              </p>
                            </div>
                            <Badge
                              variant={
                                promo.status === 'pending'
                                  ? 'outline'
                                  : promo.status === 'imported'
                                    ? 'default'
                                    : 'secondary'
                              }
                              className={
                                promo.status === 'imported'
                                  ? 'bg-green-500 hover:bg-green-600'
                                  : ''
                              }
                            >
                              {promo.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {promo.description}
                          </p>
                          <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                            <span>
                              Expires:{' '}
                              {new Date(promo.expiryDate).toLocaleDateString()}
                            </span>
                            <span>Region: {promo.region}</span>
                          </div>
                        </div>
                        {promo.status === 'pending' && (
                          <div className="flex flex-wrap items-center justify-between mt-4 pt-4 border-t gap-2">
                            <div className="flex items-center gap-2">
                              <Label className="text-xs">Map Category:</Label>
                              <Select
                                value={importCategory}
                                onValueChange={setImportCategory}
                              >
                                <SelectTrigger className="h-8 w-[140px] text-xs">
                                  <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                  {CATEGORIES.filter((c) => c.id !== 'all').map(
                                    (c) => (
                                      <SelectItem key={c.id} value={c.id}>
                                        {c.label}
                                      </SelectItem>
                                    ),
                                  )}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                onClick={() => ignorePromotion(promo.id)}
                              >
                                <XCircle className="h-4 w-4 mr-1" /> Ignore
                              </Button>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() =>
                                  importPromotion(
                                    promo.id,
                                    importCategory !== 'all'
                                      ? importCategory
                                      : undefined,
                                  )
                                }
                              >
                                <CheckCircle className="h-4 w-4 mr-1" /> Import
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
                {relevantPromotions.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground border border-dashed rounded-lg">
                    No promotions found. Trigger a scan from the Data Sources
                    tab.
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
