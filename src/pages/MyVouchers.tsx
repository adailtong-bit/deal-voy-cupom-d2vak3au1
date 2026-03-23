import { useCouponStore } from '@/stores/CouponContext'
import { useLanguage } from '@/stores/LanguageContext'
import { Link } from 'react-router-dom'
import { Ticket, Search, CheckCircle2, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export default function MyVouchers() {
  const { reservedIds, coupons, seasonalEvents, companies, usedVouchers } =
    useCouponStore()
  const { t } = useLanguage()

  const myCoupons = coupons.filter((c) => reservedIds.includes(c.id))
  const myEvents = seasonalEvents.filter((e) => reservedIds.includes(e.id))

  const getCompanyName = (id?: string) => {
    if (!id) return 'Loja Parceira'
    return companies.find((c) => c.id === id)?.name || 'Loja Parceira'
  }

  const allVouchers = [
    ...myCoupons.map((c) => ({
      id: c.id,
      title: c.title,
      storeName: c.storeName,
      discount: c.discount,
      image: c.image,
      type: 'coupon',
      isUsed: c.status === 'used',
      isOnline: c.offerType === 'online',
    })),
    ...myEvents.map((e) => {
      const code =
        e.vouchers && e.vouchers.length > 0
          ? e.vouchers[0]
          : `VCH-${e.id.substring(0, 6).toUpperCase()}`
      return {
        id: e.id,
        title: e.title,
        storeName: getCompanyName(e.companyId),
        discount: e.type === 'sale' ? 'Sale' : 'Evento Especial',
        image: e.image,
        type: 'event',
        isUsed: usedVouchers.includes(code),
        isOnline: e.offerType === 'online',
      }
    }),
  ]

  allVouchers.sort((a, b) => (a.isUsed === b.isUsed ? 0 : a.isUsed ? 1 : -1))

  return (
    <div className="container py-8 max-w-5xl mx-auto mb-16 md:mb-0 animate-fade-in">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2 text-slate-800">
        <Ticket className="h-8 w-8 text-primary" />
        {t('vouchers.title', 'Meus Vouchers')}
      </h1>

      {allVouchers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200 shadow-sm mt-8">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-700">
            {t('vouchers.empty_title', 'Nenhum voucher resgatado')}
          </h3>
          <p className="text-slate-500 mt-1 max-w-md mx-auto px-4 mb-6">
            {t(
              'vouchers.empty_desc',
              'Você ainda não resgatou nenhuma oferta. Explore o feed principal para encontrar as melhores oportunidades.',
            )}
          </p>
          <Button asChild>
            <Link to="/">{t('vouchers.explore', 'Explorar Ofertas')}</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allVouchers.map((v) => (
            <Card
              key={v.id}
              className={cn(
                'overflow-hidden hover:shadow-md transition-shadow group flex flex-col',
                v.isUsed && 'opacity-75',
              )}
            >
              <div className="h-32 bg-slate-100 relative overflow-hidden shrink-0">
                <img
                  src={v.image}
                  alt={v.title}
                  className={cn(
                    'w-full h-full object-cover transition-transform duration-500',
                    !v.isUsed && 'group-hover:scale-105',
                    v.isUsed && 'grayscale',
                  )}
                />
                <Badge className="absolute top-2 left-2 bg-white/95 text-black hover:bg-white shadow-sm font-bold backdrop-blur-sm">
                  {v.discount}
                </Badge>

                {v.isOnline && !v.isUsed && (
                  <Badge className="absolute top-2 right-2 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm border-none backdrop-blur-sm">
                    <Globe className="w-3 h-3 mr-1" />
                    Online
                  </Badge>
                )}

                {v.isUsed && (
                  <div className="absolute inset-0 bg-white/40 flex items-center justify-center backdrop-blur-[1px]">
                    <Badge
                      variant="secondary"
                      className="bg-white text-emerald-600 font-bold px-3 py-1 shadow-md"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Utilizado
                    </Badge>
                  </div>
                )}
              </div>
              <CardContent className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-lg leading-tight mb-1 text-slate-800 line-clamp-1">
                    {v.title}
                  </h3>
                  <p className="text-sm text-slate-500 mb-4 truncate flex items-center gap-1.5">
                    {v.isOnline && <Globe className="w-3 h-3" />}
                    {v.storeName}
                  </p>
                </div>
                <Button
                  asChild
                  variant={
                    v.isUsed ? 'secondary' : v.isOnline ? 'default' : 'outline'
                  }
                  className={cn(
                    'w-full mt-auto font-medium shadow-sm transition-colors',
                    !v.isUsed &&
                      !v.isOnline &&
                      'hover:bg-primary hover:text-white hover:border-primary',
                    v.isOnline &&
                      !v.isUsed &&
                      'bg-blue-600 hover:bg-blue-700 text-white',
                  )}
                >
                  <Link to={`/voucher/${v.id}`}>
                    {v.isOnline ? (
                      <Globe className="w-4 h-4 mr-2" />
                    ) : (
                      <Ticket className="w-4 h-4 mr-2" />
                    )}
                    {v.isUsed
                      ? t('vouchers.view_used', 'Ver Detalhes')
                      : v.isOnline
                        ? t('vouchers.go_to_store', 'Acessar Loja Online')
                        : t('vouchers.view', 'Ver Voucher')}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
