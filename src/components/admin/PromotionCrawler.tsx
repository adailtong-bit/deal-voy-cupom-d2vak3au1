import { useState, useEffect } from 'react'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
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
  Edit,
  Trash2,
  AlertCircle,
} from 'lucide-react'
import { REGIONS, CATEGORIES } from '@/lib/data'
import { CrawlerSource } from '@/lib/types'

export function PromotionCrawler() {
  const {
    user,
    crawlerSources,
    discoveredPromotions,
    addCrawlerSource,
    updateCrawlerSource,
    deleteCrawlerSource,
    importPromotion,
    ignorePromotion,
    triggerScan,
  } = useCouponStore()

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingSource, setEditingSource] = useState<CrawlerSource | null>(null)
  const [deletingSourceId, setDeletingSourceId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
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

  useEffect(() => {
    if (editingSource) {
      setFormData({
        name: editingSource.name,
        url: editingSource.url,
        type: editingSource.type,
        region: editingSource.region,
        scanRadius: editingSource.scanRadius,
      })
    } else {
      setFormData({
        name: '',
        url: '',
        type: 'web',
        region: user?.region || 'Global',
        scanRadius: 50,
      })
    }
  }, [editingSource, user])

  const handleSaveSource = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingSource) {
      updateCrawlerSource(editingSource.id, {
        ...formData,
        type: formData.type as any,
      })
      setEditingSource(null)
    } else {
      addCrawlerSource({
        id: Math.random().toString(),
        ...formData,
        type: formData.type as any,
        status: 'active',
      })
      setIsAddOpen(false)
    }
  }

  const handleDeleteSource = () => {
    if (deletingSourceId) {
      deleteCrawlerSource(deletingSourceId)
      setDeletingSourceId(null)
    }
  }

  const SourceForm = () => (
    <form onSubmit={handleSaveSource} className="space-y-4">
      <div className="space-y-2">
        <Label>Source Name</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          placeholder="e.g. Local City Deals"
        />
      </div>
      <div className="space-y-2">
        <Label>URL / Endpoint</Label>
        <Input
          value={formData.url}
          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          required
          placeholder="https://"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Source Type</Label>
          <Select
            value={formData.type}
            onValueChange={(v) => setFormData({ ...formData, type: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="web">Website Scraper</SelectItem>
              <SelectItem value="api">JSON API</SelectItem>
              <SelectItem value="app">Mobile App Link</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Target Region</Label>
          <Select
            disabled={isFranchisee}
            value={formData.region}
            onValueChange={(v) => setFormData({ ...formData, region: v })}
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
          value={formData.scanRadius}
          onChange={(e) =>
            setFormData({
              ...formData,
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
  )

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
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" /> Add Source
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Register New Source</DialogTitle>
                    </DialogHeader>
                    <SourceForm />
                  </DialogContent>
                </Dialog>
              </div>

              <Dialog
                open={!!editingSource}
                onOpenChange={(open) => !open && setEditingSource(null)}
              >
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Source</DialogTitle>
                  </DialogHeader>
                  <SourceForm />
                </DialogContent>
              </Dialog>

              <AlertDialog
                open={!!deletingSourceId}
                onOpenChange={(open) => !open && setDeletingSourceId(null)}
              >
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete the crawler source
                      configuration and stop future scans from this origin.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteSource}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Source</TableHead>
                    <TableHead>Region & Radius</TableHead>
                    <TableHead>Status & Logs</TableHead>
                    <TableHead>Last Scan</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {relevantSources.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>
                        <div className="font-medium">{s.name}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-[200px]">
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
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            className={
                              s.status === 'active'
                                ? 'bg-green-500 hover:bg-green-600'
                                : 'bg-slate-500'
                            }
                          >
                            {s.status}
                          </Badge>
                          {s.lastStatus === 'error' && (
                            <Badge variant="destructive">Error</Badge>
                          )}
                          {s.lastStatus === 'warning' && (
                            <Badge
                              variant="secondary"
                              className="text-orange-500 border-orange-200"
                            >
                              Warning
                            </Badge>
                          )}
                          {s.lastStatus === 'success' && (
                            <Badge
                              variant="outline"
                              className="border-green-500 text-green-600"
                            >
                              OK
                            </Badge>
                          )}
                          {s.lastStatus === 'scanning' && (
                            <Badge
                              variant="outline"
                              className="animate-pulse border-blue-500 text-blue-600"
                            >
                              Scanning...
                            </Badge>
                          )}
                        </div>
                        {s.lastErrorMessage && s.lastStatus !== 'success' && (
                          <div className="text-xs text-red-500 flex items-start gap-1 max-w-[250px] bg-red-50 p-1 rounded">
                            <AlertCircle className="h-3 w-3 shrink-0 mt-0.5" />
                            <span className="leading-tight">
                              {s.lastErrorMessage}
                            </span>
                          </div>
                        )}
                        {s.lastErrorMessage && s.lastStatus === 'success' && (
                          <div className="text-xs text-green-600 flex items-start gap-1 max-w-[250px]">
                            <CheckCircle className="h-3 w-3 shrink-0 mt-0.5" />
                            <span className="leading-tight">
                              {s.lastErrorMessage}
                            </span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {s.lastScan
                          ? new Date(s.lastScan).toLocaleString()
                          : 'Never'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => triggerScan(s.id)}
                            disabled={s.lastStatus === 'scanning'}
                            title="Force Scan"
                          >
                            <Play className="h-4 w-4 text-blue-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingSource(s)}
                            title="Edit Source"
                          >
                            <Edit className="h-4 w-4 text-slate-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeletingSourceId(s.id)}
                            title="Delete Source"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
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
                      <div className="w-full md:w-48 h-32 md:h-auto relative bg-slate-100 shrink-0">
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
                                  ? 'bg-green-500 hover:bg-green-600 text-white'
                                  : ''
                              }
                            >
                              {promo.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {promo.description}
                          </p>
                          <div className="flex flex-wrap gap-4 mt-2 text-xs text-muted-foreground">
                            <span>
                              Expires:{' '}
                              {new Date(promo.expiryDate).toLocaleDateString()}
                            </span>
                            <span>Region: {promo.region}</span>
                            <span>Category: {promo.category}</span>
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
