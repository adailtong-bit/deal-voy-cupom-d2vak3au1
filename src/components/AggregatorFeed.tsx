import { useState } from 'react'
import { Coupon } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search, Plus, ExternalLink, Filter } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

interface AggregatorFeedProps {
  coupons: Coupon[]
  onAddToItinerary: (coupon: Coupon) => void
  className?: string
}

const BRANDS = [
  'Groupon',
  'ShopSimon',
  'Burger King',
  'Sephora',
  'Ulta',
  'Publix',
  'Walmart',
]

export function AggregatorFeed({
  coupons,
  onAddToItinerary,
  className,
}: AggregatorFeedProps) {
  const [search, setSearch] = useState('')
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null)

  // Filter coupons to only show the aggregator brands and apply search/filter
  const filteredCoupons = coupons.filter((c) => {
    // Check if store matches one of the aggregator brands
    const isAggregatorBrand = BRANDS.some((b) =>
      c.storeName.toLowerCase().includes(b.toLowerCase()),
    )
    if (!isAggregatorBrand && c.source !== 'aggregated') return false

    if (search) {
      const searchLower = search.toLowerCase()
      if (
        !c.title.toLowerCase().includes(searchLower) &&
        !c.storeName.toLowerCase().includes(searchLower)
      ) {
        return false
      }
    }

    if (selectedBrand) {
      if (!c.storeName.toLowerCase().includes(selectedBrand.toLowerCase()))
        return false
    }

    return true
  })

  return (
    <div className={cn('flex flex-col h-full bg-white border-l', className)}>
      <div className="p-4 border-b bg-slate-50">
        <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
          <Filter className="h-4 w-4 text-primary" /> Feed de Ofertas
        </h3>
        <p className="text-xs text-muted-foreground mb-3">
          Oportunidades digitais de parceiros globais.
        </p>

        <div className="relative mb-3">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar ofertas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 bg-white"
          />
        </div>

        <ScrollArea className="w-full whitespace-nowrap pb-2">
          <div className="flex gap-2">
            <Badge
              variant={selectedBrand === null ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setSelectedBrand(null)}
            >
              Todos
            </Badge>
            {BRANDS.map((brand) => (
              <Badge
                key={brand}
                variant={selectedBrand === brand ? 'default' : 'outline'}
                className="cursor-pointer whitespace-nowrap"
                onClick={() =>
                  setSelectedBrand(selectedBrand === brand ? null : brand)
                }
              >
                {brand}
              </Badge>
            ))}
          </div>
        </ScrollArea>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {filteredCoupons.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Nenhuma oferta encontrada para os filtros selecionados.
            </div>
          ) : (
            filteredCoupons.map((coupon) => (
              <Card
                key={coupon.id}
                className="group hover:shadow-md transition-all border-slate-200"
              >
                <CardContent className="p-3 flex gap-3">
                  <div className="w-16 h-16 rounded-md overflow-hidden bg-slate-100 flex-shrink-0 relative">
                    <img
                      src={coupon.image}
                      alt={coupon.storeName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-sm truncate pr-2">
                        {coupon.storeName}
                      </h4>
                      <Badge
                        variant="secondary"
                        className="text-[10px] h-5 px-1 bg-slate-100 text-slate-600"
                      >
                        {coupon.distance > 0
                          ? `${(coupon.distance / 1000).toFixed(1)}km`
                          : 'Online'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {coupon.title}
                    </p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                        {coupon.discount}
                      </span>
                      <Button
                        size="sm"
                        className="h-7 text-xs gap-1 bg-primary hover:bg-primary/90"
                        onClick={() => onAddToItinerary(coupon)}
                      >
                        <Plus className="h-3 w-3" /> Adicionar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>

      <div className="p-3 border-t bg-slate-50 text-center">
        <p className="text-[10px] text-slate-400">
          Powered by Deal Voy Aggregator
        </p>
      </div>
    </div>
  )
}
