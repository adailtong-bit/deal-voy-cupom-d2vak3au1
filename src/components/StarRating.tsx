import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  rating: number
  maxRating?: number
  onRatingChange?: (rating: number) => void
  readonly?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function StarRating({
  rating,
  maxRating = 5,
  onRatingChange,
  readonly = false,
  size = 'md',
  className,
}: StarRatingProps) {
  const stars = Array.from({ length: maxRating }, (_, i) => i + 1)

  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-5 h-5',
    lg: 'w-8 h-8',
  }

  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onRatingChange?.(star)}
          className={cn(
            'transition-colors focus:outline-none',
            readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110',
          )}
        >
          <Star
            className={cn(
              sizeClasses[size],
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-muted text-muted-foreground',
            )}
          />
        </button>
      ))}
    </div>
  )
}
