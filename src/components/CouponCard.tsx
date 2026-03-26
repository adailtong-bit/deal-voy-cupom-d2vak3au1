import { useState } from 'react'
import { Coupon } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Star,
  MapPin,
  Clock,
  ImageOff,
  Globe,
  CheckCircle,
  Sparkles,
} from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/stores/LanguageContext'
import { useCouponStore } from '@/stores/CouponContext'
import { toast } from 'sonner'

interface CouponCardProps {
  coupon: Coupon
  variant?: 'vertical' | 'horizontal'
  className?: string
}

export function CouponCard({
  coupon,
  variant = 'vertical',
  className,
}: CouponCardProps) {
  const { t, formatCurrency, language } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, reserveCoupon, isReserved } = useCouponStore()
  const [imgError, setImgError] = useState(false)

  const reserved = isReserved(coupon.id)
  const isSoldOut =
    coupon.totalAvailable !== undefined && coupon.totalAvailable <= 0
  const isOnline = coupon.offerType === 'online' || !!coupon.externalUrl

  const isVerified = coupon.source === 'partner'
  const isOrganic =
    coupon.source === 'organic' || coupon.source === 'aggregated'

  const title = coupon.translations?.[language]?.title || coupon.title
  const description =
    coupon.translations?.[language]?.description || coupon.description

  const handleCardClick = () => {
    navigate(`/voucher/${coupon.id}`)
  }

  const handleReserve = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    if (!user) {
      navigate('/login', { state: { from: location } })
      return
    }

    if (reserved || isSoldOut) return

    const success = reserveCoupon(coupon.id)
    if (success) {
      toast.success(
        t('voucher_detail.reserved_success', 'Voucher reservado com sucesso!'),
      )
    }
  }

  if (variant === 'horizontal') {
    return (
      <div onClick={handleCardClick} className="block cursor-pointer">
        <Card
          className={cn(
            'overflow-hidden hover:shadow-sm transition-all group min-h-[120px] flex',
            className,
          )}
        >
          <div className="w-28 sm:w-40 relative bg-slate-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
            {!imgError ? (
              <img
                src={coupon.image}
                alt={title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                crossOrigin="anonymous"
                onError={() => setImgError(true)}
              />
            ) : (
              <ImageOff className="h-6 w-6 text-slate-300" />
            )}
            <div className="absolute top-1.5 left-1.5 flex flex-col gap-1 z-10 items-start">
              {isSoldOut ? (
                <Badge className="bg-red-600 text-white shadow-sm font-bold backdrop-blur-sm text-[10px] h-5 px-1.5 py-0 border-none">
                  {t('vouchers.sold_out', 'Esgotado')}
                </Badge>
              ) : (
                <Badge className="bg-white/95 text-black hover:bg-white shadow-sm font-bold backdrop-blur-sm text-[10px] h-5 px-1.5 py-0">
                  {coupon.discount}
                </Badge>
              )}
            </div>
            {isOnline && (
              <Badge
                variant="secondary"
                className="absolute bottom-1.5 left-1.5 text-[8px] px-1.5 h-4 bg-blue-500/90 hover:bg-blue-600 text-white border-none shadow-sm z-10"
              >
                <Globe className="w-2 h-2 mr-0.5" />{' '}
                {t('vouchers.online', 'Online')}
              </Badge>
            )}
          </div>
          <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
            <div>
              <div className="flex justify-between items-start mb-0.5">
                <h4 className="font-semibold text-sm sm:text-base truncate leading-tight flex-1 mr-2">
                  {title}
                </h4>
                {coupon.averageRating && (
                  <div className="flex items-center gap-0.5 text-[10px] sm:text-xs font-bold text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded shrink-0">
                    <Star className="h-3 w-3 fill-current" />
                    {coupon.averageRating.toFixed(1)}
                  </div>
                )}
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 mt-0.5 mb-1.5">
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                  {coupon.storeName}
                </p>
                <div className="flex items-center gap-1 shrink-0">
                  {isVerified && (
                    <span
                      className="flex items-center text-[9px] font-bold text-blue-600 bg-blue-50 px-1 py-0.5 rounded"
                      title={t('vouchers.verified', 'Verificado')}
                    >
                      <CheckCircle className="w-2.5 h-2.5 mr-0.5" />
                      {t('vouchers.verified', 'Verificado')}
                    </span>
                  )}
                  {isOrganic && (
                    <span
                      className="flex items-center text-[9px] font-bold text-slate-600 bg-slate-100 px-1 py-0.5 rounded"
                      title={t('vouchers.discovered', 'Oferta Descoberta')}
                    >
                      <Sparkles className="w-2.5 h-2.5 mr-0.5 text-yellow-500" />
                      {t('vouchers.discovered', 'Oferta Descoberta')}
                    </span>
                  )}
                </div>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-1 line-clamp-2">
                {description}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-2 pt-2 border-t border-slate-100 gap-2 sm:gap-0">
              <div className="flex items-center gap-2 text-[10px] sm:text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  {isOnline ? (
                    <>
                      <Globe className="h-3 w-3 text-blue-500" />{' '}
                      {t('vouchers.online', 'Online')}
                    </>
                  ) : (
                    <>
                      <MapPin className="h-3 w-3" />{' '}
                      {coupon.distance > 1000
                        ? `${(coupon.distance / 1000).toFixed(1)}km`
                        : `${coupon.distance}m`}
                    </>
                  )}
                </span>
                <span className="flex items-center gap-1 text-orange-600 font-medium">
                  <Clock className="h-3 w-3" />
                  {t('vouchers.expires', 'Expira em')}
                </span>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-2">
                {coupon.price !== undefined && !coupon.isPaid && (
                  <span className="font-bold text-green-600 text-xs sm:text-sm">
                    {formatCurrency(coupon.price, coupon.currency)}
                  </span>
                )}
                <Button
                  size="sm"
                  variant={reserved ? 'secondary' : 'default'}
                  className={cn(
                    'h-7 text-[10px] sm:text-xs px-2.5 shadow-sm',
                    reserved && 'pointer-events-none opacity-70',
                  )}
                  onClick={handleReserve}
                  disabled={isSoldOut || reserved}
                >
                  {reserved
                    ? t('vouchers.reserved', 'Reservado')
                    : isSoldOut
                      ? t('vouchers.sold_out', 'Esgotado')
                      : t('vouchers.reserve', 'Reservar')}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div onClick={handleCardClick} className="block h-full cursor-pointer">
      <Card
        className={cn(
          'overflow-hidden hover:shadow-md transition-all group h-full flex flex-col border-slate-200',
          className,
        )}
      >
        <div className="relative h-28 sm:h-32 overflow-hidden bg-slate-100 flex items-center justify-center">
          {!imgError ? (
            <img
              src={coupon.image}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              crossOrigin="anonymous"
              onError={() => setImgError(true)}
            />
          ) : (
            <ImageOff className="h-8 w-8 text-slate-300" />
          )}
          <div className="absolute top-1.5 left-1.5 flex flex-col gap-1 z-10 items-start">
            {isSoldOut ? (
              <Badge className="bg-red-600 text-white shadow-sm font-bold backdrop-blur-sm text-[9px] sm:text-[10px] h-4 sm:h-5 px-1.5 py-0 border-none">
                {t('vouchers.sold_out', 'Esgotado')}
              </Badge>
            ) : (
              <Badge className="bg-white/95 text-black hover:bg-white shadow-sm font-bold backdrop-blur-sm text-[9px] sm:text-[10px] h-4 sm:h-5 px-1.5 py-0">
                {coupon.discount}
              </Badge>
            )}
          </div>
          <div className="absolute top-1.5 right-1.5 flex flex-col gap-1 z-10 items-end">
            {coupon.isFeatured && (
              <Badge
                variant="secondary"
                className="text-[8px] sm:text-[9px] px-1.5 h-4 sm:h-5 bg-yellow-400 text-yellow-900 border-none shadow-sm"
              >
                {t('vouchers.featured', 'Destaque')}
              </Badge>
            )}
            {isOnline && (
              <Badge
                variant="secondary"
                className="text-[8px] sm:text-[9px] px-1.5 h-4 sm:h-5 bg-blue-500 text-white border-none shadow-sm"
              >
                <Globe className="w-2.5 h-2.5 mr-0.5" />{' '}
                {t('vouchers.online', 'Online')}
              </Badge>
            )}
          </div>
        </div>
        <CardContent className="p-2.5 sm:p-3 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-0.5">
            <h3 className="font-semibold text-xs sm:text-sm leading-tight line-clamp-2 flex-1 mr-1">
              {title}
            </h3>
            {coupon.averageRating && (
              <div className="flex items-center gap-0.5 text-[9px] sm:text-[10px] font-bold text-orange-500 bg-orange-50 px-1 py-0.5 rounded shrink-0">
                <Star className="h-2.5 w-2.5 fill-current" />
                {coupon.averageRating.toFixed(1)}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1 mt-0.5 mb-2">
            <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
              {coupon.storeName}
            </p>
            <div className="flex items-center gap-1 shrink-0">
              {isVerified && (
                <span
                  className="flex items-center text-[9px] font-bold text-blue-600 bg-blue-50 px-1 py-0.5 rounded w-max"
                  title={t('vouchers.verified', 'Verificado')}
                >
                  <CheckCircle className="w-2.5 h-2.5 mr-0.5" />
                  {t('vouchers.verified', 'Verificado')}
                </span>
              )}
              {isOrganic && (
                <span
                  className="flex items-center text-[9px] font-bold text-slate-600 bg-slate-100 px-1 py-0.5 rounded w-max"
                  title={t('vouchers.discovered', 'Oferta Descoberta')}
                >
                  <Sparkles className="w-2.5 h-2.5 mr-0.5 text-yellow-500" />
                  {t('vouchers.discovered', 'Oferta Descoberta')}
                </span>
              )}
            </div>
          </div>

          <div className="mt-auto pt-2 border-t flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-muted-foreground">
              <span className="flex items-center gap-0.5 sm:gap-1">
                {isOnline ? (
                  <>
                    <Globe className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-blue-500" />
                    {t('vouchers.online', 'Online')}
                  </>
                ) : (
                  <>
                    <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    {coupon.distance > 1000
                      ? `${(coupon.distance / 1000).toFixed(1)}km`
                      : `${coupon.distance}m`}
                  </>
                )}
              </span>
              <span className="flex items-center gap-0.5 sm:gap-1 text-orange-600 font-medium">
                <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                {t('vouchers.expires', 'Expira em')}
              </span>
            </div>

            <Button
              size="sm"
              variant={reserved ? 'secondary' : 'default'}
              className={cn(
                'w-full h-7 sm:h-8 text-[10px] sm:text-xs shadow-sm transition-transform hover:-translate-y-0.5',
                reserved &&
                  'pointer-events-none opacity-70 hover:translate-y-0',
              )}
              onClick={handleReserve}
              disabled={isSoldOut || reserved}
            >
              {reserved
                ? t('vouchers.reserved', 'Reservado')
                : isSoldOut
                  ? t('vouchers.sold_out', 'Esgotado')
                  : t('vouchers.reserve', 'Reservar')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
