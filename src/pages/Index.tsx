import { useState } from 'react'
import {
  Search,
  MapPin,
  ArrowRight,
  Zap,
  ShoppingBag,
  TrendingUp,
  LayoutGrid,
  Plane,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { useCouponStore } from '@/stores/CouponContext'
import { useLanguage } from '@/stores/LanguageContext'
import { CouponCard } from '@/components/CouponCard'
import { CATEGORIES } from '@/lib/data'
import * as Icons from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function Index() {
  const { coupons, isLoadingLocation, selectedRegion } = useCouponStore()
  const { t } = useLanguage()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const filteredCoupons = coupons.filter((c) => {
    if (
      searchQuery &&
      !c.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !c.storeName.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false
    if (selectedCategory !== 'all' && c.category !== selectedCategory)
      return false
    return true
  })

  const featuredCoupons = filteredCoupons.filter(
    (c) => c.isFeatured || c.source === 'partner',
  )
  const aggregatedCoupons = filteredCoupons.filter(
    (c) => c.source === 'aggregated',
  )

  const getIcon = (iconName: string) => {
    // @ts-expect-error - Icons are dynamic
    const Icon = Icons[iconName] || LayoutGrid
    return Icon ? <Icon className="h-5 w-5 mb-1" /> : null
  }

  const selectedCategoryLabel =
    CATEGORIES.find((c) => c.id === selectedCategory)?.translationKey ||
    'category.all'

  return (
    <div className="pb-20 md:pb-8 bg-slate-50 min-h-screen">
      <section className="bg-white border-b sticky top-16 z-30 shadow-sm md:static">
        <div className="container mx-auto px-4 py-4">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
            <Input
              placeholder={t('common.search')}
              className="pl-12 h-12 rounded-full bg-slate-100 border-transparent focus:bg-white focus:border-primary text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button
              size="sm"
              className="absolute right-1.5 top-1.5 h-9 rounded-full bg-primary hover:bg-primary/90 text-white font-bold px-4"
            >
              {t('common.search')}
            </Button>
          </div>
          <div className="mt-3 flex items-center justify-center text-xs text-slate-500 gap-2">
            {isLoadingLocation ? (
              <span className="animate-pulse">
                {t('home.detecting_location')}
              </span>
            ) : (
              <>
                <MapPin className="h-3 w-3" />
                <span>
                  {t('home.current_location')}{' '}
                  {selectedRegion === 'Global' ? 'Global' : selectedRegion}
                </span>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="bg-white border-b py-2">
        <div className="container mx-auto px-4">
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex space-x-6 px-2 py-2">
              {CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat.id
                return (
                  <button
                    key={cat.id}
                    className="flex flex-col items-center justify-center min-w-[72px] group"
                    onClick={() => setSelectedCategory(cat.id)}
                  >
                    <div
                      className={cn(
                        'h-14 w-14 rounded-full border flex items-center justify-center transition-all duration-300',
                        isActive
                          ? 'bg-primary text-white border-primary shadow-lg scale-110'
                          : 'bg-slate-50 border-slate-100 text-slate-500 group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20',
                      )}
                    >
                      {getIcon(cat.icon)}
                    </div>
                    <span
                      className={cn(
                        'text-xs font-medium mt-2 transition-colors',
                        isActive
                          ? 'text-primary font-bold'
                          : 'text-slate-600 group-hover:text-primary',
                      )}
                    >
                      {t(cat.translationKey)}
                    </span>
                  </button>
                )
              })}
            </div>
            <ScrollBar orientation="horizontal" className="invisible" />
          </ScrollArea>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 space-y-10">
        {featuredCoupons.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                <ShoppingBag className="h-5 w-5 text-primary" />
                {t('home.featured_deals')}
              </h2>
              <Link
                to="/explore"
                className="text-sm font-medium text-primary hover:underline flex items-center"
              >
                {t('common.view_all')} <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>

            <Carousel className="w-full">
              <CarouselContent className="-ml-4">
                {featuredCoupons.map((coupon) => (
                  <CarouselItem
                    key={coupon.id}
                    className="pl-4 basis-[70%] md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
                  >
                    <CouponCard coupon={coupon} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="hidden md:block">
                <CarouselPrevious />
                <CarouselNext />
              </div>
            </Carousel>
          </section>
        )}

        <section className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 md:p-8 relative overflow-hidden text-white shadow-lg">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10 md:flex items-center justify-between">
            <div className="mb-6 md:mb-0 md:w-1/2">
              <Badge className="bg-white/20 text-white border-none mb-3 hover:bg-white/30">
                {t('common.new')}: {t('hub.title')}
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                {t('hub.subtitle')}
              </h2>
              <p className="text-blue-100 mb-6 max-w-md">
                {t('hub.promo_desc')}
              </p>
              <Link to="/travel-hub">
                <Button className="bg-white text-blue-600 hover:bg-blue-50 font-bold rounded-full px-6 gap-2">
                  <Plane className="h-4 w-4" /> {t('common.search')}
                </Button>
              </Link>
            </div>
            <div className="md:w-5/12 flex justify-center">
              <Plane
                className="h-32 w-32 text-white/80 transform -rotate-12"
                strokeWidth={1}
              />
            </div>
          </div>
        </section>

        <section className="bg-secondary/10 rounded-2xl p-6 md:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10 md:flex items-center justify-between">
            <div className="mb-6 md:mb-0 md:w-1/2">
              <Badge className="bg-secondary text-white border-none mb-3">
                {t('travel.title')}
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                {t('home.travel_card_title')}
              </h2>
              <p className="text-slate-600 mb-6 max-w-md">
                {t('home.travel_card_desc')}
              </p>
              <Link to="/travel-planner">
                <Button className="bg-secondary hover:bg-secondary/90 text-white font-bold rounded-full px-6">
                  {t('home.plan_route')}
                </Button>
              </Link>
            </div>
            <div className="md:w-5/12">
              <img
                src="https://img.usecurling.com/p/600/400?q=road%20trip%20map&color=blue"
                alt="Travel Map"
                className="rounded-xl shadow-lg border-4 border-white transform rotate-1 hover:rotate-0 transition-transform duration-500"
              />
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
              <TrendingUp className="h-5 w-5 text-accent" />
              {t('home.tracked_deals')}
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {aggregatedCoupons.length > 0
              ? aggregatedCoupons.map((coupon) => (
                  <CouponCard key={coupon.id} coupon={coupon} />
                ))
              : featuredCoupons.slice(0, 4).map((coupon) => (
                  <div key={`fallback-${coupon.id}`} className="opacity-75">
                    <CouponCard coupon={coupon} />
                  </div>
                ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
              <Zap className="h-5 w-5 text-yellow-500" />
              {selectedCategory === 'all'
                ? t('home.all_offers')
                : `${t('home.offers_of')} ${t(selectedCategoryLabel)}`}
            </h2>
          </div>
          {filteredCoupons.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredCoupons.map((coupon) => (
                <CouponCard key={`all-${coupon.id}`} coupon={coupon} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground bg-white rounded-lg border border-dashed">
              {t('home.no_offers')}
              <Button
                variant="link"
                className="text-primary"
                onClick={() => setSelectedCategory('all')}
              >
                {t('common.view_all')}
              </Button>
            </div>
          )}
          {filteredCoupons.length > 0 && (
            <div className="mt-8 text-center">
              <Button
                variant="outline"
                size="lg"
                className="rounded-full px-8 border-primary text-primary hover:bg-primary/5"
              >
                {t('common.load_more')}
              </Button>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
