import { useState, useEffect } from 'react'
import {
  Search,
  MapPin,
  ArrowRight,
  Zap,
  ShoppingBag,
  TrendingUp,
  LayoutGrid,
  Plane,
  Edit,
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
import { Link, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { AdSpace } from '@/components/AdSpace'
import { Advertisement } from '@/lib/types'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

export default function Index() {
  const {
    coupons,
    isLoadingLocation,
    selectedRegion,
    user,
    ads,
    updateUserPreferences,
  } = useCouponStore()
  const { t } = useLanguage()

  // Use URL Params for search state to sync with MobileHeader
  const [searchParams, setSearchParams] = useSearchParams()
  const urlQuery = searchParams.get('q') || ''
  const [searchQuery, setSearchQuery] = useState(urlQuery)

  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const [widgets, setWidgets] = useState({
    categories: true,
    featured: true,
    travel: true,
    tracked: true,
    all: true,
  })

  // Sync local state with URL params
  useEffect(() => {
    setSearchQuery(urlQuery)
  }, [urlQuery])

  // Update URL params when local search changes (for desktop input)
  const handleSearchChange = (val: string) => {
    setSearchQuery(val)
    setSearchParams(
      (prev) => {
        if (val) prev.set('q', val)
        else prev.delete('q')
        return prev
      },
      { replace: true },
    )
  }

  useEffect(() => {
    if (user?.preferences?.dashboardWidgets) {
      const w = user.preferences.dashboardWidgets
      setWidgets({
        categories: w.includes('categories'),
        featured: w.includes('featured'),
        travel: w.includes('travel'),
        tracked: w.includes('tracked'),
        all: w.includes('all'),
      })
    }
  }, [user])

  const toggleWidget = (key: keyof typeof widgets) => {
    const newWidgets = { ...widgets, [key]: !widgets[key] }
    setWidgets(newWidgets)
    // Persist preference
    const widgetList = Object.keys(newWidgets).filter(
      (k) => newWidgets[k as keyof typeof widgets],
    )
    updateUserPreferences({ dashboardWidgets: widgetList })
  }

  // Role Based View Logic
  const isEndUser = !user || user.role === 'user'

  if (!isEndUser) {
    let relevantAds: Advertisement[] = []
    let dashboardLink = '/'
    let dashboardLabel = ''
    const welcomeMessage = t('common.welcome')
    const managementPanel = t('dashboard.management_panel')
    const campaignsTitle = t('dashboard.your_campaigns')
    const noCampaignsMessage = t('dashboard.no_active_campaigns')
    const createAdLabel = t('dashboard.create_campaign')

    if (user?.role === 'shopkeeper') {
      relevantAds = ads.filter((ad) => ad.companyId === user.companyId)
      dashboardLink = '/vendor'
      dashboardLabel = t('nav.vendor')
    } else if (user?.role === 'franchisee') {
      relevantAds = ads.filter((ad) => ad.region === user.region)
      dashboardLink = '/admin'
      dashboardLabel = t('nav.admin')
    } else if (user?.role === 'super_admin') {
      relevantAds = ads
      dashboardLink = '/admin'
      dashboardLabel = t('nav.admin')
    } else if (user?.role === 'agency') {
      relevantAds = []
      dashboardLink = '/agency'
      dashboardLabel = t('nav.agency')
    }

    return (
      <div className="pb-20 md:pb-8 bg-slate-50 min-h-screen pt-10">
        <div className="container mx-auto px-4 space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold text-slate-900">
              {welcomeMessage}, {user?.name}
            </h1>
            <p className="text-muted-foreground text-lg">{managementPanel}</p>
            <div className="flex justify-center">
              <Link to={dashboardLink}>
                <Button className="gap-2 h-12 px-8 text-base shadow-md">
                  <LayoutGrid className="h-5 w-5" />
                  {t('common.go_to')} {dashboardLabel}
                </Button>
              </Link>
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              {campaignsTitle}
            </h2>

            {relevantAds.length > 0 ? (
              <div className="space-y-4">
                <AdSpace position="top" customAds={relevantAds} />
                {relevantAds.length > 1 && (
                  <AdSpace position="bottom" customAds={relevantAds} />
                )}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-xl border border-dashed shadow-sm">
                <p className="text-muted-foreground mb-4">
                  {noCampaignsMessage}
                </p>
                {user?.role === 'shopkeeper' && (
                  <Link to="/vendor">
                    <Button variant="outline" size="sm">
                      {createAdLabel}
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

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
    return Icon ? <Icon className="h-4 w-4" /> : null
  }

  const selectedCategoryLabel =
    CATEGORIES.find((c) => c.id === selectedCategory)?.translationKey ||
    'category.all'

  return (
    <div className="pb-20 md:pb-8 bg-slate-50/50 min-h-screen">
      {/* Hidden on mobile to use MobileHeader search instead */}
      <section className="bg-white border-b hidden md:block sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-4 py-2">
          <div className="relative max-w-lg mx-auto flex items-center">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder={t('common.search')}
              className="pl-9 pr-24 h-9 rounded-full bg-slate-50 border-transparent focus:bg-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 text-sm transition-all"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
            <Button
              size="sm"
              className="absolute right-1 top-1 h-7 rounded-full bg-primary hover:bg-primary/90 text-white font-semibold px-4 text-xs"
            >
              {t('common.search')}
            </Button>
          </div>
          <div className="mt-1.5 flex items-center justify-center text-[10px] text-slate-400 gap-1.5">
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

      {/* Dashboard Customizer */}
      <div className="container mx-auto px-4 pt-3 pb-1 flex justify-end">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-[10px] gap-1.5 text-muted-foreground hover:text-foreground px-2"
            >
              <Edit className="h-3 w-3" /> {t('dashboard.customize')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-52" align="end">
            <div className="space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                {t('dashboard.visible_widgets')}
              </h4>
              <div className="flex items-center justify-between">
                <Label htmlFor="w-cat" className="text-xs">
                  {t('explore.categories')}
                </Label>
                <Checkbox
                  id="w-cat"
                  checked={widgets.categories}
                  onCheckedChange={() => toggleWidget('categories')}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="w-feat" className="text-xs">
                  {t('home.featured_deals')}
                </Label>
                <Checkbox
                  id="w-feat"
                  checked={widgets.featured}
                  onCheckedChange={() => toggleWidget('featured')}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="w-trav" className="text-xs">
                  {t('hub.title')}
                </Label>
                <Checkbox
                  id="w-trav"
                  checked={widgets.travel}
                  onCheckedChange={() => toggleWidget('travel')}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="w-track" className="text-xs">
                  {t('home.tracked_deals')}
                </Label>
                <Checkbox
                  id="w-track"
                  checked={widgets.tracked}
                  onCheckedChange={() => toggleWidget('tracked')}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="w-all" className="text-xs">
                  {t('home.all_offers')}
                </Label>
                <Checkbox
                  id="w-all"
                  checked={widgets.all}
                  onCheckedChange={() => toggleWidget('all')}
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {widgets.categories && (
        <section className="bg-white border-y py-1.5 shadow-sm">
          <div className="container mx-auto px-2 md:px-4">
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex space-x-2 md:space-x-6 px-2 py-1.5 justify-start md:justify-center">
                {CATEGORIES.map((cat) => {
                  const isActive = selectedCategory === cat.id
                  return (
                    <button
                      key={cat.id}
                      className="flex flex-col items-center justify-center min-w-[56px] group"
                      onClick={() => setSelectedCategory(cat.id)}
                    >
                      <div
                        className={cn(
                          'h-10 w-10 md:h-12 md:w-12 rounded-full border flex items-center justify-center transition-all duration-300',
                          isActive
                            ? 'bg-primary text-white border-primary shadow-sm scale-105'
                            : 'bg-slate-50 border-slate-100 text-slate-500 group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20',
                        )}
                      >
                        {getIcon(cat.icon)}
                      </div>
                      <span
                        className={cn(
                          'text-[10px] md:text-xs font-medium mt-1.5 transition-colors',
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
      )}

      <div className="container mx-auto px-3 md:px-4 py-4 md:py-6 space-y-6 md:space-y-8">
        <AdSpace position="top" className="py-0 md:py-0" />

        {searchQuery && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Showing results for:
            </span>
            <Badge variant="secondary" className="gap-1 pl-1 text-[10px] h-5">
              <span className="bg-white rounded-full p-0.5">
                <Search className="h-2.5 w-2.5" />
              </span>
              {searchQuery}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-0.5 hover:bg-transparent"
                onClick={() => handleSearchChange('')}
              >
                <span className="sr-only">Clear</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-x h-2.5 w-2.5"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </Button>
            </Badge>
          </div>
        )}

        {widgets.featured && featuredCoupons.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base md:text-lg font-bold flex items-center gap-1.5 text-slate-800">
                <ShoppingBag className="h-4 w-4 text-primary" />
                {t('home.featured_deals')}
              </h2>
              <Link
                to="/explore"
                className="text-[11px] md:text-xs font-medium text-primary hover:underline flex items-center"
              >
                {t('common.view_all')} <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </div>

            <Carousel className="w-full">
              <CarouselContent className="-ml-3">
                {featuredCoupons.map((coupon) => (
                  <CarouselItem
                    key={coupon.id}
                    className="pl-3 basis-[45%] sm:basis-[30%] md:basis-1/4 lg:basis-1/5 xl:basis-1/6"
                  >
                    <CouponCard coupon={coupon} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="hidden md:block">
                <CarouselPrevious className="h-8 w-8 -left-4" />
                <CarouselNext className="h-8 w-8 -right-4" />
              </div>
            </Carousel>
          </section>
        )}

        {widgets.travel && (
          <section className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-4 md:p-6 relative overflow-hidden text-white shadow-md">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between">
              <div className="mb-4 sm:mb-0 sm:w-2/3">
                <Badge className="bg-white/20 text-white border-none mb-2 text-[9px] uppercase tracking-wider hover:bg-white/30 px-1.5 py-0 h-4">
                  {t('common.new')}: {t('hub.title')}
                </Badge>
                <h2 className="text-lg md:text-xl font-bold mb-1">
                  {t('hub.subtitle')}
                </h2>
                <p className="text-blue-100 text-[11px] md:text-xs mb-3 max-w-sm line-clamp-2">
                  {t('hub.promo_desc')}
                </p>
                <Link to="/travel-hub">
                  <Button
                    size="sm"
                    className="bg-white text-blue-600 hover:bg-blue-50 font-bold rounded-full px-4 h-7 text-[11px] gap-1.5 shadow-sm"
                  >
                    <Plane className="h-3 w-3" /> {t('common.search')}
                  </Button>
                </Link>
              </div>
              <div className="hidden sm:flex sm:w-1/3 justify-end pr-4">
                <Plane
                  className="h-16 w-16 md:h-20 md:w-20 text-white/40 transform -rotate-12"
                  strokeWidth={1.5}
                />
              </div>
            </div>
          </section>
        )}

        {widgets.tracked && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base md:text-lg font-bold flex items-center gap-1.5 text-slate-800">
                <TrendingUp className="h-4 w-4 text-accent" />
                {t('home.tracked_deals')}
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {aggregatedCoupons.length > 0
                ? aggregatedCoupons
                    .slice(0, 6)
                    .map((coupon) => (
                      <CouponCard key={coupon.id} coupon={coupon} />
                    ))
                : featuredCoupons.slice(0, 4).map((coupon) => (
                    <div key={`fallback-${coupon.id}`} className="opacity-80">
                      <CouponCard coupon={coupon} />
                    </div>
                  ))}
            </div>
          </section>
        )}

        <AdSpace position="bottom" className="py-0 md:py-0" />

        {widgets.all && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base md:text-lg font-bold flex items-center gap-1.5 text-slate-800">
                <Zap className="h-4 w-4 text-yellow-500" />
                {selectedCategory === 'all'
                  ? t('home.all_offers')
                  : `${t('home.offers_of')} ${t(selectedCategoryLabel)}`}
              </h2>
            </div>
            {filteredCoupons.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {filteredCoupons.map((coupon) => (
                  <CouponCard key={`all-${coupon.id}`} coupon={coupon} />
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-muted-foreground bg-white rounded-lg border border-dashed">
                <p className="text-sm mb-2">{t('home.no_offers')}</p>
                <Button
                  variant="link"
                  size="sm"
                  className="text-primary h-auto py-0"
                  onClick={() => {
                    setSelectedCategory('all')
                    handleSearchChange('')
                  }}
                >
                  {t('common.view_all')}
                </Button>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  )
}
