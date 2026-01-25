import { useState } from 'react'
import { Coupon } from '@/lib/types'
import { useLanguage } from '@/stores/LanguageContext'
import { useCouponStore } from '@/stores/CouponContext'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { StarRating } from '@/components/StarRating'
import { MessageSquare } from 'lucide-react'
import { toast } from 'sonner'

interface CouponReviewsProps {
  coupon: Coupon
}

export function CouponReviews({ coupon }: CouponReviewsProps) {
  const { t } = useLanguage()
  const { addReview } = useCouponStore()
  const [newRating, setNewRating] = useState(0)
  const [newComment, setNewComment] = useState('')
  const [isReviewOpen, setIsReviewOpen] = useState(false)

  const handleSubmitReview = () => {
    if (newRating === 0) {
      toast.error('Por favor, selecione uma nota.')
      return
    }
    addReview(coupon.id, {
      userId: 'currentUser',
      userName: 'Você',
      rating: newRating,
      comment: newComment,
    })
    setIsReviewOpen(false)
    setNewRating(0)
    setNewComment('')
    toast.success('Avaliação enviada!')
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <MessageSquare className="h-5 w-5" /> {t('coupon.reviews')}
        </h3>
        <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              {t('coupon.add_review')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('coupon.add_review')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{t('coupon.rating')}</Label>
                <StarRating
                  rating={newRating}
                  onRatingChange={setNewRating}
                  size="lg"
                  className="justify-center"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('coupon.comment')}</Label>
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Conte sobre sua experiência..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSubmitReview}>
                {t('coupon.submit_review')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {coupon.reviews && coupon.reviews.length > 0 ? (
          coupon.reviews.map((review) => (
            <div key={review.id} className="border-b pb-4 last:border-0">
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-sm">{review.userName}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(review.date).toLocaleDateString()}
                </span>
              </div>
              <StarRating
                rating={review.rating}
                size="sm"
                readonly
                className="mb-2"
              />
              <p className="text-sm text-muted-foreground">{review.comment}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground italic">
            Seja o primeiro a avaliar!
          </p>
        )}
      </div>
    </div>
  )
}
