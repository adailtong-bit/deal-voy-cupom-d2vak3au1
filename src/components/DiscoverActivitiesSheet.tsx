import { useState, useMemo } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useCouponStore } from '@/stores/CouponContext'
import { useLanguage } from '@/stores/LanguageContext'
import { Coupon } from '@/lib/types'

interface DiscoverActivitiesSheetProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (coupon: Coupon) => void
}

export function DiscoverActivitiesSheet({
  isOpen,
  onClose,
  onAdd,
}: DiscoverActivitiesSheetProps) {
  const { coupons } = useCouponStore()
  const { t } = useLanguage()
  const [searchQuery, setSearchQuery] = useState('')

  const discoveryCoupons = useMemo(() => {
    if (!searchQuery) return coupons.slice(0, 30)
    const lowerQ = searchQuery.toLowerCase()
    return coupons.filter(
      (c) =>
        c.title.toLowerCase().includes(lowerQ) ||
        c.storeName.toLowerCase().includes(lowerQ) ||
        c.category.toLowerCase().includes(lowerQ),
    )
  }, [coupons, searchQuery])

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 flex flex-col bg-slate-50"
      >
        <SheetHeader className="p-6 bg-white border-b">
          <SheetTitle className="text-xl">
            {t('discover_sheet.title', 'Discover Activities')}
          </SheetTitle>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder={t(
                'discover_sheet.search_placeholder',
                'Search restaurants, places, events...',
              )}
              className="pl-9 bg-slate-50 border-transparent focus-visible:ring-primary/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </SheetHeader>
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {discoveryCoupons.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                {t('discover_sheet.no_activities', 'No activities found.')}
              </div>
            ) : (
              discoveryCoupons.map((coupon) => (
                <Card
                  key={coupon.id}
                  className="overflow-hidden bg-white hover:shadow-sm transition-shadow"
                >
                  <div className="flex h-28">
                    <div className="w-28 shrink-0 relative bg-slate-200">
                      <img
                        src={coupon.image}
                        alt={coupon.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                      <div>
                        <h4 className="font-bold text-sm truncate">
                          {coupon.storeName}
                        </h4>
                        <p className="text-xs text-muted-foreground truncate">
                          {coupon.title}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <Badge
                          variant="secondary"
                          className="text-[10px] bg-green-50 text-green-700 hover:bg-green-50"
                        >
                          {coupon.discount}
                        </Badge>
                        <Button
                          size="sm"
                          className="h-7 text-xs px-3"
                          onClick={() => onAdd(coupon)}
                        >
                          {t('discover_sheet.add', 'Add')}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
