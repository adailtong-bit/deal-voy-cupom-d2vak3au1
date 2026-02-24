import { useParams, useNavigate } from 'react-router-dom'
import { useCouponStore } from '@/stores/CouponContext'
import { useLanguage } from '@/stores/LanguageContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import {
  ArrowLeft,
  Share2,
  MapPin,
  Clock,
  Info,
  Heart,
  Copy,
  CheckCircle,
  WifiOff,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  Wallet,
  Download,
  ShoppingCart,
  Star,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { CouponMenu } from '@/components/CouponMenu'
import { CouponReviews } from '@/components/CouponReviews'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { BookingForm } from '@/components/BookingForm'
import { Switch } from '@/components/ui/switch'
import { LoyaltyCard } from '@/components/LoyaltyCard'

export default function CouponDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const {
    coupons,
    toggleSave,
    isSaved,
    reserveCoupon,
    isReserved,
    voteCoupon,
    reportCoupon,
    redeemPoints,
    downloadOffline,
    isDownloaded,
    fetchCredits,
  } = useCouponStore()
  const { t, formatDate, formatCurrency } = useLanguage()
  const [showConfetti, setShowConfetti] = useState(false)
  const [reportIssue, setReportIssue] = useState('')
  const [isReportOpen, setIsReportOpen] = useState(false)
  const [useFetchCredits, setUseFetchCredits] = useState(false)

  const coupon = coupons.find((c) => c.id === id)

  if (!coupon) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4 text-center">
        <h1 className="text-2xl font-bold mb-2">{t('common.error')}</h1>
        <Button onClick={() => navigate('/')}>{t('common.back')}</Button>
      </div>
    )
  }

  const saved = isSaved(coupon.id)
  const reserved = isReserved(coupon.id)
  const downloaded = isDownloaded(coupon.id)
  const isOffline = !navigator.onLine

  const handleReserve = () => {
    if (coupon.price && !coupon.isPaid && !reserved) {
      navigate('/checkout', { state: { coupon } })
      return
    }

    if (useFetchCredits) {
      if (!redeemPoints(10, 'fetch')) {
        toast.error(t('common.error'))
        return
      }
      toast.success(t('common.success'))
    }

    const success = reserveCoupon(coupon.id)
    if (success) {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3000)
      toast.success(t('coupon.reserved'))
    } else {
      toast.error(t('common.error'))
    }
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(coupon.code)
    toast.success(t('common.success'))
  }

  const handleReport = () => {
    reportCoupon(coupon.id, reportIssue)
    setIsReportOpen(false)
    setReportIssue('')
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: coupon.title, url: window.location.href })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success(t('common.success'))
    }
  }

  const handleDownload = () => {
    downloadOffline([coupon.id])
  }

  const stockPercent =
    coupon.totalAvailable && coupon.reservedCount
      ? Math.round((coupon.reservedCount / coupon.totalAvailable) * 100)
      : 0

  const needsPayment = coupon.price && !coupon.isPaid && !reserved

  return (
    <div className="pb-24 bg-background min-h-screen">
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {/* Confetti logic usually requires a library or CSS, simple placeholder here */}
        </div>
      )}

      <div className="relative h-64 md:h-80 w-full">
        <img
          src={coupon.image}
          alt={coupon.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-4 left-4 rounded-full bg-background/80"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="absolute top-4 right-4 flex gap-2">
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full bg-background/80"
            onClick={handleDownload}
            disabled={downloaded}
          >
            {downloaded ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <Download className="h-5 w-5" />
            )}
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full bg-background/80"
            onClick={handleShare}
          >
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-12 relative z-10">
        <Card className="p-6 shadow-lg border-t-4 border-t-primary">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {coupon.logo && (
                  <img
                    src={coupon.logo}
                    alt="Logo"
                    className="w-8 h-8 rounded-full border"
                  />
                )}
                <span className="text-sm font-medium text-muted-foreground">
                  {coupon.storeName}
                </span>
              </div>
              <h1 className="text-2xl font-bold leading-tight mb-2">
                {coupon.title}
              </h1>
              <div className="flex flex-wrap gap-2 items-center">
                <Badge
                  variant="secondary"
                  className="text-sm px-3 py-1 font-bold bg-[#FF5722] text-white hover:bg-[#E64A19]"
                >
                  {coupon.discount}
                </Badge>
                {coupon.price && !coupon.isPaid && (
                  <Badge className="bg-emerald-600">
                    {formatCurrency(coupon.price, coupon.currency)}
                  </Badge>
                )}
                <div className="flex items-center gap-1 text-sm font-medium text-yellow-600 bg-yellow-50 px-2 py-1 rounded-md border border-yellow-200">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{coupon.averageRating?.toFixed(1) || 'N/A'}</span>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="icon"
              className={saved ? 'text-red-500 border-red-200 bg-red-50' : ''}
              onClick={() => toggleSave(coupon.id)}
            >
              <Heart className={saved ? 'fill-current' : ''} />
            </Button>
          </div>

          {coupon.acceptsBooking && (
            <div className="mb-6">
              <BookingForm coupon={coupon} />
            </div>
          )}

          {coupon.loyaltyProgram && (
            <div className="mb-6">
              <LoyaltyCard program={coupon.loyaltyProgram} />
            </div>
          )}

          {coupon.totalAvailable && (
            <div className="mb-6 bg-muted/50 p-3 rounded-lg border">
              <div className="flex justify-between text-xs mb-1 font-medium">
                <span>
                  {coupon.reservedCount} {t('coupon.stock_reserved')}
                </span>
                <span>
                  {coupon.totalAvailable - (coupon.reservedCount || 0)}{' '}
                  {t('coupon.stock_left')}
                </span>
              </div>
              <div className="h-2 w-full bg-secondary/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-secondary transition-all duration-1000"
                  style={{ width: `${stockPercent}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-4 text-sm text-muted-foreground mb-6">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>
                {coupon.distance}m • {coupon.coordinates ? 'Location' : 'N/A'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              <span className="text-orange-600 font-medium">
                {t('coupon.expires')}: {formatDate(coupon.expiryDate)}
              </span>
            </div>
          </div>

          <Separator className="my-6" />

          <CouponMenu coupon={coupon} />

          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Info className="h-5 w-5" /> {t('coupon.details')}
            </h3>
            <p className="text-foreground/90 leading-relaxed">
              {coupon.description}
            </p>
            {coupon.terms && (
              <div className="bg-muted p-4 rounded-lg text-xs text-muted-foreground">
                <strong>{t('coupon.terms')}:</strong> {coupon.terms}
              </div>
            )}
          </div>

          <div className="mt-6 bg-slate-50 p-4 rounded-lg border flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{t('coupon.verify')}</span>
              <span className="text-xs text-muted-foreground">
                {t('coupon.verified_at')}:{' '}
                {coupon.lastVerified
                  ? formatDate(coupon.lastVerified)
                  : formatDate(new Date())}
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                onClick={() => voteCoupon(coupon.id, 'up')}
              >
                <ThumbsUp className="h-4 w-4" /> ({coupon.upvotes || 0})
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => voteCoupon(coupon.id, 'down')}
              >
                <ThumbsDown className="h-4 w-4" /> ({coupon.downvotes || 0})
              </Button>
            </div>
            <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground w-fit ml-auto gap-1 h-auto p-1"
                >
                  <AlertTriangle className="h-3 w-3" /> {t('coupon.report')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('coupon.report')}</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <Label>{t('coupon.report_desc')}</Label>
                  <Input
                    value={reportIssue}
                    onChange={(e) => setReportIssue(e.target.value)}
                    placeholder={t('coupon.report_placeholder')}
                  />
                </div>
                <DialogFooter>
                  <Button onClick={handleReport}>
                    {t('coupon.send_report')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <CouponReviews coupon={coupon} />

          <div className="mt-8 border-t pt-6">
            {!reserved && !needsPayment && (
              <div className="mb-4 bg-primary/5 p-4 rounded-lg border border-primary/10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-sm">
                      {t('coupon.fetch_integration')}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-primary">
                    {t('coupon.balance')}: {formatCurrency(fetchCredits)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="fetch-credits"
                    checked={useFetchCredits}
                    onCheckedChange={setUseFetchCredits}
                  />
                  <Label
                    htmlFor="fetch-credits"
                    className="text-sm text-muted-foreground"
                  >
                    {t('coupon.use_credits')}
                  </Label>
                </div>
              </div>
            )}

            {reserved ? (
              <Button
                className="w-full text-lg h-14 font-bold bg-green-600 hover:bg-green-700 cursor-default"
                disabled
              >
                <CheckCircle className="h-5 w-5 mr-2" /> {t('coupon.reserved')}
              </Button>
            ) : (
              <Button
                className={
                  needsPayment
                    ? 'w-full text-lg h-14 font-bold bg-emerald-600 hover:bg-emerald-700'
                    : 'w-full text-lg h-14 font-bold shadow-lg animate-pulse-slow'
                }
                onClick={handleReserve}
                disabled={
                  (coupon.totalAvailable !== undefined &&
                    coupon.reservedCount !== undefined &&
                    coupon.reservedCount >= coupon.totalAvailable) ||
                  isOffline
                }
              >
                {isOffline ? (
                  <>
                    <WifiOff className="mr-2 h-4 w-4" /> {t('offline.message')}
                  </>
                ) : needsPayment ? (
                  <>
                    <ShoppingCart className="mr-2 h-4 w-4" />{' '}
                    {t('checkout.pay')} -{' '}
                    {formatCurrency(coupon.price || 0, coupon.currency)}
                  </>
                ) : (
                  t('coupon.reserve')
                )}
              </Button>
            )}

            {reserved && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="link" className="w-full mt-2">
                    {t('common.view')} Code
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-center text-xl">
                      {t('coupon.code_dialog_title')}
                    </DialogTitle>
                    <DialogDescription className="text-center">
                      {t('coupon.code_dialog_desc')}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex flex-col items-center justify-center p-6 space-y-4">
                    <div className="bg-muted p-6 rounded-xl border-2 border-dashed border-primary w-full text-center">
                      <span className="text-3xl font-mono font-bold tracking-wider text-primary select-all">
                        {coupon.code}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={handleCopyCode}
                    >
                      <Copy className="h-4 w-4" /> {t('coupon.copy_code')}
                    </Button>
                  </div>
                  <DialogFooter className="sm:justify-center">
                    <DialogClose asChild>
                      <Button type="button" variant="secondary">
                        {t('common.close')}
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
