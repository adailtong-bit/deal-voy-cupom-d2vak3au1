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
import { Calendar, Clock, Users, Coins } from 'lucide-react'
import { toast } from 'sonner'
import { useLanguage } from '@/stores/LanguageContext'

export function BookingForm({ coupon }: { coupon: Coupon }) {
  const { makeBooking } = useCouponStore()
  const { register, handleSubmit, reset } = useForm()
  const [isLoading, setIsLoading] = useState(false)
  const { t } = useLanguage()

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
      toast.success(t('common.success'), {
        description: 'Reserva confirmada! +50 pontos ganhos.',
        icon: <Coins className="h-4 w-4 text-yellow-500" />,
      })
      setIsLoading(false)
      reset()
    }, 1500)
  }

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader>
        <CardTitle className="text-lg">{t('coupon.reserve')}</CardTitle>
        <CardDescription className="flex items-center gap-1">
          {t('coupon.reserved')} •{' '}
          <span className="text-yellow-600 font-bold flex items-center gap-1 text-xs">
            <Coins className="h-3 w-3" /> Ganhe 50 pts
          </span>
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" /> {t('hub.date')}
              </Label>
              <Input type="date" id="date" required {...register('date')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time" className="flex items-center gap-2">
                <Clock className="h-4 w-4" /> Time
              </Label>
              <Input type="time" id="time" required {...register('time')} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="guests" className="flex items-center gap-2">
              <Users className="h-4 w-4" /> People
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
            className="w-full bg-blue-500 hover:bg-blue-600 font-bold"
            disabled={isLoading}
          >
            {isLoading ? t('common.loading') : t('coupon.reserve')}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
