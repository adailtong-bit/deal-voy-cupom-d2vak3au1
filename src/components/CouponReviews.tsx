import { Coupon } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MessageSquare, User, Upload, Image as ImageIcon } from 'lucide-react'
import { StarRating } from './StarRating'
import { useLanguage } from '@/stores/LanguageContext'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useCouponStore } from '@/stores/CouponContext'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState } from 'react'
import { toast } from 'sonner'

export function CouponReviews({ coupon }: { coupon: Coupon }) {
  const { t } = useLanguage()
  const { addReview } = useCouponStore()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [hasImage, setHasImage] = useState(false)

  const reviews = coupon.reviews || []

  const handleSubmit = () => {
    addReview(coupon.id, {
      userId: 'me',
      userName: 'Você',
      rating,
      comment,
      images: hasImage
        ? ['https://img.usecurling.com/p/200/200?q=review']
        : undefined,
    })
    toast.success('Review submitted! You earned 100 points.')
    setComment('')
    setHasImage(false)
    setIsDialogOpen(false)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageSquare className="h-5 w-5" /> {t('coupon.reviews')} (
          {reviews.length})
        </CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              {t('coupon.add_review')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Avaliar {coupon.storeName}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{t('coupon.rating')}</Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <Button
                      key={num}
                      variant={rating === num ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setRating(num)}
                      className="w-10 h-10 p-0"
                    >
                      {num}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t('coupon.comment')}</Label>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Conte sua experiência..."
                />
              </div>
              <div className="space-y-2">
                <Label>Add Photos (Optional)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    className="hidden"
                    id="review-img"
                    onChange={(e) => setHasImage(!!e.target.files?.length)}
                  />
                  <Label
                    htmlFor="review-img"
                    className="cursor-pointer border border-dashed p-4 rounded-md w-full flex flex-col items-center justify-center text-muted-foreground hover:bg-slate-50 transition-colors"
                  >
                    {hasImage ? (
                      <ImageIcon className="h-6 w-6 text-green-500" />
                    ) : (
                      <Upload className="h-6 w-6" />
                    )}
                    <span className="text-xs mt-1">
                      {hasImage ? 'Image Selected' : 'Click to upload'}
                    </span>
                  </Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSubmit}>
                {t('coupon.submit_review')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4">
              Seja o primeiro a avaliar!
            </p>
          ) : (
            reviews.map((review) => (
              <div
                key={review.id}
                className="flex gap-3 border-b last:border-0 pb-4 last:pb-0"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm">{review.userName}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(review.date).toLocaleDateString()}
                    </span>
                  </div>
                  <StarRating rating={review.rating} size={3} />
                  <p className="text-sm mt-1">{review.comment}</p>
                  {review.images && review.images.length > 0 && (
                    <div className="mt-2 flex gap-2">
                      {review.images.map((img, i) => (
                        <img
                          key={i}
                          src={img}
                          alt="Review"
                          className="h-16 w-16 object-cover rounded-md border"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
