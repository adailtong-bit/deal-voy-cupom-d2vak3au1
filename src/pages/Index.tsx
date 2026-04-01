import { useMemo, useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useCouponStore } from '@/stores/CouponContext'
import { useLanguage } from '@/stores/LanguageContext'
import { CouponCard } from '@/components/CouponCard'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AdSpace } from '@/components/AdSpace'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { CATEGORIES, POPULAR_DESTINATIONS } from '@/lib/data'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Ticket,
  CalendarIcon,
  Gift,
  ChevronRight,
  TrendingUp,
  Sparkles,
  Search,
  MapPin,
  LayoutGrid,
  Utensils,
  Shirt,
  Briefcase,
  CircleEllipsis,
  Smartphone,
  ShoppingCart,
  Check,
  ChevronDown,
  ArrowLeft,
  Globe,
  ImageOff,
} from 'lucide-react'
import { Input } from '@/components/ui/input'

function getDistanceFromLatLonInKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) {
  const R = 6371
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function IndexContent() {
  const { t, formatDate, language } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()

  const store = useCouponStore() || {}
  const user = store.user
  const coupons = Array.isArray(store.coupons) ? store.coupons : []
  const seasonalEvents = Array.isArray(store.seasonalEvents)
    ? store.seasonalEvents
    : []
  const trackSeasonalClick = store.trackSeasonalClick || (() => {})
  const userLocation = store.userLocation
  const reservedIds = Array.isArray(store.reservedIds) ? store.reservedIds : []
  const platformSettings = store.platformSettings || {}
  const reserveCoupon = store.reserveCoupon || (() => false)
  const searchWeb = store.searchWeb || (async () => [])
  const dbPromotions = Array.isArray(store.dbPromotions)
    ? store.dbPromotions
    : []
  const isLoadingLocation = !!store.isLoadingLocation

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({})
  const [webResults, setWebResults] = useState<any[]>([])
  const [isSearchingWeb, setIsSearchingWeb] = useState(false)

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length > 2) {
        setIsSearchingWeb(true)
        try {
          const results = await searchWeb(searchQuery)
          setWebResults(Array.isArray(results) ? results : [])
        } catch (e) {
          console.error(e)
          setWebResults([])
        } finally {
          setIsSearchingWeb(false)
        }
      } else {
        setWebResults([])
      }
    }, 800)

    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery, searchWeb])

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1)
    } else {
      navigate('/vendor')
    }
  }

  const handleCardClick = (id: string) => {
    trackSeasonalClick(id)
    navigate(`/voucher/${id}`)
  }

  const handleReserveSeasonal = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (!user) {
      navigate('/login', { state: { from: location } })
      return
    }
    const success = reserveCoupon(id)
    if (success) {
      toast.success(
        t('voucher_detail.reserved_success', 'Voucher reservado com sucesso!'),
      )
    }
  }

  const searchLocationInfo = useMemo(() => {
    const sq = searchQuery.toLowerCase()
    if (!sq) return null

    for (const [key, data] of Object.entries(POPULAR_DESTINATIONS)) {
      if (
        sq.includes(key.toLowerCase()) ||
        sq.includes(data.label.toLowerCase())
      ) {
        return data
      }
    }
    return null
  }, [searchQuery])

  const couponsWithDistance = useMemo(() => {
    const baseLoc = searchLocationInfo || userLocation
    const safeCoupons = Array.isArray(coupons) ? coupons : []
    const safeWebResults = Array.isArray(webResults) ? webResults : []
    const safeDbPromotions = Array.isArray(dbPromotions) ? dbPromotions : []

    const allC = [
      ...safeCoupons,
      ...safeWebResults,
      ...safeDbPromotions,
    ].filter((v, i, a) => a.findIndex((t) => t.id === v.id) === i)

    return allC.map((c) => {
      let dist = c.distance || 0

      if (baseLoc && c.coordinates && typeof c.coordinates.lat === 'number') {
        dist = Math.round(
          getDistanceFromLatLonInKm(
            baseLoc.lat,
            baseLoc.lng,
            c.coordinates.lat,
            c.coordinates.lng,
          ) * 1000,
        )
      }
      return { ...c, distance: dist }
    })
  }, [coupons, webResults, dbPromotions, searchLocationInfo, userLocation])

  const activeEvents = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const safeEvents = Array.isArray(seasonalEvents) ? seasonalEvents : []
    const safeReservedIds = Array.isArray(reservedIds) ? reservedIds : []

    return safeEvents.filter((e) => {
      if (!e || e.status !== 'active') return false
      if (safeReservedIds.includes(e.id)) return false
      const end = new Date(e.endDate)
      end.setHours(23, 59, 59, 999)
      return end >= today
    })
  }, [seasonalEvents, reservedIds])

  const filteredCoupons = useMemo(() => {
    const safeReservedIds = Array.isArray(reservedIds) ? reservedIds : []

    const results = couponsWithDistance.filter((c) => {
      if (!c) return false
      if (safeReservedIds.includes(c.id)) return false

      const title = c.translations?.[language]?.title || c.title || ''
      const storeName = c.storeName || ''
      const category = c.category || ''

      let textToMatch = searchQuery.toLowerCase()
      const isNearLocation = searchLocationInfo
        ? (c.distance || 0) < 50000
        : true

      if (searchLocationInfo) {
        textToMatch = textToMatch
          .replace(searchLocationInfo.label.toLowerCase(), '')
          .trim()
        Object.keys(POPULAR_DESTINATIONS).forEach((k) => {
          if (textToMatch.includes(k.toLowerCase())) {
            textToMatch = textToMatch.replace(k.toLowerCase(), '').trim()
          }
        })
      }

      const matchesText =
        textToMatch === '' ||
        title.toLowerCase().includes(textToMatch) ||
        storeName.toLowerCase().includes(textToMatch) ||
        category.toLowerCase().includes(textToMatch)

      const matchesCategory =
        selectedCategory === 'all' || category === selectedCategory

      return isNearLocation && matchesText && matchesCategory
    })

    results.sort((a, b) => (a.distance || 0) - (b.distance || 0))

    return results
  }, [
    couponsWithDistance,
    searchQuery,
    selectedCategory,
    reservedIds,
    language,
    searchLocationInfo,
  ])

  const trendingCoupons = filteredCoupons
    .filter((c) => c.isTrending || (c.averageRating && c.averageRating > 4.5))
    .slice(0, 4)
  const finalTrending =
    trendingCoupons.length >= 4 ? trendingCoupons : filteredCoupons.slice(0, 4)
  const moreCoupons = filteredCoupons
    .filter((c) => !finalTrending.find((tc) => tc.id === c.id))
    .slice(0, 12)

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Utensils':
        return <Utensils className="w-4 h-4" />
      case 'Shirt':
        return <Shirt className="w-4 h-4" />
      case 'Briefcase':
        return <Briefcase className="w-4 h-4" />
      case 'Smartphone':
        return <Smartphone className="w-4 h-4" />
      case 'Ticket':
        return <Ticket className="w-4 h-4" />
      case 'ShoppingCart':
        return <ShoppingCart className="w-4 h-4" />
      case 'Sparkles':
        return <Sparkles className="w-4 h-4" />
      case 'CircleEllipsis':
        return <CircleEllipsis className="w-4 h-4" />
      case 'LayoutGrid':
      default:
        return <LayoutGrid className="w-4 h-4" />
    }
  }

  const mainCategoryIds =
    platformSettings?.mainCategories || CATEGORIES.slice(1, 5).map((c) => c.id)
  const mainCategories = CATEGORIES.filter(
    (c) => Array.isArray(mainCategoryIds) && mainCategoryIds.includes(c.id),
  ).slice(0, 4)
  const secondaryCategories = CATEGORIES.filter(
    (c) =>
      c.id !== 'all' &&
      (!Array.isArray(mainCategoryIds) || !mainCategoryIds.includes(c.id)),
  )
  const isSecondarySelected = secondaryCategories.some(
    (c) => c.id === selectedCategory,
  )

  return (
    <div className="min-h-screen pb-20 md:pb-8 animate-fade-in bg-slate-50/30 flex flex-col">
      <AdSpace position="top" className="border-b bg-white" />

      <section className="bg-white pt-4 pb-3 px-4 border-b shadow-sm">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col gap-2.5 max-w-2xl mx-auto md:mx-0">
            <div className="flex items-center mb-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBack}
                className="font-semibold text-slate-700 bg-white border-slate-200 shadow-sm hover:bg-slate-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('common.back', 'Voltar')}
              </Button>
            </div>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t(
                  'home.search_placeholder_new',
                  'Para onde você vai? Buscar hotéis, parques, cupons...',
                )}
                className="pl-12 h-12 sm:h-14 text-base rounded-full shadow-sm bg-slate-50 border-slate-200 focus-visible:ring-primary/30 focus-visible:bg-white transition-all w-full"
              />
            </div>

            <div className="flex items-center justify-between pl-2 mt-1">
              <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600 animate-fade-in">
                <MapPin className="h-4 w-4 text-primary" />
                <span>
                  {searchLocationInfo
                    ? t(
                        'home.location_override',
                        `Mostrando ofertas perto de ${searchLocationInfo.label}`,
                      ).replace('{location}', searchLocationInfo.label)
                    : userLocation
                      ? t(
                          'home.location_active',
                          'Mostrando ofertas próximas a você',
                        )
                      : t(
                          'home.detecting_location',
                          'Detectando localização...',
                        )}
                </span>
              </div>
              {isSearchingWeb && (
                <div className="text-xs text-primary animate-pulse flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  {t('home.searching_web', 'Buscando na web...')}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto max-w-5xl px-4 mt-6 flex-1">
        <div className="mb-8">
          <ScrollArea className="w-full whitespace-nowrap pb-4">
            <div className="flex w-max space-x-3 px-1 items-center">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                className={cn(
                  'rounded-full px-5 transition-all duration-300',
                  selectedCategory === 'all'
                    ? 'shadow-md shadow-primary/20 scale-105'
                    : 'hover:border-primary/50 hover:bg-primary/5 text-slate-600 bg-white',
                )}
                onClick={() => setSelectedCategory('all')}
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="ml-2 font-medium">
                  {t('category.all', 'Todos')}
                </span>
              </Button>

              {mainCategories.map((cat) => {
                const isActive = selectedCategory === cat.id
                return (
                  <Button
                    key={cat.id}
                    variant={isActive ? 'default' : 'outline'}
                    className={cn(
                      'rounded-full px-5 transition-all duration-300',
                      isActive
                        ? 'shadow-md shadow-primary/20 scale-105'
                        : 'hover:border-primary/50 hover:bg-primary/5 text-slate-600 bg-white',
                    )}
                    onClick={() => setSelectedCategory(cat.id)}
                  >
                    {getCategoryIcon(cat.icon)}
                    <span className="ml-2 font-medium">
                      {t(cat.translationKey, cat.label)}
                    </span>
                  </Button>
                )
              })}

              {secondaryCategories.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant={isSecondarySelected ? 'default' : 'outline'}
                      className={cn(
                        'rounded-full px-5 transition-all duration-300',
                        isSecondarySelected
                          ? 'shadow-md shadow-primary/20 scale-105'
                          : 'hover:border-primary/50 hover:bg-primary/5 text-slate-600 bg-white',
                      )}
                    >
                      <CircleEllipsis className="w-4 h-4" />
                      <span className="ml-2 font-medium">
                        {isSecondarySelected
                          ? t(
                              secondaryCategories.find(
                                (c) => c.id === selectedCategory,
                              )?.translationKey || 'category.others',
                              'Outros',
                            )
                          : t('category.others', 'Outros')}
                      </span>
                      <ChevronDown className="w-4 h-4 ml-1 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {secondaryCategories.map((cat) => (
                      <DropdownMenuItem
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className="cursor-pointer"
                      >
                        {getCategoryIcon(cat.icon)}
                        <span className="ml-2">
                          {t(cat.translationKey, cat.label)}
                        </span>
                        {selectedCategory === cat.id && (
                          <Check className="ml-auto w-4 h-4 text-primary" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            <ScrollBar orientation="horizontal" className="invisible" />
          </ScrollArea>
        </div>

        <div className="space-y-10">
          {isLoadingLocation ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-500 font-medium">
                {t(
                  'home.loading_deals',
                  'Buscando as melhores ofertas para você...',
                )}
              </p>
            </div>
          ) : (
            <>
              {activeEvents.length > 0 &&
                !searchQuery &&
                selectedCategory === 'all' && (
                  <section>
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
                        <Gift className="h-6 w-6 text-primary" />
                        {t(
                          'home.seasonal_events',
                          'Ofertas Sazonais em Destaque',
                        )}
                      </h2>
                      <Button
                        variant="ghost"
                        asChild
                        className="hidden sm:flex hover:bg-slate-100"
                      >
                        <Link to="/seasonal">
                          {t('home.view_calendar', 'Ver calendário')}{' '}
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Link>
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {activeEvents.slice(0, 2).map((event) => {
                        const eventTitle =
                          event.translations?.[language]?.title ||
                          event.title ||
                          ''
                        const eventDesc =
                          event.translations?.[language]?.description ||
                          event.description ||
                          ''

                        return (
                          <Card
                            key={event.id}
                            className="overflow-hidden border-primary/20 hover:border-primary/50 transition-all hover:shadow-md group cursor-pointer"
                            onClick={() => handleCardClick(event.id)}
                          >
                            <div className="flex flex-col sm:flex-row h-full">
                              {event.image && (
                                <div className="w-full sm:w-2/5 h-48 sm:h-auto relative overflow-hidden bg-slate-100 shrink-0">
                                  {!imgErrors[event.id] ? (
                                    <img
                                      src={event.image}
                                      alt={eventTitle}
                                      crossOrigin="anonymous"
                                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                      onError={() =>
                                        setImgErrors((prev) => ({
                                          ...prev,
                                          [event.id]: true,
                                        }))
                                      }
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                                      <ImageOff className="h-8 w-8 text-slate-400" />
                                    </div>
                                  )}
                                  <div className="absolute top-2 left-2 flex gap-1 flex-col items-start">
                                    <Badge
                                      variant="secondary"
                                      className="bg-white/95 text-black backdrop-blur-sm shadow-sm font-bold capitalize"
                                    >
                                      {t(
                                        `event.type.${event.type}`,
                                        event.type || 'Evento',
                                      )}
                                    </Badge>
                                    {(event.offerType === 'online' ||
                                      event.externalUrl) && (
                                      <Badge className="bg-blue-600 text-white font-bold shadow-sm border-none">
                                        <Globe className="w-3 h-3 mr-1" />{' '}
                                        {t('vouchers.online', 'Online')}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              )}
                              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between bg-white">
                                <div>
                                  <h3 className="text-lg sm:text-xl font-bold text-primary mb-1.5 line-clamp-2">
                                    {eventTitle}
                                  </h3>
                                  <p className="text-sm text-muted-foreground line-clamp-2 sm:line-clamp-3 mb-4">
                                    {eventDesc}
                                  </p>
                                </div>
                                <div className="space-y-4 mt-auto">
                                  <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-600 bg-slate-50 p-2 rounded-lg">
                                    <CalendarIcon className="h-4 w-4 text-primary shrink-0" />
                                    <span className="truncate">
                                      {event.startDate
                                        ? formatDate(event.startDate)
                                        : ''}{' '}
                                      -{' '}
                                      {event.endDate
                                        ? formatDate(event.endDate)
                                        : ''}
                                    </span>
                                  </div>
                                  <Button
                                    className="w-full gap-2 font-bold shadow-sm transition-transform hover:-translate-y-0.5"
                                    size="lg"
                                    onClick={(e) =>
                                      handleReserveSeasonal(e, event.id)
                                    }
                                  >
                                    <Ticket className="h-5 w-5" />
                                    {t('home.get_voucher', 'Resgatar Voucher')}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </Card>
                        )
                      })}
                    </div>
                    {activeEvents.length > 2 && (
                      <div className="mt-5 text-center sm:hidden">
                        <Button variant="outline" asChild className="w-full">
                          <Link to="/seasonal">
                            {t('home.view_all_events', 'Ver todos os eventos')}
                          </Link>
                        </Button>
                      </div>
                    )}
                  </section>
                )}

              {finalTrending.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold flex items-center gap-2 mb-5 text-slate-800">
                    <TrendingUp className="h-6 w-6 text-orange-500" />
                    {searchQuery || selectedCategory !== 'all'
                      ? t('home.search_results', 'Resultados da Busca')
                      : t('home.trending', 'Em Alta')}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {finalTrending.map((coupon) => (
                      <CouponCard key={coupon.id} coupon={coupon} />
                    ))}
                  </div>
                </section>
              )}

              {moreCoupons.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold flex items-center gap-2 mb-5 text-slate-800">
                    <Sparkles className="h-6 w-6 text-yellow-500" />
                    {t('home.more_deals', 'Mais Oportunidades')}
                  </h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {moreCoupons.map((coupon) => (
                      <CouponCard
                        key={coupon.id}
                        coupon={coupon}
                        variant="horizontal"
                      />
                    ))}
                  </div>
                </section>
              )}

              {filteredCoupons.length === 0 && (
                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200 shadow-sm mt-8">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-700">
                    {t(
                      'home.no_offers',
                      'Nenhuma oferta encontrada no momento.',
                    )}
                  </h3>
                  <p className="text-slate-500 mt-1 max-w-md mx-auto px-4">
                    {selectedCategory !== 'all' && !searchQuery
                      ? t(
                          'home.no_category_results',
                          'Não temos ofertas disponíveis nesta categoria no momento.',
                        )
                      : t(
                          'home.try_another_search',
                          'Tente usar outros termos de busca ou navegue pelas categorias disponíveis.',
                        )}
                  </p>
                  <Button
                    variant="outline"
                    className="mt-6"
                    onClick={() => {
                      setSearchQuery('')
                      setSelectedCategory('all')
                    }}
                  >
                    {t('home.clear_search', 'Limpar Busca e Filtros')}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="mt-12 w-full">
        <AdSpace position="bottom" className="border-t bg-white" />
      </div>
    </div>
  )
}

export default function Index() {
  return (
    <ErrorBoundary>
      <IndexContent />
    </ErrorBoundary>
  )
}
