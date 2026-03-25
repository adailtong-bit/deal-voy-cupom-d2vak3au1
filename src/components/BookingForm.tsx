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
import { useLanguage } from '@/stores/LanguageContext'
import { toast } from 'sonner'
import { Calendar, Users, Car, Hotel, Ticket as TicketIcon } from 'lucide-react'

export function BookingForm({
  coupon,
  offer,
  type = 'general',
  requirePrivacy = false,
  onSuccess,
}: {
  coupon?: Coupon
  offer?: TravelOffer
  type?: 'general' | 'hotel' | 'car' | 'ticket'
  requirePrivacy?: boolean
  onSuccess?: () => void
}) {
  const { makeBooking } = useCouponStore()
  const { t } = useLanguage()

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
      endDate:
        type === 'hotel' ? endDate : type === 'car' ? returnDate : undefined,
      time: type === 'car' ? pickupTime : type === 'ticket' ? '10:00' : time,
      guests: type === 'car' ? 1 : parseInt(guests),
      source: offer?.source || 'organic',
      requiresPrivacy: requirePrivacy,
      type: type,
    })

    const msg =
      type === 'hotel'
        ? t('booking.hotel_requested', 'Reserva de Hotel Solicitada')
        : type === 'car'
          ? t('booking.car_requested', 'Aluguel de Carro Solicitado')
          : type === 'ticket'
            ? t('booking.ticket_requested', 'Ingresso Solicitado')
            : t('booking.reservation_requested', 'Reserva Solicitada')

    toast.success(msg, {
      description: t(
        'booking.partner_will_confirm',
        'O parceiro confirmará em breve.',
      ),
    })

    if (onSuccess) {
      onSuccess()
    }
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
      ? t('booking.book_hotel', 'Reservar Hotel')
      : type === 'car'
        ? t('booking.rent_car', 'Alugar Carro')
        : type === 'ticket'
          ? t('booking.buy_ticket', 'Comprar Ingresso')
          : t('booking.make_reservation', 'Fazer Reserva')

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
                    {t('booking.check_in', 'Check-in')}
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
                    {t('booking.check_out', 'Check-out')}
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
                  {t('hub.guests_label', 'Hóspedes:').replace(':', '')}
                </Label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Select value={guests} onValueChange={setGuests}>
                    <SelectTrigger className="bg-white shadow-sm sm:w-1/2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 8, 10].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num}{' '}
                          {num === 1
                            ? t('hub.person', 'Pessoa')
                            : t('hub.people', 'Pessoas')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="submit"
                    className="sm:w-1/2 gap-2 shadow-sm font-bold"
                  >
                    <Hotel className="h-4 w-4" /> {t('hub.book', 'Reservar')}
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
                    {t('booking.pickup_date', 'Retirada')}
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
                    {t('booking.pickup_time', 'Hora (Retirada)')}
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
                    {t('booking.return_date', 'Devolução')}
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
                    {t('booking.return_time', 'Hora (Devolução)')}
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
                  {t('booking.category', 'Categoria')}
                </Label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Select value={carCategory} onValueChange={setCarCategory}>
                    <SelectTrigger className="bg-white shadow-sm sm:w-1/2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="economy">
                        {t('booking.economy', 'Econômico')}
                      </SelectItem>
                      <SelectItem value="compact">
                        {t('booking.compact', 'Compacto')}
                      </SelectItem>
                      <SelectItem value="suv">
                        {t('booking.suv', 'SUV')}
                      </SelectItem>
                      <SelectItem value="luxury">
                        {t('booking.luxury', 'Luxo')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    type="submit"
                    className="sm:w-1/2 gap-2 shadow-sm font-bold"
                  >
                    <Car className="h-4 w-4" /> {t('hub.rent', 'Alugar')}
                  </Button>
                </div>
              </div>
            </>
          )}

          {type === 'ticket' && (
            <>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-600">
                  {t('booking.visit_date', 'Data da Visita')}
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
                  {t('booking.ticket_quantity', 'Quantidade de Ingressos')}
                </Label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Select value={guests} onValueChange={setGuests}>
                    <SelectTrigger className="bg-white shadow-sm sm:w-1/2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 8, 10].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num}{' '}
                          {num === 1
                            ? t('booking.ticket', 'Ingresso')
                            : t('booking.tickets', 'Ingressos')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="submit"
                    className="sm:w-1/2 gap-2 shadow-sm font-bold"
                  >
                    <TicketIcon className="h-4 w-4" /> {t('hub.buy', 'Comprar')}
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
                    {t('booking.date', 'Data')}
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
                    {t('booking.time', 'Hora')}
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
                  {t('booking.guests', 'Convidados')}
                </Label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Select value={guests} onValueChange={setGuests}>
                    <SelectTrigger className="bg-white shadow-sm sm:w-1/2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 8, 10].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num}{' '}
                          {num === 1
                            ? t('hub.person', 'Pessoa')
                            : t('hub.people', 'Pessoas')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="submit"
                    className="sm:w-1/2 gap-2 shadow-sm font-bold"
                  >
                    <Users className="h-4 w-4" /> {t('hub.book', 'Reservar')}
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
