import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Coupon } from '@/lib/types'
import { useCouponStore } from '@/stores/CouponContext'
import { Calendar, Clock, Users } from 'lucide-react'
import { toast } from 'sonner'

export function BookingForm({ coupon }: { coupon: Coupon }) {
  const { makeBooking } = useCouponStore()
  const { register, handleSubmit, reset } = useForm()
  const [isLoading, setIsLoading] = useState(false)

  const onSubmit = (data: any) => {
    setIsLoading(true)
    setTimeout(() => {
      makeBooking({
        couponId: coupon.id,
        storeName: coupon.storeName,
        date: data.date,
        time: data.time,
        guests: parseInt(data.guests),
      })
      toast.success('Reserva confirmada!', {
        description: `Agendado para ${data.date} às ${data.time}`,
      })
      setIsLoading(false)
      reset()
    }, 1500)
  }

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader>
        <CardTitle className="text-lg">Fazer Reserva</CardTitle>
        <CardDescription>
          Garanta seu lugar e use o cupom no local.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Data
              </Label>
              <Input type="date" id="date" required {...register('date')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time" className="flex items-center gap-2">
                <Clock className="h-4 w-4" /> Horário
              </Label>
              <Input type="time" id="time" required {...register('time')} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="guests" className="flex items-center gap-2">
              <Users className="h-4 w-4" /> Pessoas
            </Label>
            <Input
              type="number"
              id="guests"
              min="1"
              max="20"
              defaultValue="2"
              required
              {...register('guests')}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600"
            disabled={isLoading}
          >
            {isLoading ? 'Confirmando...' : 'Confirmar Reserva'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
