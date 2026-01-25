import { useParams, useNavigate } from 'react-router-dom'
import { useCouponStore } from '@/stores/CouponContext'
import { useLanguage } from '@/stores/LanguageContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
  ExternalLink,
  Heart,
  Copy,
  Languages,
  Utensils,
  CheckCircle,
  MessageSquare,
  WifiOff,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { StarRating } from '@/components/StarRating'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

export default function CouponDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { coupons, toggleSave, isSaved, reserveCoupon, isReserved, addReview } =
    useCouponStore()
  const { t, language } = useLanguage()
  const [showConfetti, setShowConfetti] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [menuLang, setMenuLang] = useState(language)
  const [newRating, setNewRating] = useState(0)
  const [newComment, setNewComment] = useState('')
  const [isReviewOpen, setIsReviewOpen] = useState(false)

  const coupon = coupons.find((c) => c.id === id)

  if (!coupon) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4 text-center">
        <h1 className="text-2xl font-bold mb-2">Cupom não encontrado</h1>
        <Button onClick={() => navigate('/')}>Voltar para o início</Button>
      </div>
    )
  }

  const saved = isSaved(coupon.id)
  const reserved = isReserved(coupon.id)
  const isOffline = !navigator.onLine

  const handleReserve = () => {
    const success = reserveCoupon(coupon.id)
    if (success) {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3000)
      toast.success('Cupom reservado com sucesso!')
    } else {
      toast.error('Não foi possível reservar. Limite atingido.')
    }
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(coupon.code)
    toast.success('Código copiado!')
  }

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

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: coupon.title,
          text: `Olha esse desconto que achei no CupomGeo: ${coupon.title} na ${coupon.storeName}`,
          url: window.location.href,
        })
        .catch(console.error)
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copiado para a área de transferência!')
    }
  }

  const stockPercent =
    coupon.totalAvailable && coupon.reservedCount
      ? Math.round((coupon.reservedCount / coupon.totalAvailable) * 100)
      : 0

  return (
    <div className="pb-24 bg-background min-h-screen">
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="confetti-piece"
              style={{
                left: `${Math.random() * 100}%`,
                animation: `confetti-fall ${2 + Math.random() * 3}s linear forwards`,
                backgroundColor: ['#ff0', '#f00', '#0f0', '#00f', '#f0f'][
                  Math.floor(Math.random() * 5)
                ],
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Header Image */}
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
          className="absolute top-4 left-4 rounded-full bg-background/80 hover:bg-background"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-4 right-4 rounded-full bg-background/80 hover:bg-background"
          onClick={handleShare}
        >
          <Share2 className="h-5 w-5" />
        </Button>
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
                  className="text-sm px-3 py-1 font-bold"
                >
                  {coupon.discount}
                </Badge>
                {coupon.isSpecial && (
                  <Badge className="bg-purple-600">Especial Local</Badge>
                )}
                {coupon.averageRating && (
                  <div className="flex items-center gap-1 text-sm font-medium text-yellow-600 bg-yellow-50 px-2 py-1 rounded-md">
                    <StarRating
                      rating={coupon.averageRating}
                      size="sm"
                      readonly
                    />
                    <span>({coupon.averageRating.toFixed(1)})</span>
                  </div>
                )}
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

          {/* Stock Indicator */}
          {coupon.totalAvailable && (
            <div className="mb-6 bg-muted/50 p-3 rounded-lg border">
              <div className="flex justify-between text-xs mb-1 font-medium">
                <span>{coupon.reservedCount} reservados</span>
                <span>
                  Restam {coupon.totalAvailable - (coupon.reservedCount || 0)}
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
                {coupon.distance}m de distância •{' '}
                {coupon.coordinates
                  ? 'Rua Exemplo, 123'
                  : 'Endereço não disponível'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              <span className="text-orange-600 font-medium">
                Expira em: {new Date(coupon.expiryDate).toLocaleDateString()}
              </span>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Menu Translation Feature */}
          {coupon.category === 'Alimentação' && coupon.menu && (
            <div className="mb-6">
              <Dialog open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full gap-2 border-primary/50 text-primary"
                  >
                    <Utensils className="h-4 w-4" /> {t('coupon.menu')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex justify-between items-center">
                      Menu: {coupon.storeName}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setMenuLang(menuLang === 'pt' ? language : 'pt')
                        }
                      >
                        <Languages className="h-4 w-4 mr-2" />
                        {menuLang === 'pt' ? 'Original' : 'Traduzido'}
                      </Button>
                    </DialogTitle>
                    <DialogDescription>
                      Itens disponíveis nesta oferta
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    {coupon.menu.map((item, idx) => {
                      const translation =
                        menuLang !== 'pt' && item.translations?.[menuLang]
                          ? item.translations[menuLang]
                          : item
                      return (
                        <div
                          key={idx}
                          className="flex justify-between border-b pb-4 last:border-0"
                        >
                          <div>
                            <p className="font-bold">{translation.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {translation.description}
                            </p>
                          </div>
                          <p className="font-medium ml-4">
                            R$ {item.price.toFixed(2)}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </DialogContent>
              </Dialog>
              <Separator className="my-6" />
            </div>
          )}

          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Info className="h-5 w-5" /> Detalhes da Oferta
            </h3>
            <p className="text-foreground/90 leading-relaxed">
              {coupon.description}
            </p>
            {coupon.terms && (
              <div className="bg-muted p-4 rounded-lg text-xs text-muted-foreground">
                <strong>Termos e Condições:</strong> {coupon.terms}
              </div>
            )}
          </div>

          {/* Reviews Section */}
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
                      <span className="font-semibold text-sm">
                        {review.userName}
                      </span>
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
                    <p className="text-sm text-muted-foreground">
                      {review.comment}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  Seja o primeiro a avaliar!
                </p>
              )}
            </div>
          </div>

          <div className="mt-8">
            {reserved ? (
              <Button
                className="w-full text-lg h-14 font-bold bg-green-600 hover:bg-green-700 cursor-default"
                disabled
              >
                <CheckCircle className="h-5 w-5 mr-2" /> {t('coupon.reserved')}
              </Button>
            ) : (
              <Button
                className="w-full text-lg h-14 font-bold shadow-lg animate-pulse-slow"
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
                    <WifiOff className="mr-2 h-4 w-4" /> Indisponível Offline
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
                    Ver Código
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-center text-xl">
                      Seu Cupom está Pronto!
                    </DialogTitle>
                    <DialogDescription className="text-center">
                      Apresente este código no caixa ou use no site da loja.
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
                      <Copy className="h-4 w-4" /> Copiar Código
                    </Button>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4">
                      {isOffline ? (
                        <div className="text-center p-4 border rounded bg-yellow-50 text-yellow-800">
                          <WifiOff className="h-6 w-6 mx-auto mb-2" />
                          <p>Modo Offline</p>
                          <p className="text-xs">
                            QR Code não disponível, use o código de texto.
                          </p>
                        </div>
                      ) : (
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${coupon.code}`}
                          alt="QR Code"
                          className="w-32 h-32 border p-2 rounded-lg"
                        />
                      )}
                    </div>
                  </div>
                  <DialogFooter className="sm:justify-center">
                    <DialogClose asChild>
                      <Button type="button" variant="secondary">
                        Fechar
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </Card>

        {/* Location Map Static */}
        <div className="mt-6 rounded-xl overflow-hidden border shadow-sm">
          <img
            src="https://img.usecurling.com/p/800/300?q=map%20location&color=cyan"
            className="w-full h-40 object-cover"
            alt="Localização"
          />
          <div className="p-4 bg-white flex justify-between items-center">
            <div>
              <p className="font-bold">{coupon.storeName}</p>
              <p className="text-xs text-muted-foreground">Abrir no GPS</p>
            </div>
            <Button size="sm" variant="outline" className="gap-2">
              <ExternalLink className="h-4 w-4" /> Como chegar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
