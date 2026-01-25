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
} from 'lucide-react'
import { CouponCard } from '@/components/CouponCard'
import { toast } from 'sonner'

export default function ItineraryDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { itineraries } = useCouponStore()

  const itinerary = itineraries.find((i) => i.id === id)

  if (!itinerary) {
    return (
      <div className="p-8 text-center">
        Roteiro não encontrado.{' '}
        <Button onClick={() => navigate('/')}>Voltar</Button>
      </div>
    )
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: itinerary.title,
          text: `Confira este roteiro incrível: ${itinerary.title}`,
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

  return (
    <div className="pb-20">
      <div className="relative h-64 md:h-80 w-full">
        <img
          src={itinerary.image}
          alt={itinerary.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-4 left-4 rounded-full bg-background/80"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-4 right-4 rounded-full bg-background/80"
          onClick={handleShare}
        >
          <Share2 className="h-5 w-5" />
        </Button>

        <div className="absolute bottom-0 left-0 right-0 p-6 text-white bg-gradient-to-t from-black/80 to-transparent">
          <div className="container mx-auto">
            <div className="flex gap-2 mb-2">
              {itinerary.tags.map((tag) => (
                <Badge
                  key={tag}
                  className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-md"
                >
                  {tag}
                </Badge>
              ))}
            </div>
            <h1 className="text-3xl font-bold mb-2">{itinerary.title}</h1>
            <div className="flex items-center gap-4 text-sm font-medium">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" /> {itinerary.duration}
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" /> {itinerary.stops.length} Paradas
              </div>
              <div className="flex items-center gap-1 text-green-400">
                <Wallet className="h-4 w-4" /> Economia de R${' '}
                {itinerary.totalSavings}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
          {itinerary.description}
        </p>

        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Navigation className="h-5 w-5 text-primary" /> Paradas do Roteiro
            </h2>
            <div className="space-y-6">
              {itinerary.stops.map((stop, index) => (
                <div
                  key={stop.id}
                  className="relative pl-8 border-l-2 border-dashed border-primary/30 pb-8 last:pb-0 last:border-0"
                >
                  <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold">
                    {index + 1}
                  </div>
                  <CouponCard
                    coupon={stop}
                    variant="horizontal"
                    className="h-32"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="w-full md:w-80 space-y-4">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-bold mb-2">Resumo</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span>Cupons</span>
                    <span className="font-medium">
                      {itinerary.stops.length}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span>Tempo Estimado</span>
                    <span className="font-medium">{itinerary.duration}</span>
                  </li>
                  <li className="flex justify-between text-green-600 font-bold border-t pt-2 mt-2">
                    <span>Economia Total</span>
                    <span>R$ {itinerary.totalSavings},00</span>
                  </li>
                </ul>
                <Button className="w-full mt-4">Iniciar Roteiro</Button>
              </CardContent>
            </Card>

            <div className="rounded-xl overflow-hidden shadow-md h-64 relative">
              <img
                src="https://img.usecurling.com/p/400/300?q=map%20route&color=gray"
                className="w-full h-full object-cover grayscale opacity-80"
                alt="Map"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Button variant="secondary" className="shadow-lg">
                  Ver no Mapa
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
