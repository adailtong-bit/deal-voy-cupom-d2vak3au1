import { Coupon } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Star, MapPin, Clock } from 'lucide-react'
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

  if (variant === 'horizontal') {
    return (
      <Link to={`/coupon/${coupon.id}`} className="block">
        <Card
          className={cn(
            'overflow-hidden hover:shadow-md transition-all group h-28',
            className,
          )}
        >
          <div className="flex h-full">
            <div className="w-28 relative bg-slate-100 flex-shrink-0">
              <img
                src={coupon.image}
                alt={coupon.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <Badge className="absolute top-1 left-1 text-[10px] px-1.5 py-0 h-5">
                {coupon.discount}
              </Badge>
            </div>
            <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
              <div>
                <h4 className="font-bold text-sm truncate leading-tight">
                  {coupon.title}
                </h4>
                <p className="text-xs text-muted-foreground truncate">
                  {coupon.storeName}
                </p>
              </div>
              <div className="flex items-center justify-between mt-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-0.5">
                    <MapPin className="h-3 w-3" />{' '}
                    {coupon.distance > 1000
                      ? `${(coupon.distance / 1000).toFixed(1)}km`
                      : `${coupon.distance}m`}
                  </span>
                </div>
                {coupon.price && !coupon.isPaid && (
                  <span className="font-bold text-green-600 text-sm">
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
          'overflow-hidden hover:shadow-lg transition-all group h-full flex flex-col',
          className,
        )}
      >
        <div className="relative h-32 overflow-hidden bg-slate-100">
          <img
            src={coupon.image}
            alt={coupon.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute top-2 left-2 flex gap-1">
            <Badge className="bg-white/90 text-black hover:bg-white shadow-sm font-bold backdrop-blur-sm">
              {coupon.discount}
            </Badge>
          </div>
          {coupon.isFeatured && (
            <Badge
              variant="secondary"
              className="absolute top-2 right-2 text-[10px] px-1.5 bg-yellow-400 text-yellow-900 border-none"
            >
              Featured
            </Badge>
          )}
        </div>
        <CardContent className="p-3 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-bold text-sm leading-tight line-clamp-2 flex-1 mr-2">
              {coupon.title}
            </h3>
            {coupon.averageRating && (
              <div className="flex items-center gap-0.5 text-xs font-bold text-orange-500 bg-orange-50 px-1 py-0.5 rounded">
                <Star className="h-3 w-3 fill-current" />
                {coupon.averageRating.toFixed(1)}
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground mb-3 truncate">
            {coupon.storeName}
          </p>

          <div className="mt-auto pt-2 border-t flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {coupon.distance > 1000
                ? `${(coupon.distance / 1000).toFixed(1)}km`
                : `${coupon.distance}m`}
            </span>
            <span className="flex items-center gap-1 text-orange-600">
              <Clock className="h-3 w-3" />
              Exp.
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
