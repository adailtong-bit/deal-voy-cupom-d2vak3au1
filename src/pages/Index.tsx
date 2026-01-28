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
  Eye,
  EyeOff,
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
  const { t, language } = useLanguage()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const [widgets, setWidgets] = useState({
    categories: true,
    featured: true,
    travel: true,
    tracked: true,
    all: true,
  })

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
    let welcomeMessage =
      language === 'pt' ? 'Painel de Gestão' : 'Management Dashboard'
    const campaignsTitle =
      language === 'pt' ? 'Suas Campanhas' : 'Your Campaigns'
    const noCampaignsMessage =
      language === 'pt'
        ? 'Nenhuma campanha ativa encontrada.'
        : 'No active campaigns found.'
    const createAdLabel =
      language === 'pt' ? 'Criar Campanha' : 'Create Campaign'

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
              {t('common.welcome') || 'Welcome'}, {user?.name}
            </h1>
            <p className="text-muted-foreground text-lg">{welcomeMessage}</p>
            <div className="flex justify-center">
              <Link to={dashboardLink}>
                <Button className="gap-2 h-12 px-8 text-base shadow-md">
                  <LayoutGrid className="h-5 w-5" />
                  {t('common.go_to') || 'Go to'} {dashboardLabel}
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
              <div className="space-y-6">
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
                    <Button variant="outline">{createAdLabel}</Button>
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

      {/* Dashboard Customizer */}
      <div className="container mx-auto px-4 pt-4 flex justify-end">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2 text-xs">
              <Edit className="h-3 w-3" /> Customize Dashboard
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56" align="end">
            <div className="space-y-3">
              <h4 className="font-bold text-sm">Visible Widgets</h4>
              <div className="flex items-center justify-between">
                <Label htmlFor="w-cat">Categories</Label>
                <Checkbox
                  id="w-cat"
                  checked={widgets.categories}
                  onCheckedChange={() => toggleWidget('categories')}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="w-feat">Featured Deals</Label>
                <Checkbox
                  id="w-feat"
                  checked={widgets.featured}
                  onCheckedChange={() => toggleWidget('featured')}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="w-trav">Travel Hub</Label>
                <Checkbox
                  id="w-trav"
                  checked={widgets.travel}
                  onCheckedChange={() => toggleWidget('travel')}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="w-track">Tracked Deals</Label>
                <Checkbox
                  id="w-track"
                  checked={widgets.tracked}
                  onCheckedChange={() => toggleWidget('tracked')}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="w-all">All Offers</Label>
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
        <section className="bg-white border-b py-2">
          <div className="container mx-auto px-4">
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex space-x-4 md:space-x-8 px-2 py-2 justify-start md:justify-center">
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
      )}

      <div className="container mx-auto px-4 py-8 space-y-10">
        <AdSpace position="top" />

        {widgets.featured && featuredCoupons.length > 0 && (
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

        {widgets.travel && (
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
        )}

        {widgets.tracked && (
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
        )}

        <AdSpace position="bottom" />

        {widgets.all && (
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
          </section>
        )}
      </div>
    </div>
  )
}
