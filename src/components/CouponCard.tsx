import { Coupon } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Heart, MapPin, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCouponStore } from '@/stores/CouponContext'
import { Link } from 'react-router-dom'

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
  const saved = isSaved(coupon.id)

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleSave(coupon.id)
  }

  const isLowStock =
    coupon.totalAvailable &&
    coupon.reservedCount &&
    coupon.totalAvailable - coupon.reservedCount < 20

  if (variant === 'compact') {
    return (
      <Link to={`/coupon/${coupon.id}`} className="block h-full">
        <Card
          className={cn(
            'overflow-hidden h-full flex flex-col hover:shadow-md transition-shadow',
            className,
          )}
        >
          <div className="relative h-24 w-full">
            <img
              src={coupon.image}
              alt={coupon.title}
              className="w-full h-full object-cover"
            />
            <Badge className="absolute top-2 left-2 bg-primary text-white font-bold shadow-sm">
              {coupon.discount}
            </Badge>
          </div>
          <CardContent className="p-3 flex-1 flex flex-col">
            <h3 className="font-bold text-sm line-clamp-1">
              {coupon.storeName}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-1">
              {coupon.title}
            </p>
          </CardContent>
        </Card>
      </Link>
    )
  }

  return (
    <Link to={`/coupon/${coupon.id}`} className="block h-full">
      <Card
        className={cn(
          'overflow-hidden group h-full flex flex-col hover:shadow-lg transition-all duration-300 relative',
          className,
        )}
      >
        {coupon.isSpecial && (
          <div className="absolute top-0 right-0 z-10 p-2">
            <Badge className="bg-purple-600 hover:bg-purple-700 animate-pulse">
              <Sparkles className="h-3 w-3 mr-1" /> Especial
            </Badge>
          </div>
        )}
        <div className="relative aspect-video overflow-hidden">
          <img
            src={coupon.image}
            alt={coupon.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />

          <Badge className="absolute top-3 left-3 bg-emerald-500 text-white font-bold text-sm px-3 py-1 shadow-md">
            {coupon.discount}
          </Badge>

          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'absolute top-2 right-2 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-sm transition-all',
              saved &&
                'text-red-500 bg-white hover:bg-white hover:text-red-600 fill-current',
            )}
            onClick={handleSave}
          >
            <Heart className={cn('h-5 w-5', saved && 'fill-current')} />
          </Button>

          <div className="absolute bottom-3 left-3 text-white">
            <p className="font-bold text-lg leading-none mb-1">
              {coupon.storeName}
            </p>
            <div className="flex items-center text-xs opacity-90">
              <MapPin className="h-3 w-3 mr-1" />
              <span>{coupon.distance}m de você</span>
            </div>
          </div>
        </div>

        <CardContent className="p-4 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="font-medium text-base leading-tight mb-2 text-foreground group-hover:text-primary transition-colors">
              {coupon.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {coupon.description}
            </p>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <Badge
              variant="outline"
              className="text-xs font-normal border-primary/20 text-primary bg-primary/5"
            >
              {coupon.category}
            </Badge>
            {isLowStock ? (
              <span className="text-xs text-red-500 font-bold animate-pulse">
                Poucas unidades!
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">
                Expira:{' '}
                {new Date(coupon.expiryDate).toLocaleDateString('pt-BR')}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
