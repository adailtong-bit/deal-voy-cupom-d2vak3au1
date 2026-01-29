import { Coupon } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  MessageSquare,
  User,
  Upload,
  Image as ImageIcon,
  CornerDownRight,
} from 'lucide-react'
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
  const { t, formatDate } = useLanguage()
  const { addReview, user, replyToReview } = useCouponStore()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [hasImage, setHasImage] = useState(false)

  // Reply state
  const [replyText, setReplyText] = useState('')
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null)

  const reviews = coupon.reviews || []

  // Check if current user is the owner/vendor of this coupon
  const isOwner =
    user?.role === 'shopkeeper' ||
    user?.role === 'admin' ||
    user?.companyId === coupon.companyId

  const handleSubmit = () => {
    addReview(coupon.id, {
      userId: 'me',
      userName: user?.name || 'Você',
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

  const handleReplySubmit = (reviewId: string) => {
    if (!replyText.trim()) return
    replyToReview(coupon.id, reviewId, replyText)
    setReplyText('')
    setActiveReplyId(null)
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
        <div className="space-y-6">
          {reviews.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4">
              Seja o primeiro a avaliar!
            </p>
          ) : (
            reviews.map((review) => (
              <div
                key={review.id}
                className="flex flex-col gap-3 border-b last:border-0 pb-4 last:pb-0"
              >
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div>
                        <span className="font-bold text-sm mr-2">
                          {review.userName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(review.date)}
                        </span>
                      </div>
                      {isOwner && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs"
                          onClick={() =>
                            setActiveReplyId(
                              activeReplyId === review.id ? null : review.id,
                            )
                          }
                        >
                          {t('review.reply')}
                        </Button>
                      )}
                    </div>
                    <StarRating rating={review.rating} size={3} />
                    <p className="text-sm mt-1 whitespace-pre-wrap">
                      {review.comment}
                    </p>
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

                {/* Replies Thread */}
                {review.replies &&
                  review.replies.map((reply) => (
                    <div
                      key={reply.id}
                      className="ml-11 bg-muted/30 p-3 rounded-lg flex gap-3 border-l-2 border-primary/20"
                    >
                      <CornerDownRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-xs text-primary">
                            {reply.userName}
                          </span>
                          <Badge
                            variant="outline"
                            className="text-[10px] h-4 px-1"
                          >
                            {t('review.vendor_response')}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">
                            {formatDate(reply.date)}
                          </span>
                        </div>
                        <p className="text-sm text-foreground/90">
                          {reply.text}
                        </p>
                      </div>
                    </div>
                  ))}

                {/* Reply Input */}
                {activeReplyId === review.id && (
                  <div className="ml-11 mt-2">
                    <Textarea
                      placeholder="Write your reply..."
                      className="min-h-[80px] mb-2"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveReplyId(null)}
                      >
                        {t('common.cancel')}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleReplySubmit(review.id)}
                      >
                        {t('common.publish')}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
