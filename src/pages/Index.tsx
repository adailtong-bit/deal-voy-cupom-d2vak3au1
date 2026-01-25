import { useState } from 'react'
import {
  Search,
  MapPin,
  ArrowRight,
  Zap,
  Calendar,
  Sparkles,
  RefreshCw,
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
import { CATEGORIES, MOODS } from '@/lib/data'
import * as Icons from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function Index() {
  const { coupons, userLocation, isLoadingLocation, refreshCoupons } =
    useCouponStore()
  const { t } = useLanguage()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMood, setSelectedMood] = useState<string | null>(null)

  const filteredCoupons = coupons.filter((c) => {
    if (selectedMood && (!c.moods || !c.moods.includes(selectedMood as any)))
      return false
    if (
      searchQuery &&
      !c.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false
    return true
  })

  const featuredCoupons = filteredCoupons.filter((c) => c.isFeatured)
  const trendingCoupons = filteredCoupons.filter((c) => c.isTrending)
  const specialCoupons = filteredCoupons.filter((c) => c.isSpecial)

  // Helper to dynamically get icon component
  const getIcon = (iconName: string) => {
    // @ts-expect-error
    const Icon = Icons[iconName]
    return Icon ? <Icon className="h-5 w-5 mb-1" /> : null
  }

  return (
    <div className="pb-20 md:pb-8">
      {/* Hero Section */}
      <section className="relative bg-primary px-4 py-8 md:py-16 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://img.usecurling.com/p/1920/600?q=city%20pattern&color=green')] opacity-10 mix-blend-multiply"></div>
        <div className="container mx-auto relative z-10 text-center md:text-left md:flex md:items-center md:justify-between">
          <div className="md:w-1/2">
            <Badge
              variant="secondary"
              className="mb-4 bg-secondary text-white border-none animate-fade-in-down"
            >
              <Zap className="h-3 w-3 mr-1 fill-current" /> Novas ofertas perto
              de você
            </Badge>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
              {t('hero.title')}
            </h1>
            <p className="text-primary-foreground/90 text-lg mb-6 max-w-md mx-auto md:mx-0">
              {t('hero.subtitle')}
            </p>

            <div className="relative max-w-md mx-auto md:mx-0">
              <Search className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder={t('search.placeholder')}
                className="pl-10 h-12 rounded-full bg-white text-foreground shadow-lg border-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="mt-4 flex items-center justify-center md:justify-start text-primary-foreground/80 text-sm gap-2">
              {isLoadingLocation ? (
                <span className="animate-pulse">Detectando localização...</span>
              ) : (
                <>
                  <MapPin className="h-4 w-4" />
                  <span>Localização atual: São Paulo, SP (Precisão alta)</span>
                </>
              )}
            </div>
          </div>

          <div className="hidden md:block md:w-1/2 pl-8">
            <img
              src="https://img.usecurling.com/p/600/400?q=happy%20shopper&dpr=2"
              alt="Happy Shopper"
              className="rounded-2xl shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500 border-4 border-white/20"
            />
          </div>
        </div>
      </section>

      {/* Mood Discovery */}
      <section className="py-6 bg-muted/20">
        <div className="container mx-auto px-4">
          <h3 className="text-lg font-bold mb-4">{t('mood.title')}</h3>
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex space-x-3 pb-2">
              {MOODS.map((mood) => (
                <Button
                  key={mood.id}
                  variant={selectedMood === mood.id ? 'default' : 'outline'}
                  className="rounded-full flex items-center gap-2 h-10"
                  onClick={() =>
                    setSelectedMood(selectedMood === mood.id ? null : mood.id)
                  }
                >
                  {getIcon(mood.icon)}
                  {mood.label}
                </Button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" className="invisible" />
          </ScrollArea>
        </div>
      </section>

      {/* Categories Bar */}
      <section className="py-4 bg-background border-b sticky top-[64px] md:top-0 z-30 shadow-sm">
        <div className="container mx-auto px-4">
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex space-x-4 pb-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  className="flex flex-col items-center justify-center min-w-[72px] group"
                >
                  <div className="h-14 w-14 rounded-full bg-white border shadow-sm flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                    {getIcon(cat.icon)}
                  </div>
                  <span className="text-xs font-medium mt-2 text-muted-foreground group-hover:text-primary transition-colors">
                    {cat.label}
                  </span>
                </button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" className="invisible" />
          </ScrollArea>
        </div>
      </section>

      {/* Seasonal Highlights (New) */}
      <section className="py-8 bg-orange-50/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2 text-orange-700">
              <Calendar className="h-5 w-5" />
              Sazonal: Esquenta Black Friday
            </h2>
            <Link to="/seasonal">
              <Button
                variant="ghost"
                size="sm"
                className="text-orange-700 hover:text-orange-800 hover:bg-orange-100"
              >
                Ver Calendário
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-6 text-white flex flex-col justify-center shadow-lg">
              <h3 className="text-2xl font-bold mb-2">Prepare-se!</h3>
              <p className="mb-4 text-white/90">
                As melhores ofertas do ano estão chegando. Veja o que preparamos
                para você.
              </p>
              <Button variant="secondary" className="w-fit">
                Ver Destaques
              </Button>
            </div>
            {/* Show mock seasonal items */}
            {coupons.slice(0, 2).map((coupon) => (
              <CouponCard
                key={coupon.id}
                coupon={coupon}
                variant="horizontal"
                className="h-40"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Local Specials (Discovery) */}
      {specialCoupons.length > 0 && (
        <section className="py-8 container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2 text-purple-700">
              <Sparkles className="h-5 w-5" />
              Achados Locais & Especiais
            </h2>
          </div>
          <Carousel className="w-full">
            <CarouselContent className="-ml-4">
              {specialCoupons.map((coupon) => (
                <CarouselItem
                  key={coupon.id}
                  className="pl-4 basis-[85%] md:basis-1/2 lg:basis-1/3"
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

      {/* Featured Near You */}
      <section className="py-8 container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Destaques Próximos
          </h2>
          <Link
            to="/explore"
            className="text-sm font-medium text-primary hover:underline flex items-center"
          >
            Ver tudo <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>

        <Carousel className="w-full">
          <CarouselContent className="-ml-4">
            {featuredCoupons.map((coupon) => (
              <CarouselItem
                key={coupon.id}
                className="pl-4 basis-[85%] md:basis-1/2 lg:basis-1/3"
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

      {/* Trending Grid */}
      <section className="py-8 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
              <Zap className="h-5 w-5 text-secondary fill-secondary" />
              Em Alta Agora
            </h2>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={refreshCoupons}
            >
              <RefreshCw className="h-3 w-3" /> {t('common.refresh')}
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {trendingCoupons.map((coupon) => (
              <CouponCard key={coupon.id} coupon={coupon} variant="vertical" />
            ))}
            {/* Fill with regular coupons if not enough trending */}
            {filteredCoupons
              .filter((c) => !c.isTrending && !c.isSpecial)
              .slice(0, 4)
              .map((coupon) => (
                <CouponCard
                  key={coupon.id}
                  coupon={coupon}
                  variant="vertical"
                />
              ))}
          </div>
        </div>
      </section>
    </div>
  )
}
