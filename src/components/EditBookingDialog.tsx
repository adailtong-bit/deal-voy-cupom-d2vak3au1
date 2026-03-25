import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Booking } from '@/lib/types'
import { useLanguage } from '@/stores/LanguageContext'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface EditBookingDialogProps {
  booking: Booking | null
  onClose: () => void
  onSave: (id: string, data: Partial<Booking>) => void
}

export function EditBookingDialog({
  booking,
  onClose,
  onSave,
}: EditBookingDialogProps) {
  const { t } = useLanguage()
  const [date, setDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [time, setTime] = useState('')
  const [guests, setGuests] = useState('2')

  useEffect(() => {
    if (booking) {
      setDate(booking.date || '')
      setEndDate(booking.endDate || '')
      setTime(booking.time || '')
      setGuests(booking.guests?.toString() || '2')
    }
  }, [booking])

  if (!booking) return null

  const handleSave = () => {
    onSave(booking.id, {
      date,
      endDate: endDate || undefined,
      time,
      guests: parseInt(guests, 10),
    })
    onClose()
  }

  const hasEndDate = booking.type === 'hotel' || booking.type === 'car'

  return (
    <Dialog open={!!booking} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {t('travel.edit_booking', 'Editar Reserva')} - {booking.storeName}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('travel.check_in_date', 'Data de Início')}</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            {hasEndDate && (
              <div className="space-y-2">
                <Label>{t('travel.check_out_date', 'Data de Fim')}</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={date}
                />
              </div>
            )}
            {!hasEndDate && (
              <div className="space-y-2">
                <Label>{t('travel.time', 'Horário')}</Label>
                <Input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label>{t('travel.guests', 'Hóspedes / Pessoas')}</Label>
            <Select value={guests} onValueChange={setGuests}>
              <SelectTrigger className="bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
                  <SelectItem key={n} value={n.toString()}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            {t('common.cancel', 'Cancelar')}
          </Button>
          <Button onClick={handleSave}>{t('common.save', 'Salvar')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
