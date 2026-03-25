import { useState, useMemo } from 'react'
import { Search, Map as MapIcon, List, Filter } from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'
import { useCouponStore } from '@/stores/CouponContext'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CouponCard } from '@/components/CouponCard'
import { AdSpace } from '@/components/AdSpace'
import { CATEGORIES } from '@/lib/data'
import { cn } from '@/lib/utils'

export default function Explore() {
  const { t } = useLanguage()
  const { coupons } = useCouponStore()
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const filtered = useMemo(() => {
    return coupons.filter((c) => {
      const matchesSearch =
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.storeName.toLowerCase().includes(search.toLowerCase())
      const matchesCategory =
        selectedCategory === 'all' || c.category === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [coupons, search, selectedCategory])

  return (
    <div className="container max-w-6xl py-6 animate-fade-in-up flex flex-col gap-6">
      {/* Header Banner Section */}
      <AdSpace position="top" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
            className="shadow-sm"
          >
            <List className="h-4 w-4 mr-2" />
            {t('explore.view_list', 'Lista')}
          </Button>
          <Button
            variant={viewMode === 'map' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('map')}
            className="shadow-sm"
          >
            <MapIcon className="h-4 w-4 mr-2" />
            {t('explore.view_map', 'Mapa')}
          </Button>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1 shadow-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('nav.search', 'Buscar ofertas...')}
            className="pl-9 bg-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          className="shrink-0 bg-white shadow-sm"
        >
          <Filter className="h-4 w-4 text-slate-600" />
        </Button>
      </div>

      {/* Category Filter Bar */}
      <div className="flex overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 gap-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {CATEGORIES.map((cat) => (
          <Button
            key={cat.id}
            variant={selectedCategory === cat.id ? 'default' : 'outline'}
            size="sm"
            className={cn(
              'whitespace-nowrap rounded-full font-medium transition-colors shadow-sm',
              selectedCategory !== cat.id &&
                'bg-white hover:bg-slate-50 text-slate-600',
            )}
            onClick={() => setSelectedCategory(cat.id)}
          >
            {t(cat.translationKey, cat.label)}
          </Button>
        ))}
      </div>

      {/* Dynamic Coupon Grid */}
      <div
        className={cn(
          'grid gap-4',
          viewMode === 'list'
            ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
            : 'grid-cols-1',
        )}
      >
        {viewMode === 'list' ? (
          filtered.map((coupon) => (
            <CouponCard key={coupon.id} coupon={coupon} variant="vertical" />
          ))
        ) : (
          <div className="h-[400px] w-full bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200 shadow-inner">
            <div className="text-center flex flex-col items-center gap-3">
              <MapIcon className="h-10 w-10 text-slate-400" />
              <p className="text-slate-500 font-medium">
                Visualização do mapa interativa em breve.
              </p>
            </div>
          </div>
        )}

        {filtered.length === 0 && viewMode === 'list' && (
          <div className="col-span-full py-16 text-center bg-white rounded-lg border border-slate-100 border-dashed">
            <div className="flex justify-center mb-4">
              <Search className="h-10 w-10 text-slate-300" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-1">
              Nenhuma oferta encontrada
            </h3>
            <p className="text-slate-500">
              {t(
                'explore.none_desc',
                'Tente ajustar os filtros ou buscar por outros termos.',
              )}
            </p>
            {(search || selectedCategory !== 'all') && (
              <Button
                variant="link"
                onClick={() => {
                  setSearch('')
                  setSelectedCategory('all')
                }}
                className="mt-2 text-primary"
              >
                Limpar filtros
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Footer Banner Section */}
      <AdSpace position="bottom" className="mt-4" />
    </div>
  )
}
