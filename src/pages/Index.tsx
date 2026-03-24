import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCouponStore } from '@/stores/CouponContext'
import { useLanguage } from '@/stores/LanguageContext'
import { CouponCard } from '@/components/CouponCard'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AdSpace } from '@/components/AdSpace'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { CATEGORIES } from '@/lib/data'
import { cn } from '@/lib/utils'
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
} from 'lucide-react'
import { Input } from '@/components/ui/input'

export default function Index() {
  const { t, formatDate } = useLanguage()
  const navigate = useNavigate()
  const {
    coupons,
    seasonalEvents,
    trackSeasonalClick,
    userLocation,
    reservedIds,
    platformSettings,
  } = useCouponStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1)
    } else {
      navigate('/vendor')
    }
  }

  const activeEvents = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return seasonalEvents.filter((e) => {
      if (e.status !== 'active') return false
      if (reservedIds.includes(e.id)) return false
      const end = new Date(e.endDate)
      end.setHours(23, 59, 59, 999)
      return end >= today
    })
  }, [seasonalEvents, reservedIds])

  const filteredCoupons = useMemo(() => {
    return coupons.filter((c) => {
      if (reservedIds.includes(c.id)) return false

      const matchesSearch =
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.category.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCategory =
        selectedCategory === 'all' || c.category === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [coupons, searchQuery, selectedCategory, reservedIds])

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
    platformSettings.mainCategories || CATEGORIES.slice(1, 5).map((c) => c.id)
  const mainCategories = CATEGORIES.filter((c) =>
    mainCategoryIds.includes(c.id),
  ).slice(0, 4)
  const secondaryCategories = CATEGORIES.filter(
    (c) => c.id !== 'all' && !mainCategoryIds.includes(c.id),
  )
  const isSecondarySelected = secondaryCategories.some(
    (c) => c.id === selectedCategory,
  )

  return (
    <div className="min-h-screen pb-20 md:pb-8 animate-fade-in bg-slate-50/30">
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
                  'home.search_placeholder',
                  'Buscar ofertas, lojas ou categorias...',
                )}
                className="pl-12 h-12 sm:h-14 text-base rounded-full shadow-sm bg-slate-50 border-slate-200 focus-visible:ring-primary/30 focus-visible:bg-white transition-all w-full"
              />
            </div>

            {userLocation && (
              <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600 animate-fade-in pl-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>
                  {t(
                    'home.location_active',
                    'Mostrando ofertas próximas a você',
                  )}
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="container mx-auto max-w-5xl px-4 mt-6">
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
          {activeEvents.length > 0 &&
            !searchQuery &&
            selectedCategory === 'all' && (
              <section>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
                    <Gift className="h-6 w-6 text-primary" />
                    {t('home.seasonal_events', 'Ofertas Sazonais em Destaque')}
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
                  {activeEvents.slice(0, 2).map((event) => (
                    <Card
                      key={event.id}
                      className="overflow-hidden border-primary/20 hover:border-primary/50 transition-all hover:shadow-md group cursor-pointer"
                      onClick={() => trackSeasonalClick(event.id)}
                    >
                      <div className="flex flex-col sm:flex-row h-full">
                        {event.image && (
                          <div className="w-full sm:w-2/5 h-48 sm:h-auto relative overflow-hidden bg-slate-100 shrink-0">
                            <img
                              src={event.image}
                              alt={event.title}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute top-2 left-2 flex gap-1 flex-col items-start">
                              <Badge
                                variant="secondary"
                                className="bg-white/95 text-black backdrop-blur-sm shadow-sm font-bold capitalize"
                              >
                                {t(`event.type.${event.type}`, event.type)}
                              </Badge>
                              {(event.offerType === 'online' ||
                                event.externalUrl) && (
                                <Badge className="bg-blue-600 text-white font-bold shadow-sm border-none">
                                  <Globe className="w-3 h-3 mr-1" /> Online
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between bg-white">
                          <div>
                            <h3 className="text-lg sm:text-xl font-bold text-primary mb-1.5 line-clamp-2">
                              {event.title}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 sm:line-clamp-3 mb-4">
                              {event.description}
                            </p>
                          </div>
                          <div className="space-y-4 mt-auto">
                            <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-600 bg-slate-50 p-2 rounded-lg">
                              <CalendarIcon className="h-4 w-4 text-primary shrink-0" />
                              <span className="truncate">
                                {formatDate(event.startDate)} -{' '}
                                {formatDate(event.endDate)}
                              </span>
                            </div>
                            <Button
                              asChild
                              className="w-full gap-2 font-bold shadow-sm transition-transform hover:-translate-y-0.5"
                              size="lg"
                            >
                              <Link to={`/voucher/${event.id}`}>
                                <Ticket className="h-5 w-5" />
                                {t('home.get_voucher', 'Resgatar Voucher')}
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
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
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                {t('home.no_results', 'Nenhuma oferta encontrada')}
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
        </div>
      </div>
    </div>
  )
}
