import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCouponStore } from '@/stores/CouponContext'
import { Calendar, Clock, Users } from 'lucide-react'
import { toast } from 'sonner'
import { Coupon } from '@/lib/types'

interface BookingFormProps {
  coupon: Coupon
}

export function BookingForm({ coupon }: BookingFormProps) {
  const { makeBooking } = useCouponStore()
  const [open, setOpen] = useState(false)
  const { register, handleSubmit, reset } = useForm()

  const onSubmit = (data: any) => {
    makeBooking({
      couponId: coupon.id,
      storeName: coupon.storeName,
      date: data.date,
      time: data.time,
      guests: parseInt(data.guests),
    })
    setOpen(false)
    reset()
    toast.success('Reserva confirmada! Aproveite seu desconto.')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-primary hover:bg-primary/90 gap-2">
          <Calendar className="h-4 w-4" /> Reservar Mesa
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reserva em {coupon.storeName}</DialogTitle>
          <DialogDescription>
            Garanta seu lugar e seu desconto de {coupon.discount}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Data
              </Label>
              <Input
                id="date"
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                {...register('date', { required: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time" className="flex items-center gap-2">
                <Clock className="h-4 w-4" /> Horário
              </Label>
              <Input
                id="time"
                type="time"
                required
                {...register('time', { required: true })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="guests" className="flex items-center gap-2">
              <Users className="h-4 w-4" /> Número de Pessoas
            </Label>
            <Input
              id="guests"
              type="number"
              min="1"
              max="20"
              defaultValue="2"
              required
              {...register('guests', { required: true })}
            />
          </div>
          <DialogFooter>
            <Button type="submit" className="w-full mt-4">
              Confirmar Reserva
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
