import { useState } from 'react'
import { Coupon } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, MapPin, Clock, ImageOff } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/stores/LanguageContext'

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
  const { t, formatCurrency } = useLanguage()
  const [imgError, setImgError] = useState(false)

  if (variant === 'horizontal') {
    return (
      <Link to={`/coupon/${coupon.id}`} className="block">
        <Card
          className={cn(
            'overflow-hidden hover:shadow-sm transition-all group h-28 sm:h-32',
            className,
          )}
        >
          <div className="flex h-full">
            <div className="w-28 sm:w-40 relative bg-slate-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
              {!imgError ? (
                <img
                  src={coupon.image}
                  alt={coupon.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  crossOrigin="anonymous"
                  onError={() => setImgError(true)}
                />
              ) : (
                <ImageOff className="h-6 w-6 text-slate-300" />
              )}
              <Badge className="absolute top-1.5 left-1.5 bg-white/95 text-black hover:bg-white shadow-sm font-bold backdrop-blur-sm text-[10px] h-5 px-1.5 py-0 z-10">
                {coupon.discount}
              </Badge>
            </div>
            <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
              <div>
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-semibold text-sm sm:text-base truncate leading-tight flex-1 mr-2">
                    {coupon.title}
                  </h4>
                  {coupon.averageRating && (
                    <div className="flex items-center gap-0.5 text-[10px] sm:text-xs font-bold text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded shrink-0">
                      <Star className="h-3 w-3 fill-current" />
                      {coupon.averageRating.toFixed(1)}
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {coupon.storeName}
                </p>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-1 line-clamp-2">
                  {coupon.description}
                </p>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2 text-[10px] sm:text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />{' '}
                    {coupon.distance > 1000
                      ? `${(coupon.distance / 1000).toFixed(1)}km`
                      : `${coupon.distance}m`}
                  </span>
                  <span className="flex items-center gap-1 text-orange-600 font-medium">
                    <Clock className="h-3 w-3" />
                    Exp.
                  </span>
                </div>
                {coupon.price !== undefined && !coupon.isPaid && (
                  <span className="font-bold text-green-600 text-xs sm:text-sm">
                    {formatCurrency(coupon.price, coupon.currency)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>
      </Link>
    )
  }

  return (
    <Link to={`/coupon/${coupon.id}`} className="block h-full">
      <Card
        className={cn(
          'overflow-hidden hover:shadow-md transition-all group h-full flex flex-col border-slate-200',
          className,
        )}
      >
        <div className="relative h-24 sm:h-28 overflow-hidden bg-slate-100 flex items-center justify-center">
          {!imgError ? (
            <img
              src={coupon.image}
              alt={coupon.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              crossOrigin="anonymous"
              onError={() => setImgError(true)}
            />
          ) : (
            <ImageOff className="h-8 w-8 text-slate-300" />
          )}
          <div className="absolute top-1.5 left-1.5 flex gap-1 z-10">
            <Badge className="bg-white/95 text-black hover:bg-white shadow-sm font-bold backdrop-blur-sm text-[9px] sm:text-[10px] h-4 sm:h-5 px-1.5 py-0">
              {coupon.discount}
            </Badge>
          </div>
          {coupon.isFeatured && (
            <Badge
              variant="secondary"
              className="absolute top-1.5 right-1.5 text-[8px] sm:text-[9px] px-1.5 h-4 sm:h-5 bg-yellow-400 text-yellow-900 border-none z-10"
            >
              Featured
            </Badge>
          )}
        </div>
        <CardContent className="p-2 sm:p-2.5 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-0.5 sm:mb-1">
            <h3 className="font-semibold text-xs sm:text-sm leading-tight line-clamp-2 flex-1 mr-1">
              {coupon.title}
            </h3>
            {coupon.averageRating && (
              <div className="flex items-center gap-0.5 text-[9px] sm:text-[10px] font-bold text-orange-500 bg-orange-50 px-1 py-0.5 rounded">
                <Star className="h-2.5 w-2.5 fill-current" />
                {coupon.averageRating.toFixed(1)}
              </div>
            )}
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground mb-2 truncate">
            {coupon.storeName}
          </p>

          <div className="mt-auto pt-1.5 sm:pt-2 border-t flex items-center justify-between text-[9px] sm:text-[10px] text-muted-foreground">
            <span className="flex items-center gap-0.5 sm:gap-1">
              <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              {coupon.distance > 1000
                ? `${(coupon.distance / 1000).toFixed(1)}km`
                : `${coupon.distance}m`}
            </span>
            <span className="flex items-center gap-0.5 sm:gap-1 text-orange-600 font-medium">
              <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              Exp.
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
