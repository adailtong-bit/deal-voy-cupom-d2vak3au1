import { useState } from 'react'
import { useCouponStore } from '@/stores/CouponContext'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Eye, Clock } from 'lucide-react'
import { DiscoveredPromotion } from '@/lib/types'
import { CrawlerAnalysisSheet } from './CrawlerAnalysisSheet'

export function CrawlerPromotionsTab() {
  const { user, discoveredPromotions, importPromotion, ignorePromotion } =
    useCouponStore()

  const [statusFilter, setStatusFilter] = useState<string>('pending')
  const [analyzingPromo, setAnalyzingPromo] =
    useState<DiscoveredPromotion | null>(null)

  const isFranchisee = user?.role === 'franchisee'

  const relevantPromotions = discoveredPromotions.filter((p) => {
    if (isFranchisee && p.region !== user?.region) return false
    if (statusFilter !== 'all' && p.status !== statusFilter) return false
    return true
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Review & Approval Queue</h3>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending Analysis</SelectItem>
            <SelectItem value="imported">Imported</SelectItem>
            <SelectItem value="ignored">Ignored</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Captured At</TableHead>
              <TableHead>Source / Region</TableHead>
              <TableHead>Title & Deal</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {relevantPromotions.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-12 text-muted-foreground"
                >
                  No promotions found matching the current filters.
                </TableCell>
              </TableRow>
            )}
            {relevantPromotions.map((promo) => (
              <TableRow key={promo.id}>
                <TableCell className="text-sm whitespace-nowrap">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {promo.capturedAt
                      ? new Date(promo.capturedAt).toLocaleString()
                      : 'Unknown'}
                  </div>
                </TableCell>
                <TableCell>
                  <p className="font-medium text-sm">{promo.storeName}</p>
                  <p className="text-xs text-muted-foreground">
                    {promo.region}
                  </p>
                </TableCell>
                <TableCell>
                  <p className="font-bold">{promo.title}</p>
                  <Badge variant="outline" className="mt-1">
                    {promo.discount}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      promo.status === 'pending'
                        ? 'secondary'
                        : promo.status === 'imported'
                          ? 'default'
                          : 'outline'
                    }
                    className={
                      promo.status === 'imported'
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : promo.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                          : ''
                    }
                  >
                    {promo.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                    onClick={() => setAnalyzingPromo(promo)}
                  >
                    <Eye className="h-4 w-4" /> View Analysis
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <CrawlerAnalysisSheet
        promo={analyzingPromo}
        open={!!analyzingPromo}
        onClose={() => setAnalyzingPromo(null)}
        onImport={importPromotion}
        onIgnore={ignorePromotion}
      />
    </div>
  )
}
