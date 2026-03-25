import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Booking } from '@/lib/types'
import { useLanguage } from '@/stores/LanguageContext'
import { useCouponStore } from '@/stores/CouponContext'
import {
  QrCode,
  User,
  Calendar,
  MapPin,
  CheckCircle2,
  Car,
  Hotel,
  Ticket as TicketIcon,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface BookingVoucherModalProps {
  booking: Booking | null
  onClose: () => void
}

export function BookingVoucherModal({
  booking,
  onClose,
}: BookingVoucherModalProps) {
  const { t } = useLanguage()
  const { user } = useCouponStore()

  if (!booking) return null

  const iconMap = {
    hotel: Hotel,
    car: Car,
    ticket: TicketIcon,
    general: TicketIcon,
    activity: TicketIcon,
  }
  const Icon = iconMap[booking.type || 'general'] || TicketIcon

  const isCar = booking.type === 'car'

  return (
    <Dialog open={!!booking} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-sm p-0 overflow-hidden bg-white">
        <div className="bg-primary p-6 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <Icon className="w-24 h-24" />
          </div>
          <DialogHeader className="relative z-10">
            <DialogTitle className="text-white text-2xl font-extrabold flex flex-col items-center gap-2">
              {t('voucher.digital_voucher', 'Voucher Digital')}
              <Badge className="bg-white text-primary hover:bg-white border-none font-bold shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                {t('voucher.paid_confirmed', 'Pago / Confirmado')}
              </Badge>
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="p-6 pt-4 flex flex-col items-center">
          <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 mb-6">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${booking.id}`}
              alt="QR Code"
              className="w-32 h-32 object-contain"
            />
          </div>

          <div className="w-full space-y-4">
            <div className="flex items-start gap-3 pb-3 border-b border-slate-100">
              <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">
                  {t('voucher.service', 'Serviço')}
                </span>
                <span className="font-bold text-slate-800 text-lg">
                  {booking.storeName}
                </span>
                {isCar && booking.carCategory && (
                  <span className="block text-sm text-slate-600 mt-0.5">
                    {t('voucher.car_category', 'Categoria:')}{' '}
                    <span className="capitalize">{booking.carCategory}</span>
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3 pb-3 border-b border-slate-100">
              <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
              <div className="grid grid-cols-2 w-full gap-2">
                <div>
                  <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">
                    {isCar
                      ? t('voucher.pickup', 'Retirada')
                      : t('voucher.start', 'Início')}
                  </span>
                  <span className="font-semibold text-slate-800 text-sm">
                    {formatDate(booking.date)}
                    {booking.time && <br />}
                    {booking.time && ` ${booking.time}`}
                  </span>
                </div>
                {booking.endDate && (
                  <div>
                    <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">
                      {isCar
                        ? t('voucher.return', 'Devolução')
                        : t('voucher.end', 'Fim')}
                    </span>
                    <span className="font-semibold text-slate-800 text-sm">
                      {formatDate(booking.endDate)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <User className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block mb-1">
                  {isCar
                    ? t('voucher.driver_info', 'Dados do Motorista')
                    : t('voucher.guest_info', 'Dados do Titular')}
                </span>
                <div className="space-y-1">
                  <p className="font-bold text-slate-800 text-sm">
                    {isCar ? booking.driverName : user?.name}
                  </p>
                  <p className="text-xs text-slate-600">
                    <span className="font-medium">
                      {t('voucher.document', 'Documento')}:
                    </span>{' '}
                    {isCar ? booking.driverContact : user?.documentNumber}
                  </p>
                  {!isCar && booking.guests > 0 && (
                    <p className="text-xs text-slate-600">
                      <span className="font-medium">
                        {t('voucher.guests_count', 'Total de Pessoas')}:
                      </span>{' '}
                      {booking.guests}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
