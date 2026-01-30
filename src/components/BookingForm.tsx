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
import { Coupon } from '@/lib/types'
import { useCouponStore } from '@/stores/CouponContext'
import { toast } from 'sonner'
import { Calendar, Users } from 'lucide-react'

export function BookingForm({ coupon }: { coupon: Coupon }) {
  const { makeBooking } = useCouponStore()
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [guests, setGuests] = useState('2')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    makeBooking({
      couponId: coupon.id,
      storeName: coupon.storeName,
      date,
      time,
      guests: parseInt(guests),
    })
    toast.success('Reservation Request Sent', {
      description: 'The merchant will confirm shortly.',
    })
  }

  return (
    <Card className="bg-slate-50 border-slate-200">
      <CardContent className="p-4">
        <h4 className="font-bold mb-3 flex items-center gap-2">
          <Calendar className="h-4 w-4" /> Make a Reservation
        </h4>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Date</Label>
              <Input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-white"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Time</Label>
              <Input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="bg-white"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Guests</Label>
            <div className="flex gap-2">
              <Select value={guests} onValueChange={setGuests}>
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 8, 10].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} People
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="submit" className="flex-1 gap-2">
                <Users className="h-4 w-4" /> Book
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
