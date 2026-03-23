import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCouponStore } from '@/stores/CouponContext'
import { useLanguage } from '@/stores/LanguageContext'
import { CouponCard } from '@/components/CouponCard'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Ticket,
  CalendarIcon,
  Gift,
  ChevronRight,
  TrendingUp,
  Sparkles,
  Search,
} from 'lucide-react'
import { Input } from '@/components/ui/input'

export default function Index() {
  const { t, formatDate } = useLanguage()
  const { coupons, seasonalEvents, trackSeasonalClick } = useCouponStore()
  const [searchQuery, setSearchQuery] = useState('')

  const activeEvents = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return seasonalEvents.filter((e) => {
      if (e.status !== 'active') return false
      const end = new Date(e.endDate)
      end.setHours(23, 59, 59, 999)
      return end >= today
    })
  }, [seasonalEvents])

  const filteredCoupons = useMemo(() => {
    return coupons.filter(
      (c) =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.storeName.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [coupons, searchQuery])

  const trendingCoupons = filteredCoupons.slice(0, 4)
  const moreCoupons = filteredCoupons.slice(4, 12)

  return (
    <div className="min-h-screen pb-20 md:pb-8 animate-fade-in">
      {/* Hero / Header banner */}
      <section className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent pt-8 md:pt-12 pb-12 px-4 mb-8 border-b">
        <div className="container mx-auto max-w-5xl">
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight leading-tight">
              {t('home.hero_title', 'Encontre as Melhores Ofertas e Cupons')}
            </h1>
            <p className="text-muted-foreground text-lg mb-8">
              {t(
                'home.hero_desc',
                'Descubra descontos exclusivos, eventos sazonais e economize em suas lojas e restaurantes favoritos.',
              )}
            </p>
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t(
                  'home.search_placeholder',
                  'Buscar ofertas, lojas...',
                )}
                className="pl-10 h-12 text-base rounded-full shadow-sm bg-white"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto max-w-5xl px-4 space-y-12">
        {/* Seasonal Events */}
        {activeEvents.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeEvents.map((event) => (
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
                        <div className="absolute top-2 left-2 flex gap-1">
                          <Badge
                            variant="secondary"
                            className="bg-white/95 text-black backdrop-blur-sm shadow-sm font-bold"
                          >
                            {event.type}
                          </Badge>
                        </div>
                      </div>
                    )}
                    <div className="p-5 flex-1 flex flex-col justify-between bg-white">
                      <div>
                        <h3 className="text-xl font-bold text-primary mb-2 line-clamp-2">
                          {event.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                          {event.description}
                        </p>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-slate-50 p-2 rounded-lg">
                          <CalendarIcon className="h-4 w-4 text-primary" />
                          {formatDate(event.startDate)} -{' '}
                          {formatDate(event.endDate)}
                        </div>
                        <Button
                          className="w-full gap-2 font-bold shadow-sm transition-transform hover:-translate-y-0.5"
                          size="lg"
                        >
                          <Ticket className="h-5 w-5" />
                          {t('home.get_voucher', 'Resgatar Voucher')}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Trending Coupons */}
        {trendingCoupons.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold flex items-center gap-2 mb-6 text-slate-800">
              <TrendingUp className="h-6 w-6 text-orange-500" />
              {t('home.trending', 'Em Alta')}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {trendingCoupons.map((coupon) => (
                <CouponCard key={coupon.id} coupon={coupon} />
              ))}
            </div>
          </section>
        )}

        {/* More Coupons */}
        {moreCoupons.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold flex items-center gap-2 mb-6 text-slate-800">
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
          <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <h3 className="text-lg font-bold text-slate-700">
              {t('home.no_results', 'Nenhuma oferta encontrada')}
            </h3>
            <p className="text-slate-500 mt-1">
              {t(
                'home.try_another_search',
                'Tente usar outros termos de busca.',
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
