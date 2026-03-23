import { useState } from 'react'
import { Search, Map as MapIcon, List, Filter } from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'
import { useCouponStore } from '@/stores/CouponContext'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

export default function Explore() {
  const { t } = useLanguage()
  const { coupons } = useCouponStore()
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const [search, setSearch] = useState('')

  const filtered = coupons.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.storeName.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="container max-w-4xl py-8 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            {t('nav.explore', 'Explorar')}
          </h1>
          <p className="text-slate-500 mt-1">
            {filtered.length} {t('explore.offers_found', 'ofertas encontradas')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4 mr-2" />
            {t('explore.view_list', 'Ver Lista')}
          </Button>
          <Button
            variant={viewMode === 'map' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('map')}
          >
            <MapIcon className="h-4 w-4 mr-2" />
            {t('explore.view_map', 'Ver Mapa')}
          </Button>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('nav.search', 'Buscar ofertas...')}
            className="pl-9 bg-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filtered.map((coupon) => (
          <Card
            key={coupon.id}
            className="overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="aspect-[4/3] bg-slate-100 relative">
              <img
                src={coupon.image}
                alt={coupon.title}
                className="w-full h-full object-cover"
              />
              <Badge className="absolute top-2 right-2 font-bold bg-white text-slate-900 hover:bg-slate-50">
                {coupon.discount}
              </Badge>
            </div>
            <CardContent className="p-4">
              <h3 className="font-bold text-lg text-slate-900 line-clamp-1">
                {coupon.title}
              </h3>
              <p className="text-sm text-slate-500 font-medium">
                {coupon.storeName}
              </p>
              <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">
                <MapIcon className="h-3 w-3" />
                <span>{coupon.city || coupon.region}</span>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500">
            {t('common.none', 'Nenhum resultado')}
          </div>
        )}
      </div>
    </div>
  )
}
