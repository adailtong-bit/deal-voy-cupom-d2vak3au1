import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  rating: number
  max?: number
  size?: number
  className?: string
}

export function StarRating({
  rating,
  max = 5,
  size = 4,
  className,
}: StarRatingProps) {
  // Map common sizes safely to avoid dynamic Tailwind class generation issues
  const sizeMap: Record<number, string> = {
    3: 'h-3 w-3',
    4: 'h-4 w-4',
    5: 'h-5 w-5',
    6: 'h-6 w-6',
    8: 'h-8 w-8',
  }
  const sizeClass = sizeMap[size] || 'h-4 w-4'

  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            sizeClass,
            i < Math.floor(rating)
              ? 'fill-yellow-400 text-yellow-400'
              : 'fill-slate-200 text-slate-200',
          )}
        />
      ))}
      <span className="ml-1 text-xs font-bold text-slate-700">
        {rating.toFixed(1)}
      </span>
    </div>
  )
}
