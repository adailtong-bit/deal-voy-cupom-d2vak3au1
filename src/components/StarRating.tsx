import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  rating: number
  max?: number
  size?: number
}

export function StarRating({ rating, max = 5, size = 4 }: StarRatingProps) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            `h-${size} w-${size}`,
            i < Math.floor(rating)
              ? 'fill-yellow-400 text-yellow-400'
              : 'fill-slate-200 text-slate-200',
          )}
        />
      ))}
      <span className="ml-2 text-sm font-medium text-slate-600">
        {rating.toFixed(1)}
      </span>
    </div>
  )
}
