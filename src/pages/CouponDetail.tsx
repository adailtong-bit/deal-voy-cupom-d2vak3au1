import { useParams, useNavigate } from 'react-router-dom'
import { useCouponStore } from '@/stores/CouponContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
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
  Check,
  Copy,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export default function CouponDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { coupons, toggleSave, isSaved } = useCouponStore()
  const [showConfetti, setShowConfetti] = useState(false)

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

  const handleRedeem = () => {
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 3000)
    toast.success('Cupom ativado com sucesso!')
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(coupon.code)
    toast.success('Código copiado!')
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
              <Badge
                variant="secondary"
                className="text-sm px-3 py-1 font-bold"
              >
                {coupon.discount}
              </Badge>
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

          <div className="mt-8">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  className="w-full text-lg h-14 font-bold shadow-lg animate-pulse-slow"
                  onClick={handleRedeem}
                >
                  Pegar Cupom
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
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${coupon.code}`}
                      alt="QR Code"
                      className="w-32 h-32 border p-2 rounded-lg"
                    />
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
