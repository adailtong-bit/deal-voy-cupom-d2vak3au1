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
import { Filter, SearchX } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { useLanguage } from '@/stores/LanguageContext'
import { CATEGORIES } from '@/lib/data'

export default function Explore() {
  const { coupons } = useCouponStore()
  const { t } = useLanguage()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [maxDistance, setMaxDistance] = useState([10]) // km

  const filteredCoupons = coupons.filter((c) => {
    if (selectedCategory && c.category !== selectedCategory) return false
    if (c.distance > maxDistance[0] * 1000) return false
    return true
  })

  // Filter out 'all' from categories for filters
  const filterCategories = CATEGORIES.filter((c) => c.id !== 'all')

  return (
    <div className="flex flex-col h-[calc(100vh-64px-64px)] md:h-[calc(100vh-64px)] overflow-hidden bg-slate-50/50">
      <div className="px-4 py-3 bg-background border-b flex items-center gap-2 overflow-x-auto hide-scrollbar shrink-0 z-20">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 shrink-0">
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
                  {t('explore.max_distance')}: {maxDistance[0]}km
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
                {filterCategories.map((cat) => (
                  <div key={cat.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={cat.id}
                      checked={selectedCategory === cat.id}
                      onCheckedChange={(checked) =>
                        setSelectedCategory(checked ? cat.id : null)
                      }
                    />
                    <label
                      htmlFor={cat.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {t(cat.translationKey)}
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
          {filterCategories.slice(0, 4).map((cat) => (
            <Badge
              key={cat.id}
              variant={selectedCategory === cat.id ? 'default' : 'outline'}
              className="cursor-pointer whitespace-nowrap"
              onClick={() =>
                setSelectedCategory(selectedCategory === cat.id ? null : cat.id)
              }
            >
              {t(cat.translationKey)}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden relative">
        <div className="p-4 border-b bg-background shadow-sm shrink-0">
          <p className="text-sm text-muted-foreground font-medium">
            {filteredCoupons.length} {t('explore.offers_found')}
          </p>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-4 md:p-6 lg:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 max-w-7xl mx-auto">
              {filteredCoupons.map((coupon) => (
                <CouponCard
                  key={coupon.id}
                  coupon={coupon}
                  variant="vertical"
                />
              ))}
            </div>
            {filteredCoupons.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground max-w-md mx-auto text-center">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                  <SearchX className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg text-foreground mb-2">
                  {t('home.no_offers')}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Nenhuma oferta encontrada com os filtros atuais. Tente
                  aumentar a distância ou alterar a categoria.
                </p>
                <Button
                  variant="outline"
                  className="mt-6"
                  onClick={() => {
                    setSelectedCategory(null)
                    setMaxDistance([50])
                  }}
                >
                  Limpar Filtros
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
