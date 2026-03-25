import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
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
import {
  Calendar,
  Users,
  Car,
  Hotel,
  Ticket as TicketIcon,
  User as UserIcon,
} from 'lucide-react'

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
  const { user, updateUserProfile, makeBooking } = useCouponStore()
  const { t } = useLanguage()

  const isProfileMissingData =
    !user?.name || !user?.gender || !user?.birthday || !user?.documentNumber
  const [showProfileForm, setShowProfileForm] = useState(isProfileMissingData)

  const [profName, setProfName] = useState(user?.name || '')
  const [profGender, setProfGender] = useState(user?.gender || '')
  const [profBirthday, setProfBirthday] = useState(user?.birthday || '')
  const [profDoc, setProfDoc] = useState(user?.documentNumber || '')

  useEffect(() => {
    if (user) {
      setProfName(user.name || '')
      setProfGender(user.gender || '')
      setProfBirthday(user.birthday || '')
      setProfDoc(user.documentNumber || '')
      if (user.name && user.gender && user.birthday && user.documentNumber) {
        setShowProfileForm(false)
      }
    }
  }, [user])

  // General & Hotel
  const [date, setDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [time, setTime] = useState('')

  // Guest Composition
  const [adults, setAdults] = useState('2')
  const [childrenCount, setChildrenCount] = useState('0')
  const [childAges, setChildAges] = useState<string[]>([])

  // Car Rental specifics
  const [pickupDate, setPickupDate] = useState('')
  const [pickupTime, setPickupTime] = useState('')
  const [returnDate, setReturnDate] = useState('')
  const [returnTime, setReturnTime] = useState('')
  const [carCategory, setCarCategory] = useState('economy')
  const [driverName, setDriverName] = useState('')
  const [driverContact, setDriverContact] = useState('')
  const [includesToll, setIncludesToll] = useState(false)

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

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    if (!profName || !profGender || !profBirthday || !profDoc) {
      toast.error(
        t('booking.fill_all_fields', 'Preencha todos os campos obrigatórios.'),
      )
      return
    }
    updateUserProfile({
      name: profName,
      gender: profGender as any,
      birthday: profBirthday,
      documentNumber: profDoc,
    })
    setShowProfileForm(false)
    toast.success(
      t(
        'booking.profile_updated',
        'Perfil atualizado! Você pode continuar sua reserva.',
      ),
    )
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
      ...(type === 'car' && {
        driverName,
        driverContact,
        includesToll,
        carCategory,
      }),
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

  if (showProfileForm) {
    return (
      <Card className="bg-slate-50 border-slate-200 shadow-none">
        <CardContent className="p-4 sm:p-5">
          <h4 className="font-bold mb-2 flex items-center gap-2 text-slate-800">
            <UserIcon className="h-5 w-5 text-primary" />
            {t('booking.complete_profile', 'Complete seu Perfil')}
          </h4>
          <p className="text-xs text-slate-500 mb-4 leading-relaxed">
            {t(
              'booking.profile_required_desc',
              'Para confirmar sua reserva junto ao parceiro e garantir a validade do documento, precisamos que complete as informações obrigatórias abaixo.',
            )}
          </p>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                {t('profile.name', 'Nome Completo')}
              </Label>
              <Input
                required
                value={profName}
                onChange={(e) => setProfName(e.target.value)}
                className="bg-white shadow-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                {t('profile.gender', 'Gênero')}
              </Label>
              <Select value={profGender} onValueChange={setProfGender} required>
                <SelectTrigger className="bg-white shadow-sm">
                  <SelectValue
                    placeholder={t('common.select', 'Selecione...')}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">
                    {t('gender.male', 'Masculino')}
                  </SelectItem>
                  <SelectItem value="female">
                    {t('gender.female', 'Feminino')}
                  </SelectItem>
                  <SelectItem value="non-binary">
                    {t('gender.nb', 'Não-binário')}
                  </SelectItem>
                  <SelectItem value="other">
                    {t('gender.other', 'Outro')}
                  </SelectItem>
                  <SelectItem value="prefer-not-to-say">
                    {t('gender.none', 'Prefiro não dizer')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                {t('profile.birthday', 'Data de Nascimento')}
              </Label>
              <Input
                required
                type="date"
                value={profBirthday}
                onChange={(e) => setProfBirthday(e.target.value)}
                className="bg-white shadow-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                {t('profile.document', 'Documento (CPF/Passaporte/ID)')}
              </Label>
              <Input
                required
                value={profDoc}
                onChange={(e) => setProfDoc(e.target.value)}
                className="bg-white shadow-sm"
                placeholder="Ex: 123.456.789-00"
              />
            </div>
            <Button type="submit" className="w-full mt-4 font-bold shadow-sm">
              {t('booking.save_and_continue', 'Salvar e Continuar')}
            </Button>
          </form>
        </CardContent>
      </Card>
    )
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
              <div className="space-y-1 mb-2">
                <Label className="text-xs font-semibold text-slate-600">
                  {t('booking.category', 'Categoria do Veículo')}
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
              <div className="bg-slate-100 p-3 rounded-lg border border-slate-200 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-slate-600">
                      {t('booking.driver_name', 'Nome do Motorista')}
                    </Label>
                    <Input
                      required
                      value={driverName}
                      onChange={(e) => setDriverName(e.target.value)}
                      className="bg-white shadow-sm h-9 text-sm"
                      placeholder="Ex: Carlos Silva"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-slate-600">
                      {t('booking.driver_doc', 'Documento (CNH/ID)')}
                    </Label>
                    <Input
                      required
                      value={driverContact}
                      onChange={(e) => setDriverContact(e.target.value)}
                      className="bg-white shadow-sm h-9 text-sm"
                      placeholder="Ex: 123456789"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2 pt-1">
                  <Switch
                    id="toll"
                    checked={includesToll}
                    onCheckedChange={setIncludesToll}
                  />
                  <Label htmlFor="toll" className="text-sm cursor-pointer">
                    {t('booking.includes_toll', 'Incluir passe de pedágio')}
                  </Label>
                </div>
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
