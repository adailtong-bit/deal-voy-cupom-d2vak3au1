import { useState } from 'react'
import { Search, MapPin, ArrowRight, Zap } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
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
import { CouponCard } from '@/components/CouponCard'
import { CATEGORIES } from '@/lib/data'
import * as Icons from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Index() {
  const { coupons, userLocation, isLoadingLocation } = useCouponStore()
  const [searchQuery, setSearchQuery] = useState('')

  const featuredCoupons = coupons.filter((c) => c.isFeatured)
  const trendingCoupons = coupons.filter((c) => c.isTrending)

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
              Economize <br className="md:hidden" />
              <span className="text-secondary">perto de você</span>
            </h1>
            <p className="text-primary-foreground/90 text-lg mb-6 max-w-md mx-auto md:mx-0">
              Descubra cupons exclusivos e oportunidades imperdíveis na sua
              região.
            </p>

            <div className="relative max-w-md mx-auto md:mx-0">
              <Search className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Busque por loja, categoria ou produto..."
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

      {/* Categories Bar */}
      <section className="py-6 bg-background border-b sticky top-[64px] md:top-0 z-30 shadow-sm">
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
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {trendingCoupons.map((coupon) => (
              <CouponCard key={coupon.id} coupon={coupon} variant="vertical" />
            ))}
            {/* Fill with regular coupons if not enough trending */}
            {coupons
              .filter((c) => !c.isTrending)
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

      {/* CTA Section */}
      <section className="py-12 container mx-auto px-4">
        <div className="bg-gradient-to-r from-primary to-emerald-600 rounded-2xl p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between shadow-xl">
          <div className="mb-6 md:mb-0 md:max-w-lg">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Encontrou uma oferta imperdível?
            </h2>
            <p className="text-primary-foreground/90 mb-6">
              Ajude a comunidade compartilhando cupons e oportunidades que você
              encontrou. Ganhe pontos e destaque no ranking!
            </p>
            <Link to="/upload">
              <Button size="lg" variant="secondary" className="font-bold">
                Compartilhar Oferta (Subir Doc)
              </Button>
            </Link>
          </div>
          <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
            <Icons.UploadCloud className="h-16 w-16 text-white" />
          </div>
        </div>
      </section>
    </div>
  )
}
