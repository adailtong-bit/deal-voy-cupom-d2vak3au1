import { Coupon } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Heart, MapPin, CheckCircle2, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCouponStore } from '@/stores/CouponContext'
import { Link } from 'react-router-dom'
import { useLanguage } from '@/stores/LanguageContext'

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
  const { isSaved, toggleSave } = useCouponStore()
  const { t } = useLanguage()
  const saved = isSaved(coupon.id)

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleSave(coupon.id)
  }

  // Rakuten-inspired layout: Clean, Image Top, Logo Overlay, Clear Price
  return (
    <Link to={`/coupon/${coupon.id}`} className="block h-full">
      <Card
        className={cn(
          'overflow-hidden group h-full flex flex-col hover:shadow-elevation transition-all duration-300 border border-slate-100',
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
          <div className="absolute top-0 left-0 bg-primary text-white font-bold text-sm px-3 py-1.5 shadow-md rounded-br-lg z-10">
            {coupon.discount}
          </div>

          {/* Source Badge */}
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
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90 text-white font-bold text-xs h-8 px-4 rounded-full shadow-sm"
            >
              {t('coupon.reserve')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
