import { useState } from 'react'
import { useCouponStore } from '@/stores/CouponContext'
import { CouponCard } from '@/components/CouponCard'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet'
import { Filter, Map as MapIcon, List } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/stores/LanguageContext'

export default function Explore() {
  const { coupons } = useCouponStore()
  const { t } = useLanguage()
  const [viewMode, setViewMode] = useState<'map' | 'list'>('list')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [maxDistance, setMaxDistance] = useState([10]) // km

  // Mock filtering
  const filteredCoupons = coupons.filter((c) => {
    if (selectedCategory && c.category !== selectedCategory) return false
    if (c.distance > maxDistance[0] * 1000) return false
    return true
  })

  return (
    <div className="flex flex-col h-[calc(100vh-64px-64px)] md:h-[calc(100vh-64px)] overflow-hidden">
      {/* Filters Bar */}
      <div className="px-4 py-3 bg-background border-b flex items-center gap-2 overflow-x-auto hide-scrollbar shrink-0 z-20">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" /> {t('explore.filters')}
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>{t('explore.filter_title')}</SheetTitle>
              <SheetDescription>{t('explore.filter_desc')}</SheetDescription>
            </SheetHeader>
            <div className="py-6 space-y-6">
              <div className="space-y-3">
                <h3 className="font-medium text-sm">
                  {t('explore.max_distance')}: {maxDistance}km
                </h3>
                <Slider
                  defaultValue={[10]}
                  max={50}
                  step={1}
                  value={maxDistance}
                  onValueChange={setMaxDistance}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1km</span>
                  <span>50km</span>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-medium text-sm">
                  {t('explore.categories')}
                </h3>
                {[
                  'Alimentação',
                  'Moda',
                  'Serviços',
                  'Eletrônicos',
                  'Lazer',
                ].map((cat) => (
                  <div key={cat} className="flex items-center space-x-2">
                    <Checkbox
                      id={cat}
                      checked={selectedCategory === cat}
                      onCheckedChange={(checked) =>
                        setSelectedCategory(checked ? cat : null)
                      }
                    />
                    <label
                      htmlFor={cat}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {cat}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <SheetFooter>
              <SheetClose asChild>
                <Button className="w-full">{t('explore.apply_filters')}</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        <div className="flex gap-2">
          {['Alimentação', 'Moda', 'Lazer'].map((cat) => (
            <Badge
              key={cat}
              variant={selectedCategory === cat ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() =>
                setSelectedCategory(selectedCategory === cat ? null : cat)
              }
            >
              {cat}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* List View */}
        <div
          className={cn(
            'w-full md:w-[400px] lg:w-[450px] bg-background border-r flex flex-col transition-transform duration-300 absolute inset-0 z-10 md:relative md:translate-x-0',
            viewMode === 'map' ? 'translate-x-[-100%]' : 'translate-x-0',
          )}
        >
          <div className="p-4 border-b bg-muted/10">
            <p className="text-sm text-muted-foreground font-medium">
              {filteredCoupons.length} {t('travel.offers_found')}
            </p>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-4">
              {filteredCoupons.map((coupon) => (
                <CouponCard
                  key={coupon.id}
                  coupon={coupon}
                  variant="horizontal"
                  className="h-auto"
                />
              ))}
              {filteredCoupons.length === 0 && (
                <div className="text-center py-10 text-muted-foreground">
                  {t('travel.no_offers')}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Map View */}
        <div
          className={cn(
            'flex-1 bg-slate-100 relative transition-transform duration-300 absolute inset-0 md:relative md:translate-x-0',
            viewMode === 'list'
              ? 'translate-x-[100%] md:translate-x-0'
              : 'translate-x-0',
          )}
        >
          {/* Simulated Map - In a real app we'd use GoogleMap here too */}
          <div className="w-full h-full relative overflow-hidden">
            <img
              src="https://img.usecurling.com/p/1200/800?q=map%20street%20view&color=gray"
              className="w-full h-full object-cover opacity-60 grayscale"
              alt="Map Background"
            />

            {/* Map Pins */}
            {filteredCoupons.map((coupon, idx) => (
              <div
                key={coupon.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                style={{
                  top: `${30 + ((idx * 15) % 60)}%`,
                  left: `${20 + ((idx * 23) % 70)}%`,
                }}
              >
                <div className="bg-primary text-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform">
                  <div className="h-3 w-3 rounded-full bg-white" />
                </div>
                {/* Tooltip on hover */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 bg-white rounded-lg shadow-xl p-2 hidden group-hover:block z-50 text-xs">
                  <p className="font-bold truncate">{coupon.storeName}</p>
                  <p className="text-emerald-600 font-bold">
                    {coupon.discount}
                  </p>
                </div>
              </div>
            ))}

            {/* User Location Pin */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="h-4 w-4 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse" />
              <div className="h-16 w-16 bg-blue-500/20 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-ping" />
            </div>
          </div>
        </div>
      </div>

      {/* FAB Toggle for Mobile */}
      <div className="absolute bottom-6 right-6 md:hidden z-30">
        <Button
          size="lg"
          className="rounded-full shadow-elevation h-14 px-6 gap-2"
          onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
        >
          {viewMode === 'list' ? (
            <>
              <MapIcon className="h-5 w-5" /> {t('explore.view_map')}
            </>
          ) : (
            <>
              <List className="h-5 w-5" /> {t('explore.view_list')}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
