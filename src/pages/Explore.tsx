import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import {
  Search,
  Map as MapIcon,
  List,
  Filter,
  Radar,
  MapPin,
} from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'
import { useCouponStore } from '@/stores/CouponContext'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CouponCard } from '@/components/CouponCard'
import { AdSpace } from '@/components/AdSpace'
import { Skeleton } from '@/components/ui/skeleton'
import { CATEGORIES } from '@/lib/data'
import { cn } from '@/lib/utils'
import { fetchCoupons } from '@/lib/api'
import { Coupon } from '@/lib/types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const getDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) => {
  const R = 6371 // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export default function Explore() {
  const { t, language } = useLanguage()
  const { user, selectedRegion } = useCouponStore()
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'recommended' | 'distance'>(
    'recommended',
  )
  const [userLocation, setUserLocation] = useState<{
    lat: number
    lng: number
  } | null>(null)

  const [serverCoupons, setServerCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          }),
        (err) => console.warn('Geolocation error:', err),
      )
    }
  }, [])

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 500)
    return () => clearTimeout(handler)
  }, [search])

  useEffect(() => {
    let isMounted = true
    const loadInitial = async () => {
      setLoading(true)
      try {
        const res = await fetchCoupons({
          query: debouncedSearch,
          category: selectedCategory,
          page: 1,
          limit: 12,
          franchiseId: user?.franchiseId,
          region: selectedRegion,
          language,
        })
        if (isMounted) {
          setServerCoupons(res.data)
          setPage(1)
          setHasMore(res.hasMore)
          setTotal(res.total)
        }
      } catch (err) {
        console.error(err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    loadInitial()
    return () => {
      isMounted = false
    }
  }, [
    debouncedSearch,
    selectedCategory,
    language,
    selectedRegion,
    user?.franchiseId,
  ])

  const observer = useRef<IntersectionObserver | null>(null)
  const lastElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading || !hasMore) return
      if (observer.current) observer.current.disconnect()
      observer.current = new IntersectionObserver(async (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setLoading(true)
          try {
            const nextPage = page + 1
            const res = await fetchCoupons({
              query: debouncedSearch,
              category: selectedCategory,
              page: nextPage,
              limit: 12,
              franchiseId: user?.franchiseId,
              region: selectedRegion,
              language,
            })
            setServerCoupons((prev) => {
              const newItems = res.data.filter(
                (n) => !prev.some((p) => p.id === n.id),
              )
              return [...prev, ...newItems]
            })
            setPage(nextPage)
            setHasMore(res.hasMore)
          } catch (err) {
            console.error(err)
          } finally {
            setLoading(false)
          }
        }
      })
      if (node) observer.current.observe(node)
    },
    [
      loading,
      hasMore,
      page,
      debouncedSearch,
      selectedCategory,
      language,
      selectedRegion,
      user?.franchiseId,
    ],
  )

  const displayCoupons = useMemo(() => {
    let processed = [...serverCoupons]
    if (userLocation) {
      processed = processed.map((c) => {
        if (c.coordinates?.lat && c.coordinates?.lng) {
          return {
            ...c,
            distance:
              getDistance(
                userLocation.lat,
                userLocation.lng,
                c.coordinates.lat,
                c.coordinates.lng,
              ) * 1000,
          }
        }
        return c
      })
    }
    if (sortBy === 'distance') {
      processed.sort((a, b) => (a.distance || 0) - (b.distance || 0))
    }
    return processed
  }, [serverCoupons, sortBy, userLocation])

  return (
    <div className="container max-w-6xl py-6 animate-fade-in-up flex flex-col gap-6">
      <AdSpace position="top" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            {t('nav.explore', 'Explorar')}
          </h1>
          <div className="text-slate-500 mt-1 flex items-center gap-2">
            {loading && page === 1 ? (
              <Skeleton className="h-5 w-40" />
            ) : (
              <span>
                {total} {t('explore.offers_found', 'ofertas encontradas')}
              </span>
            )}
            {userLocation && (
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
                <MapPin className="w-3 h-3 text-primary" /> Localização Ativa
              </span>
            )}
          </div>
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

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1 shadow-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('explore.search_placeholder', 'Buscar cupons...')}
            className="pl-9 bg-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
            <SelectTrigger className="w-full sm:w-[160px] bg-white shadow-sm">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recommended">Recomendados</SelectItem>
              <SelectItem value="distance">Mais Próximos</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 bg-white shadow-sm"
          >
            <Filter className="h-4 w-4 text-slate-600" />
          </Button>
        </div>
      </div>

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

      <div
        className={cn(
          'grid gap-4 sm:gap-6 lg:gap-8',
          viewMode === 'list'
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            : 'grid-cols-1',
        )}
      >
        {viewMode === 'list' ? (
          <>
            {displayCoupons.map((coupon, index) => {
              if (index === displayCoupons.length - 1) {
                return (
                  <div ref={lastElementRef} key={coupon.id} className="h-full">
                    <CouponCard coupon={coupon} variant="vertical" />
                  </div>
                )
              }
              return (
                <CouponCard
                  key={coupon.id}
                  coupon={coupon}
                  variant="vertical"
                />
              )
            })}

            {loading && (
              <>
                {Array.from({ length: page === 1 ? 12 : 4 }).map((_, i) => (
                  <div
                    key={`skeleton-${i}`}
                    className="flex flex-col h-full rounded-xl border border-slate-200/60 overflow-hidden bg-white shadow-sm min-h-[280px]"
                  >
                    <Skeleton className="h-36 sm:h-44 w-full rounded-none" />
                    <div className="p-3 sm:p-4 flex-1 flex flex-col gap-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <div className="mt-auto pt-3 border-t border-slate-100 flex flex-col gap-3">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-11 sm:h-10 w-full rounded-lg" />
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </>
        ) : (
          <div className="h-[400px] w-full bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200 shadow-inner">
            <div className="text-center flex flex-col items-center gap-3">
              <MapIcon className="h-10 w-10 text-slate-400" />
              <p className="text-slate-500 font-medium">
                {t(
                  'explore.map_coming_soon',
                  'Visualização do mapa interativa em breve.',
                )}
              </p>
            </div>
          </div>
        )}

        {!loading && displayCoupons.length === 0 && viewMode === 'list' && (
          <div className="col-span-full py-16 text-center bg-white rounded-lg border border-slate-100 border-dashed">
            <div className="flex justify-center mb-4">
              <Search className="h-10 w-10 text-slate-300" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-1">
              {t('explore.empty_title', 'Nenhum cupom encontrado')}
            </h3>
            <p className="text-slate-500">
              {t(
                'explore.none_desc',
                'Tente ajustar os filtros ou buscar por outros termos.',
              )}
            </p>
          </div>
        )}
      </div>

      <AdSpace position="bottom" className="mt-4" />
    </div>
  )
}
