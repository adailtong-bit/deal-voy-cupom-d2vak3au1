import { useState, useMemo } from 'react'
import { useCouponStore } from '@/stores/CouponContext'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogFooter,
} from '@/components/ui/dialog'
import { BookingForm } from './BookingForm'
import { StarRating } from './StarRating'
import { TravelOffer } from '@/lib/types'
import {
  Hotel,
  Car,
  Ticket,
  MapPin,
  Users,
  Megaphone,
  Search,
  ExternalLink,
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface TravelDiscoveryHubProps {
  onBookingSuccess?: () => void
}

export function TravelDiscoveryHub({
  onBookingSuccess,
}: TravelDiscoveryHubProps) {
  const { travelOffers } = useCouponStore()
  const [activeTab, setActiveTab] = useState('hotel')
  const [guests, setGuests] = useState('2')
  const [requirePrivacy, setRequirePrivacy] = useState(false)

  const [detailsOffer, setDetailsOffer] = useState<TravelOffer | null>(null)
  const [bookingOffer, setBookingOffer] = useState<TravelOffer | null>(null)

  const numGuests = parseInt(guests)

  const filteredOffers = useMemo(() => {
    return travelOffers.filter((offer) => {
      if (activeTab === 'hotel' && offer.type !== 'hotel') return false
      if (activeTab === 'car_rental' && offer.type !== 'car_rental')
        return false
      if (activeTab === 'activity' && offer.type !== 'activity') return false

      if (activeTab === 'hotel') {
        if (numGuests >= 4 && requirePrivacy && !offer.hasSeparatedRooms) {
          return false
        }
      }

      if (activeTab === 'activity') {
        if (offer.availability !== undefined && offer.availability <= 0) {
          return false
        }
      }

      return true
    })
  }, [travelOffers, activeTab, numGuests, requirePrivacy])

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Explore Oportunidades
          </h2>
          <p className="text-muted-foreground mt-1">
            Encontre os melhores hotéis, aluguéis de carro e atividades
            exclusivas.
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6 bg-white border shadow-sm h-12 rounded-xl">
          <TabsTrigger
            value="hotel"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2 rounded-lg"
          >
            <Hotel className="h-4 w-4" />{' '}
            <span className="hidden sm:inline">Hotéis</span>
          </TabsTrigger>
          <TabsTrigger
            value="car_rental"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2 rounded-lg"
          >
            <Car className="h-4 w-4" />{' '}
            <span className="hidden sm:inline">Carros</span>
          </TabsTrigger>
          <TabsTrigger
            value="activity"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2 rounded-lg"
          >
            <Ticket className="h-4 w-4" />{' '}
            <span className="hidden sm:inline">Atividades</span>
          </TabsTrigger>
        </TabsList>

        {activeTab === 'hotel' && (
          <Card className="mb-6 border-slate-200 bg-slate-50 shadow-sm">
            <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Label className="font-semibold whitespace-nowrap text-slate-700">
                  Hóspedes:
                </Label>
                <Select value={guests} onValueChange={setGuests}>
                  <SelectTrigger className="w-[140px] bg-white border-slate-200 shadow-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
                      <SelectItem key={n} value={n.toString()}>
                        {n} {n === 1 ? 'Pessoa' : 'Pessoas'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {numGuests >= 4 && (
                <div className="flex items-center space-x-3 bg-white px-4 py-2.5 rounded-lg border border-blue-100 shadow-sm animate-in fade-in zoom-in-95">
                  <Checkbox
                    id="privacy"
                    checked={requirePrivacy}
                    onCheckedChange={(c) => setRequirePrivacy(c === true)}
                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <label
                    htmlFor="privacy"
                    className="text-sm font-bold leading-none text-slate-700 cursor-pointer flex items-center gap-2"
                  >
                    <Users className="h-4 w-4 text-blue-500" />
                    Exigir Quartos Individuais (Privacidade)
                  </label>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOffers.length === 0 ? (
            <div className="col-span-full text-center py-16 text-slate-500 bg-white rounded-2xl border-2 border-dashed border-slate-200">
              <p className="text-lg font-medium text-slate-700 mb-2">
                Nenhuma oferta encontrada
              </p>
              <p>Tente ajustar seus filtros ou mudar de categoria.</p>
            </div>
          ) : (
            filteredOffers.map((offer) => (
              <Card
                key={offer.id}
                className="overflow-hidden flex flex-col hover:shadow-lg transition-all duration-300 group border-slate-200"
              >
                <div className="h-48 relative overflow-hidden bg-slate-100">
                  <img
                    src={offer.image}
                    alt={offer.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-3 left-3">
                    {offer.source === 'partner' ? (
                      <Badge
                        variant="secondary"
                        className="bg-purple-600 text-white hover:bg-purple-700 border-none shadow-sm"
                      >
                        <Megaphone className="w-3 h-3 mr-1" /> Parceiro
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="bg-slate-700/80 text-white hover:bg-slate-800 border-none backdrop-blur-sm shadow-sm"
                      >
                        <Search className="w-3 h-3 mr-1" /> Orgânico
                      </Badge>
                    )}
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                    <div className="bg-white/95 text-slate-900 px-2.5 py-1 rounded-md text-sm font-extrabold shadow-sm">
                      {offer.currency} {offer.price}
                    </div>
                    {offer.hasSeparatedRooms && (
                      <div className="bg-blue-600 text-white px-2 py-1 rounded-md text-xs font-bold shadow-sm flex items-center gap-1">
                        <Users className="h-3 w-3" /> Privacidade
                      </div>
                    )}
                  </div>
                </div>
                <CardContent className="p-5 flex flex-col flex-1 bg-white">
                  <div className="mb-3">
                    <p className="text-xs text-primary font-bold mb-1 uppercase tracking-wider">
                      {offer.provider}
                    </p>
                    <h3 className="font-extrabold text-lg text-slate-900 leading-tight line-clamp-1">
                      {offer.title}
                    </h3>
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2 mb-5 flex-1">
                    {offer.description}
                  </p>
                  <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-5 bg-slate-50 p-2 rounded-md border border-slate-100">
                    <span className="flex items-center gap-1.5 line-clamp-1">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />{' '}
                      {offer.destination}
                    </span>
                    {offer.rating && (
                      <StarRating
                        rating={offer.rating}
                        size={3}
                        className="shrink-0"
                      />
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-auto">
                    <Button
                      variant="outline"
                      className="w-full font-bold shadow-sm text-xs px-2"
                      onClick={() => setDetailsOffer(offer)}
                    >
                      Ver Detalhes
                    </Button>
                    <Button
                      className="w-full font-bold shadow-sm text-xs px-2"
                      onClick={() => setBookingOffer(offer)}
                    >
                      {activeTab === 'hotel'
                        ? 'Reservar'
                        : activeTab === 'car_rental'
                          ? 'Alugar'
                          : 'Comprar'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </Tabs>

      <Dialog
        open={!!detailsOffer}
        onOpenChange={(open) => !open && setDetailsOffer(null)}
      >
        <DialogContent className="sm:max-w-xl overflow-y-auto max-h-[90vh]">
          {detailsOffer && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-extrabold text-slate-900 pr-6">
                  {detailsOffer.title}
                </DialogTitle>
              </DialogHeader>
              <div className="relative h-56 w-full rounded-xl overflow-hidden mb-2 shadow-sm">
                <img
                  src={detailsOffer.image}
                  className="object-cover w-full h-full"
                  alt={detailsOffer.title}
                />
                <div className="absolute bottom-3 right-3 bg-white/95 px-3 py-1.5 rounded-lg shadow-md font-extrabold text-lg text-slate-900">
                  {detailsOffer.currency} {detailsOffer.price}
                </div>
              </div>
              <div className="space-y-5 py-2">
                <div>
                  <h4 className="font-bold text-slate-800 mb-1 flex items-center gap-2">
                    Sobre a Oferta
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {detailsOffer.description}
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-800 mb-3 text-sm uppercase tracking-wider">
                    Detalhes da Promoção
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 text-sm">
                    <div>
                      <span className="text-slate-500 block text-xs">
                        Fornecedor
                      </span>
                      <span className="font-semibold text-slate-800">
                        {detailsOffer.provider}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-xs">
                        Destino
                      </span>
                      <span className="font-semibold text-slate-800">
                        {detailsOffer.destination}
                      </span>
                    </div>
                    {detailsOffer.rating && (
                      <div>
                        <span className="text-slate-500 block text-xs mb-0.5">
                          Avaliação
                        </span>
                        <StarRating rating={detailsOffer.rating} size={4} />
                      </div>
                    )}
                    {detailsOffer.hasSeparatedRooms && (
                      <div className="sm:col-span-2">
                        <span className="text-blue-600 bg-blue-50 border border-blue-100 px-2 py-1 rounded text-xs font-bold flex w-fit items-center gap-1.5">
                          <Users className="w-3.5 h-3.5" /> Privacidade
                          Garantida / Quartos Individuais
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter className="mt-2 flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => setDetailsOffer(null)}
                >
                  Voltar
                </Button>
                <Button asChild className="w-full sm:w-auto gap-2 bg-primary">
                  <a
                    href={detailsOffer.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Visitar Site <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!bookingOffer}
        onOpenChange={(open) => !open && setBookingOffer(null)}
      >
        <DialogContent className="sm:max-w-md p-0 border-none bg-transparent shadow-none">
          {bookingOffer && (
            <BookingForm
              offer={bookingOffer}
              type={
                bookingOffer.type === 'hotel'
                  ? 'hotel'
                  : bookingOffer.type === 'car_rental'
                    ? 'car'
                    : 'ticket'
              }
              requirePrivacy={requirePrivacy && numGuests >= 4}
              onSuccess={() => {
                setBookingOffer(null)
                if (onBookingSuccess) onBookingSuccess()
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
