import { useState, useEffect } from 'react'
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

  // Guest Composition
  const [adults, setAdults] = useState('2')
  const [childrenCount, setChildrenCount] = useState('0')
  const [childAges, setChildAges] = useState<string[]>([])

  // Car Rental
  const [pickupDate, setPickupDate] = useState('')
  const [pickupTime, setPickupTime] = useState('')
  const [returnDate, setReturnDate] = useState('')
  const [returnTime, setReturnTime] = useState('')
  const [carCategory, setCarCategory] = useState('economy')

  useEffect(() => {
    if (type === 'car') {
      setAdults('1')
    }
  }, [type])

  const handleChildrenChange = (val: string) => {
    setChildrenCount(val)
    const count = parseInt(val)
    if (count > childAges.length) {
      setChildAges([...childAges, ...Array(count - childAges.length).fill('')])
    } else if (count < childAges.length) {
      setChildAges(childAges.slice(0, count))
    }
  }

  const handleChildAgeChange = (index: number, age: string) => {
    const newAges = [...childAges]
    newAges[index] = age
    setChildAges(newAges)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const numAdults = parseInt(adults) || 1
    const numChildren = parseInt(childrenCount) || 0

    if (numChildren > 0 && childAges.some((a) => a === '')) {
      toast.error(
        t(
          'booking.provide_child_ages',
          'Por favor, informe a idade de todas as crianças.',
        ),
      )
      return
    }

    makeBooking({
      couponId: coupon?.id || offer?.id || '',
      storeName: coupon?.storeName || offer?.provider || '',
      date: type === 'car' ? pickupDate : date,
      endDate:
        type === 'hotel' ? endDate : type === 'car' ? returnDate : undefined,
      time: type === 'car' ? pickupTime : type === 'ticket' ? '10:00' : time,
      guests: numAdults + numChildren,
      adults: numAdults,
      childrenCount: numChildren,
      childAges: childAges.map((a) => parseInt(a) || 0),
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

  const submitLabel =
    type === 'hotel'
      ? t('hub.book', 'Reservar')
      : type === 'car'
        ? t('hub.rent', 'Alugar')
        : type === 'ticket'
          ? t('hub.buy', 'Comprar')
          : t('hub.book', 'Reservar')

  return (
    <Card className="bg-slate-50 border-slate-200 shadow-none">
      <CardContent className="p-4 sm:p-5">
        <h4 className="font-bold mb-4 flex items-center gap-2 text-slate-800">
          <Icon className="h-5 w-5 text-primary" />
          {titleLabel}
        </h4>
        <form onSubmit={handleSubmit} className="space-y-4">
          {type === 'hotel' && (
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
                <Select value={carCategory} onValueChange={setCarCategory}>
                  <SelectTrigger className="bg-white shadow-sm">
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
              </div>
            </>
          )}

          {type === 'ticket' && (
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
          )}

          {type === 'general' && (
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
          )}

          <div className="pt-3 border-t border-slate-100">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="space-y-1 sm:w-1/2">
                  <Label className="text-xs font-semibold text-slate-600">
                    {t('booking.adults', 'Adultos')}
                  </Label>
                  <Select value={adults} onValueChange={setAdults}>
                    <SelectTrigger className="bg-white shadow-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 8, 10].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1 sm:w-1/2">
                  <Label className="text-xs font-semibold text-slate-600">
                    {t('booking.children', 'Crianças')}
                  </Label>
                  <Select
                    value={childrenCount}
                    onValueChange={handleChildrenChange}
                  >
                    <SelectTrigger className="bg-white shadow-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[0, 1, 2, 3, 4, 5, 6].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {parseInt(childrenCount) > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-slate-100/50 rounded-lg border border-slate-200">
                  {childAges.map((age, i) => (
                    <div key={i} className="space-y-1">
                      <Label className="text-[10px] font-semibold text-slate-600">
                        {t('booking.child_age_label', 'Idade da Criança')}{' '}
                        {i + 1}
                      </Label>
                      <Input
                        type="number"
                        min="0"
                        max="17"
                        value={age}
                        onChange={(e) =>
                          handleChildAgeChange(i, e.target.value)
                        }
                        className="h-8 text-xs bg-white shadow-sm"
                        placeholder={t('booking.age', 'Idade')}
                        required
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full gap-2 shadow-sm font-bold mt-2"
          >
            <Icon className="h-4 w-4" /> {submitLabel}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
