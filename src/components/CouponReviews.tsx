import { Coupon } from '@/lib/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Star, MessageSquare } from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { useCouponStore } from '@/stores/CouponContext'

export function CouponReviews({ coupon }: { coupon: Coupon }) {
  const { formatDate } = useLanguage()
  const { addReview, user } = useCouponStore()
  const [newReview, setNewReview] = useState('')
  const [rating, setRating] = useState(5)

  const handleSubmit = () => {
    if (!newReview.trim()) return
    addReview(coupon.id, {
      userId: user?.id || 'guest',
      userName: user?.name || 'Guest',
      rating,
      comment: newReview,
    })
    setNewReview('')
  }

  return (
    <div className="space-y-6 mt-6">
      <h3 className="font-semibold text-lg flex items-center gap-2">
        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
        Reviews ({coupon.reviews?.length || 0})
      </h3>

      <div className="space-y-4">
        {coupon.reviews?.map((review) => (
          <div key={review.id} className="border-b pb-4 last:border-0">
            <div className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{review.userName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-sm">{review.userName}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {formatDate(review.date)}
                  </span>
                </div>
                <div className="flex items-center text-yellow-400 my-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${i < review.rating ? 'fill-current' : 'text-slate-200'}`}
                    />
                  ))}
                </div>
                <p className="text-sm text-foreground/80">{review.comment}</p>

                {review.replies?.map((reply) => (
                  <div
                    key={reply.id}
                    className="mt-3 ml-4 bg-slate-50 p-3 rounded text-xs border-l-2 border-primary"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <MessageSquare className="h-3 w-3 text-primary" />
                      <span className="font-bold text-primary">
                        {reply.userName} (Owner)
                      </span>
                    </div>
                    <p>{reply.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-50 p-4 rounded-lg">
        <h4 className="font-bold text-sm mb-2">Write a Review</h4>
        <div className="flex gap-1 mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-5 w-5 cursor-pointer ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`}
              onClick={() => setRating(star)}
            />
          ))}
        </div>
        <Textarea
          placeholder="Share your experience..."
          value={newReview}
          onChange={(e) => setNewReview(e.target.value)}
          className="mb-2 bg-white"
        />
        <Button onClick={handleSubmit} size="sm">
          Post Review
        </Button>
      </div>
    </div>
  )
}
