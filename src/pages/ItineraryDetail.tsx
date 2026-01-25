import { useParams, useNavigate } from 'react-router-dom'
import { useCouponStore } from '@/stores/CouponContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Share2,
  Clock,
  MapPin,
  Wallet,
  Navigation,
  Download,
  CheckCircle,
  Wifi,
} from 'lucide-react'
import { CouponCard } from '@/components/CouponCard'
import { toast } from 'sonner'
import { useState } from 'react'

export default function ItineraryDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { itineraries, downloadOffline, downloadedIds } = useCouponStore()
  const [isDownloading, setIsDownloading] = useState(false)

  const itinerary = itineraries.find((i) => i.id === id)

  if (!itinerary) {
    return (
      <div className="p-8 text-center">
        Roteiro não encontrado.{' '}
        <Button onClick={() => navigate('/')}>Voltar</Button>
      </div>
    )
  }

  const isDownloaded = itinerary.stops.every((stop) =>
    downloadedIds.includes(stop.id),
  )

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Deal Voy Roteiro: ${itinerary.title}`,
          text: `Confira este roteiro incrível e economize R$ ${itinerary.totalSavings}: ${itinerary.title}`,
          url: window.location.href,
        })
      } catch (err) {
        console.error('Error sharing', err)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link do roteiro copiado!')
    }
  }

  const handleDownload = () => {
    setIsDownloading(true)
    setTimeout(() => {
      downloadOffline(itinerary.stops.map((s) => s.id))
      setIsDownloading(false)
    }, 1500)
  }

  return (
    <div className="pb-20 bg-background min-h-screen">
      <div className="relative h-72 md:h-96 w-full">
        <img
          src={itinerary.image}
          alt={itinerary.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-4 left-4 rounded-full bg-background/80 hover:bg-white"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="absolute top-4 right-4 flex gap-2">
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full bg-background/80 hover:bg-white"
            onClick={handleDownload}
            disabled={isDownloaded || isDownloading}
          >
            {isDownloading ? (
              <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
            ) : isDownloaded ? (
              <CheckCircle className="h-5 w-5 text-accent" />
            ) : (
              <Download className="h-5 w-5" />
            )}
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full bg-background/80 hover:bg-white"
            onClick={handleShare}
          >
            <Share2 className="h-5 w-5" />
          </Button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white">
          <div className="container mx-auto max-w-4xl">
            <div className="flex gap-2 mb-3">
              {itinerary.tags.map((tag) => (
                <Badge
                  key={tag}
                  className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-md px-3 py-1"
                >
                  {tag}
                </Badge>
              ))}
              {isDownloaded && (
                <Badge className="bg-accent text-accent-foreground border-0 gap-1">
                  <Wifi className="h-3 w-3" /> Offline Pronto
                </Badge>
              )}
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
              {itinerary.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-sm md:text-base font-medium">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-secondary" />{' '}
                {itinerary.duration}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />{' '}
                {itinerary.stops.length} Paradas
              </div>
              <div className="flex items-center gap-2 text-accent-foreground bg-accent px-3 py-1 rounded-full">
                <Wallet className="h-4 w-4" /> Economia de R${' '}
                {itinerary.totalSavings}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="mb-8 border-none shadow-elevation">
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-2">Sobre este roteiro</h3>
            <p className="text-muted-foreground leading-relaxed text-lg">
              {itinerary.description}
            </p>
          </CardContent>
        </Card>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Navigation className="h-6 w-6 text-primary" /> Paradas do Roteiro
            </h2>
            <div className="space-y-8">
              {itinerary.stops.map((stop, index) => (
                <div
                  key={stop.id}
                  className="relative pl-10 border-l-2 border-dashed border-primary/20 pb-8 last:pb-0 last:border-0"
                >
                  <div className="absolute -left-[15px] top-0 h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold shadow-lg ring-4 ring-background">
                    {index + 1}
                  </div>
                  <CouponCard
                    coupon={stop}
                    variant="horizontal"
                    className="h-auto shadow-sm hover:shadow-md"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="w-full lg:w-80 space-y-6">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h3 className="font-bold text-xl mb-4">Resumo da Viagem</h3>
                <ul className="space-y-3 text-sm mb-6">
                  <li className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">
                      Cupons Válidos
                    </span>
                    <span className="font-bold">{itinerary.stops.length}</span>
                  </li>
                  <li className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">
                      Tempo Estimado
                    </span>
                    <span className="font-bold">{itinerary.duration}</span>
                  </li>
                  <li className="flex justify-between text-accent font-bold pt-1 text-lg">
                    <span>Economia Total</span>
                    <span>R$ {itinerary.totalSavings},00</span>
                  </li>
                </ul>
                <Button className="w-full h-12 text-lg font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
                  Iniciar Roteiro
                </Button>
                <p className="text-xs text-center mt-3 text-muted-foreground">
                  Sincroniza automaticamente com o GPS
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
