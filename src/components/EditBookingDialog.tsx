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
import { toast } from 'sonner'

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
  const [adults, setAdults] = useState('2')
  const [childrenCount, setChildrenCount] = useState('0')
  const [childAges, setChildAges] = useState<string[]>([])

  useEffect(() => {
    if (booking) {
      setDate(booking.date || '')
      setEndDate(booking.endDate || '')
      setTime(booking.time || '')
      setAdults(
        booking.adults?.toString() ||
          (booking.guests > 0 ? booking.guests.toString() : '1'),
      )
      setChildrenCount(booking.childrenCount?.toString() || '0')
      setChildAges(booking.childAges?.map((a) => a.toString()) || [])
    }
  }, [booking])

  if (!booking) return null

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

  const handleSave = () => {
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

    onSave(booking.id, {
      date,
      endDate: endDate || undefined,
      time,
      guests: numAdults + numChildren,
      adults: numAdults,
      childrenCount: numChildren,
      childAges: childAges.map((a) => parseInt(a) || 0),
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

          <div className="border-t border-slate-100 pt-4">
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('booking.adults', 'Adultos')}</Label>
                  <Select value={adults} onValueChange={setAdults}>
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
                <div className="space-y-2">
                  <Label>{t('booking.children', 'Crianças')}</Label>
                  <Select
                    value={childrenCount}
                    onValueChange={handleChildrenChange}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[0, 1, 2, 3, 4, 5, 6].map((n) => (
                        <SelectItem key={n} value={n.toString()}>
                          {n}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {parseInt(childrenCount) > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  {childAges.map((age, i) => (
                    <div key={i} className="space-y-1">
                      <Label className="text-xs text-slate-600">
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
                        className="h-9 bg-white"
                        placeholder={t('booking.age', 'Idade')}
                        required
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
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
