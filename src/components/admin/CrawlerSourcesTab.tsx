import { useState } from 'react'
import { useCouponStore } from '@/stores/CouponContext'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  Play,
  Plus,
  MapPin,
  CheckCircle,
  Edit,
  Trash2,
  AlertCircle,
} from 'lucide-react'
import { CrawlerSource } from '@/lib/types'
import { CrawlerSourceForm } from './CrawlerSourceForm'

export function CrawlerSourcesTab() {
  const {
    user,
    crawlerSources,
    addCrawlerSource,
    updateCrawlerSource,
    deleteCrawlerSource,
    triggerScan,
  } = useCouponStore()

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingSource, setEditingSource] = useState<CrawlerSource | null>(null)
  const [deletingSourceId, setDeletingSourceId] = useState<string | null>(null)

  const isFranchisee = user?.role === 'franchisee'
  const userRegion = user?.region || 'Global'

  const relevantSources = isFranchisee
    ? crawlerSources.filter((s) => s.region === user?.region)
    : crawlerSources

  const handleSaveSource = (
    data: Omit<CrawlerSource, 'id' | 'status' | 'lastScan'>,
  ) => {
    if (editingSource) {
      updateCrawlerSource(editingSource.id, data)
      setEditingSource(null)
    } else {
      addCrawlerSource({
        id: Math.random().toString(),
        ...data,
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

  return (
    <div className="space-y-4">
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
            <CrawlerSourceForm
              onSave={handleSaveSource}
              userRegion={userRegion}
              isFranchisee={isFranchisee}
            />
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
          <CrawlerSourceForm
            initialData={editingSource}
            onSave={handleSaveSource}
            userRegion={userRegion}
            isFranchisee={isFranchisee}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deletingSourceId}
        onOpenChange={(open) => !open && setDeletingSourceId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the crawler source configuration and
              stop future scans from this origin.
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

      <div className="border rounded-md">
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
                  {s.lastScan ? new Date(s.lastScan).toLocaleString() : 'Never'}
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
      </div>
    </div>
  )
}
