import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Coupon, TravelOffer } from '@/lib/types'
import { useCouponStore } from '@/stores/CouponContext'
import { toast } from 'sonner'
import { Calendar, Users, Car, Hotel, Ticket as TicketIcon } from 'lucide-react'

export function BookingForm({
  coupon,
  offer,
  type = 'general',
  requirePrivacy = false,
}: {
  coupon?: Coupon
  offer?: TravelOffer
  type?: 'general' | 'hotel' | 'car' | 'ticket'
  requirePrivacy?: boolean
}) {
  const { makeBooking } = useCouponStore()

  // General & Hotel
  const [date, setDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [time, setTime] = useState('')
  const [guests, setGuests] = useState('2')

  // Car Rental
  const [pickupDate, setPickupDate] = useState('')
  const [pickupTime, setPickupTime] = useState('')
  const [returnDate, setReturnDate] = useState('')
  const [returnTime, setReturnTime] = useState('')
  const [carCategory, setCarCategory] = useState('economy')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    makeBooking({
      couponId: coupon?.id || offer?.id || '',
      storeName: coupon?.storeName || offer?.provider || '',
      date: type === 'car' ? pickupDate : date,
      time: type === 'car' ? pickupTime : type === 'ticket' ? '10:00' : time,
      guests: type === 'car' ? 1 : parseInt(guests),
      source: offer?.source || 'organic',
      requiresPrivacy: requirePrivacy,
      type: type,
    })

    const msg =
      type === 'hotel'
        ? 'Reserva de Hotel Solicitada'
        : type === 'car'
          ? 'Aluguel de Carro Solicitado'
          : type === 'ticket'
            ? 'Ingresso Solicitado'
            : 'Reserva Solicitada'

    toast.success(msg, {
      description: 'O parceiro confirmará em breve.',
    })
  }

  const iconMap = {
    hotel: Hotel,
    car: Car,
    ticket: TicketIcon,
    general: Calendar,
  }
  const Icon = iconMap[type] || Calendar
  const titleLabel =
    type === 'hotel'
      ? 'Reservar Hotel'
      : type === 'car'
        ? 'Alugar Carro'
        : type === 'ticket'
          ? 'Comprar Ingresso'
          : 'Fazer Reserva'

  return (
    <Card className="bg-slate-50 border-slate-200 shadow-none">
      <CardContent className="p-4 sm:p-5">
        <h4 className="font-bold mb-4 flex items-center gap-2 text-slate-800">
          <Icon className="h-5 w-5 text-primary" />
          {titleLabel}
        </h4>
        <form onSubmit={handleSubmit} className="space-y-4">
          {type === 'hotel' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-600">
                    Check-in
                  </Label>
                  <Input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="bg-white shadow-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-600">
                    Check-out
                  </Label>
                  <Input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-white shadow-sm"
                    min={date}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-600">
                  Hóspedes
                </Label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Select value={guests} onValueChange={setGuests}>
                    <SelectTrigger className="bg-white shadow-sm sm:w-1/2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 8, 10].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} {num === 1 ? 'Pessoa' : 'Pessoas'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="submit"
                    className="sm:w-1/2 gap-2 shadow-sm font-bold"
                  >
                    <Hotel className="h-4 w-4" /> Reservar
                  </Button>
                </div>
              </div>
            </>
          )}

          {type === 'car' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-600">
                    Retirada
                  </Label>
                  <Input
                    type="date"
                    required
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    className="bg-white shadow-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-600">
                    Hora (Retirada)
                  </Label>
                  <Input
                    type="time"
                    required
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    className="bg-white shadow-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-600">
                    Devolução
                  </Label>
                  <Input
                    type="date"
                    required
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="bg-white shadow-sm"
                    min={pickupDate}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-600">
                    Hora (Devolução)
                  </Label>
                  <Input
                    type="time"
                    required
                    value={returnTime}
                    onChange={(e) => setReturnTime(e.target.value)}
                    className="bg-white shadow-sm"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-600">
                  Categoria
                </Label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Select value={carCategory} onValueChange={setCarCategory}>
                    <SelectTrigger className="bg-white shadow-sm sm:w-1/2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="economy">Econômico</SelectItem>
                      <SelectItem value="compact">Compacto</SelectItem>
                      <SelectItem value="suv">SUV</SelectItem>
                      <SelectItem value="luxury">Luxo</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    type="submit"
                    className="sm:w-1/2 gap-2 shadow-sm font-bold"
                  >
                    <Car className="h-4 w-4" /> Alugar
                  </Button>
                </div>
              </div>
            </>
          )}

          {type === 'ticket' && (
            <>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-600">
                  Data da Visita
                </Label>
                <Input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-white shadow-sm"
                />
              </div>
              <div className="space-y-1 mt-3">
                <Label className="text-xs font-semibold text-slate-600">
                  Quantidade de Ingressos
                </Label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Select value={guests} onValueChange={setGuests}>
                    <SelectTrigger className="bg-white shadow-sm sm:w-1/2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 8, 10].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} {num === 1 ? 'Ingresso' : 'Ingressos'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="submit"
                    className="sm:w-1/2 gap-2 shadow-sm font-bold"
                  >
                    <TicketIcon className="h-4 w-4" /> Comprar
                  </Button>
                </div>
              </div>
            </>
          )}

          {type === 'general' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-600">
                    Data
                  </Label>
                  <Input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="bg-white shadow-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-600">
                    Hora
                  </Label>
                  <Input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="bg-white shadow-sm"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-600">
                  Convidados
                </Label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Select value={guests} onValueChange={setGuests}>
                    <SelectTrigger className="bg-white shadow-sm sm:w-1/2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 8, 10].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} {num === 1 ? 'Pessoa' : 'Pessoas'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="submit"
                    className="sm:w-1/2 gap-2 shadow-sm font-bold"
                  >
                    <Users className="h-4 w-4" /> Reservar
                  </Button>
                </div>
              </div>
            </>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
