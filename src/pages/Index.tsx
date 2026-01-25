import { useState } from 'react'
import {
  Search,
  MapPin,
  ArrowRight,
  Zap,
  Calendar,
  Sparkles,
  RefreshCw,
  Compass,
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
import { ItineraryCard } from '@/components/ItineraryCard'
import { CATEGORIES, MOODS } from '@/lib/data'
import * as Icons from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function Index() {
  const { coupons, itineraries, isLoadingLocation, refreshCoupons } =
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

  const getIcon = (iconName: string) => {
    // @ts-expect-error
    const Icon = Icons[iconName]
    return Icon ? <Icon className="h-5 w-5 mb-1" /> : null
  }

  return (
    <div className="pb-20 md:pb-8 bg-background">
      {/* Hero Section */}
      <section className="relative bg-secondary px-4 py-12 md:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://img.usecurling.com/p/1920/600?q=city%20pattern&color=blue')] opacity-20 mix-blend-multiply"></div>
        <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-primary/30 rounded-full blur-3xl"></div>
        <div className="container mx-auto relative z-10 text-center md:text-left md:flex md:items-center md:justify-between">
          <div className="md:w-1/2">
            <Badge className="mb-6 bg-accent text-accent-foreground border-none animate-fade-in-down px-3 py-1 text-sm shadow-md">
              <Zap className="h-3 w-3 mr-2 fill-current" /> Novas ofertas perto
              de você
            </Badge>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight drop-shadow-sm">
              {t('hero.title')}
            </h1>
            <p className="text-white/90 text-xl mb-8 max-w-lg mx-auto md:mx-0">
              {t('hero.subtitle')}
            </p>

            <div className="relative max-w-lg mx-auto md:mx-0 shadow-elevation rounded-full">
              <Search className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder={t('search.placeholder')}
                className="pl-12 h-14 rounded-full bg-white text-foreground border-0 text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button className="absolute right-2 top-2 h-10 rounded-full px-6 bg-primary hover:bg-primary/90 text-white font-bold">
                Buscar
              </Button>
            </div>

            <div className="mt-6 flex items-center justify-center md:justify-start text-white/80 text-sm gap-2">
              {isLoadingLocation ? (
                <span className="animate-pulse">Detectando localização...</span>
              ) : (
                <>
                  <MapPin className="h-4 w-4" />
                  <span>Localização atual: São Paulo, SP</span>
                </>
              )}
            </div>
          </div>

          <div className="hidden md:block md:w-5/12 pl-8">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-3xl transform rotate-6"></div>
              <img
                src="https://img.usecurling.com/p/600/400?q=happy%20shopper&dpr=2"
                alt="Happy Shopper"
                className="relative rounded-3xl shadow-2xl transform hover:-translate-y-2 transition-transform duration-500 border-4 border-white"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mood Discovery */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <h3 className="text-lg font-bold mb-4 text-foreground/80">
            {t('mood.title')}
          </h3>
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex space-x-3 pb-4">
              {MOODS.map((mood) => (
                <Button
                  key={mood.id}
                  variant={selectedMood === mood.id ? 'default' : 'outline'}
                  className={`rounded-full flex items-center gap-2 h-11 px-5 transition-all ${selectedMood === mood.id ? 'bg-secondary hover:bg-secondary/90 border-transparent text-white shadow-md' : 'border-input hover:border-primary hover:text-primary'}`}
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

      {/* Suggested Itineraries (Personalized Engine) */}
      <section className="py-10 bg-secondary/5">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground">
              <Compass className="h-6 w-6 text-secondary" /> Roteiros Sugeridos
            </h2>
          </div>
          <Carousel className="w-full">
            <CarouselContent className="-ml-4">
              {itineraries.map((itinerary) => (
                <CarouselItem
                  key={itinerary.id}
                  className="pl-4 basis-[85%] md:basis-1/2 lg:basis-1/3"
                >
                  <ItineraryCard itinerary={itinerary} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="hidden md:block">
              <CarouselPrevious />
              <CarouselNext />
            </div>
          </Carousel>
        </div>
      </section>

      {/* Categories Bar */}
      <section className="py-6">
        <div className="container mx-auto px-4">
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex space-x-6 pb-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  className="flex flex-col items-center justify-center min-w-[80px] group"
                >
                  <div className="h-16 w-16 rounded-2xl bg-white border shadow-sm flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-white transition-all duration-300 transform group-hover:scale-110">
                    {getIcon(cat.icon)}
                  </div>
                  <span className="text-xs font-semibold mt-3 text-muted-foreground group-hover:text-primary transition-colors">
                    {cat.label}
                  </span>
                </button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" className="invisible" />
          </ScrollArea>
        </div>
      </section>

      {/* Seasonal Highlights */}
      <section className="py-10 bg-gradient-to-r from-orange-50 to-amber-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2 text-primary">
              <Calendar className="h-6 w-6" />
              Sazonal: Esquenta Black Friday
            </h2>
            <Link to="/seasonal">
              <Button
                variant="outline"
                size="sm"
                className="text-primary border-primary hover:bg-primary hover:text-white"
              >
                Ver Calendário
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-primary to-orange-600 rounded-2xl p-8 text-white flex flex-col justify-center shadow-lg transform hover:scale-[1.02] transition-transform">
              <h3 className="text-3xl font-extrabold mb-4">Prepare-se!</h3>
              <p className="mb-6 text-white/90 text-lg leading-relaxed">
                As melhores ofertas do ano estão chegando. Veja o que a Deal Voy
                preparou para você.
              </p>
              <Button className="w-fit bg-white text-primary hover:bg-white/90 font-bold border-0">
                Ver Destaques
              </Button>
            </div>
            {/* Show mock seasonal items */}
            {coupons.slice(0, 2).map((coupon) => (
              <CouponCard
                key={coupon.id}
                coupon={coupon}
                variant="horizontal"
                className="h-auto"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Near You */}
      <section className="py-10 container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MapPin className="h-6 w-6 text-secondary" />
            Destaques Próximos
          </h2>
          <Link
            to="/explore"
            className="text-sm font-medium text-secondary hover:underline flex items-center"
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
      <section className="py-10 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Zap className="h-6 w-6 text-primary fill-primary" />
              Em Alta Agora
            </h2>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-primary/20 text-primary hover:bg-primary/5"
              onClick={refreshCoupons}
            >
              <RefreshCw className="h-4 w-4" /> {t('common.refresh')}
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
