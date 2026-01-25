import { Coupon } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, CheckCircle2, Globe, Plus, Check, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCouponStore } from '@/stores/CouponContext'
import { Link } from 'react-router-dom'
import { useLanguage } from '@/stores/LanguageContext'
import { differenceInHours, parseISO } from 'date-fns'

interface CouponCardProps {
  coupon: Coupon
  variant?: 'vertical' | 'horizontal' | 'compact'
  className?: string
}

export function CouponCard({
  coupon,
  variant = 'vertical',
  className,
}: CouponCardProps) {
  const { isSaved, toggleTrip, isInTrip } = useCouponStore()
  const { t } = useLanguage()
  const saved = isSaved(coupon.id)
  const inTrip = isInTrip(coupon.id)

  const handleTripToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleTrip(coupon.id)
  }

  // Calculate if expiring soon (less than 48 hours)
  const isExpiringSoon =
    coupon.expiryDate &&
    differenceInHours(parseISO(coupon.expiryDate), new Date()) < 48 &&
    differenceInHours(parseISO(coupon.expiryDate), new Date()) > 0

  // Rakuten-inspired layout: Clean, Image Top, Logo Overlay, Clear Price
  return (
    <Link to={`/coupon/${coupon.id}`} className="block h-full relative group">
      <Card
        className={cn(
          'overflow-hidden h-full flex flex-col hover:shadow-elevation transition-all duration-300 border border-slate-100',
          inTrip ? 'ring-2 ring-[#4CAF50] border-[#4CAF50]' : '',
          className,
        )}
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={coupon.image}
            alt={coupon.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Discount Badge - Rakuten Orange */}
          <div className="absolute top-0 left-0 bg-[#FF5722] text-white font-bold text-sm px-3 py-1.5 shadow-md rounded-br-lg z-10">
            {coupon.discount}
          </div>

          {/* Expiring Soon Badge */}
          {isExpiringSoon && (
            <div className="absolute top-0 right-0 bg-red-600 text-white font-bold text-[10px] uppercase px-2 py-1 shadow-md rounded-bl-lg z-10 flex items-center gap-1 animate-pulse">
              <Clock className="h-3 w-3" /> Expira em breve
            </div>
          )}

          {/* Visual Indicator for Trip - Lime Green Checkmark */}
          {inTrip && (
            <div className="absolute top-2 right-2 z-20 bg-[#4CAF50] text-white p-1.5 rounded-full shadow-lg animate-in zoom-in">
              <Check className="h-4 w-4" strokeWidth={3} />
            </div>
          )}

          {/* Source Badge (if not in trip or to show other info) */}
          {!inTrip && !isExpiringSoon && (
            <div className="absolute top-2 right-2 z-10">
              {coupon.source === 'partner' ? (
                <Badge
                  variant="secondary"
                  className="bg-white/90 text-primary hover:bg-white backdrop-blur-sm gap-1 shadow-sm"
                >
                  <CheckCircle2 className="h-3 w-3 text-blue-500" />
                  Oficial
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="bg-black/50 text-white border-none backdrop-blur-sm gap-1"
                >
                  <Globe className="h-3 w-3" />
                  Tracked
                </Badge>
              )}
            </div>
          )}
        </div>

        <CardContent className="p-4 flex-1 flex flex-col">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full border border-slate-100 overflow-hidden bg-white flex-shrink-0 p-0.5">
                {coupon.logo ? (
                  <img
                    src={coupon.logo}
                    alt={coupon.storeName}
                    className="w-full h-full object-contain rounded-full"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                    IMG
                  </div>
                )}
              </div>
              <span className="font-bold text-sm text-slate-700 line-clamp-1">
                {coupon.storeName}
              </span>
            </div>
          </div>

          <h3 className="font-medium text-base leading-tight mb-2 text-foreground group-hover:text-primary transition-colors line-clamp-2 min-h-[2.5rem]">
            {coupon.title}
          </h3>

          <div className="mt-auto pt-3 flex items-center justify-between gap-2">
            <div className="flex items-center text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 mr-1 text-slate-400" />
              <span>{coupon.distance}m</span>
            </div>

            {/* Add to Trip Action */}
            <Button
              size="sm"
              onClick={handleTripToggle}
              className={cn(
                'font-bold text-xs h-8 px-4 rounded-full shadow-sm transition-colors',
                inTrip
                  ? 'bg-[#4CAF50] hover:bg-[#43A047] text-white'
                  : 'bg-[#FF5722] hover:bg-[#F4511E] text-white',
              )}
            >
              {inTrip ? (
                <>
                  <Check className="h-3 w-3 mr-1" /> No Roteiro
                </>
              ) : (
                <>
                  <Plus className="h-3 w-3 mr-1" /> Add Trip
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
