import { Coupon } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  MapPin,
  CalendarDays,
  Info,
  QrCode,
  ImageOff,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TravelActivityCardProps {
  stop: Coupon
  dayId: string
  mockTime: string
  onRemove: (dayId: string, stopId: string) => void
}

export function TravelActivityCard({
  stop,
  dayId,
  mockTime,
  onRemove,
}: TravelActivityCardProps) {
  return (
    <div className="flex gap-4 group">
      {/* Time Column */}
      <div className="w-16 sm:w-20 shrink-0 flex flex-col items-center pt-4">
        <span className="text-xs sm:text-sm font-bold text-slate-700 text-center leading-tight whitespace-pre-line">
          {mockTime}
        </span>
        <div className="flex-1 w-px bg-slate-200 mt-2 group-last:hidden" />
      </div>

      {/* Activity Card */}
      <Card className="flex-1 overflow-hidden hover:shadow-md transition-shadow bg-white border-slate-200">
        <div className="flex flex-col sm:flex-row">
          <div className="w-full sm:w-48 h-40 sm:h-auto shrink-0 relative bg-slate-100 flex items-center justify-center">
            {stop.image ? (
              <img
                src={stop.image}
                alt={stop.storeName}
                className="w-full h-full object-cover"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            ) : (
              <ImageOff className="h-8 w-8 text-slate-400" />
            )}
            <Badge className="absolute top-2 left-2 bg-white/90 text-slate-900 border-none shadow-sm">
              {stop.category}
            </Badge>
          </div>
          <CardContent className="p-4 sm:p-5 flex-1 flex flex-col">
            <div className="flex justify-between items-start gap-4 mb-2">
              <div>
                <h4 className="text-lg font-bold text-slate-900 leading-tight mb-1">
                  {stop.storeName}
                </h4>
                <p className="text-sm text-primary font-medium">{stop.title}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-400 hover:text-red-600 hover:bg-red-50 shrink-0 -mr-2 -mt-2"
                onClick={() => onRemove(dayId, stop.id)}
                title="Remove activity"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>

            <p className="text-sm text-slate-600 line-clamp-2 mb-4">
              {stop.description}
            </p>

            {/* Address and Validity */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-5">
              <div className="flex items-start sm:items-center gap-1.5 text-xs text-slate-600">
                <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5 sm:mt-0" />
                <span className="line-clamp-1">
                  {stop.address || 'Address unavailable'}
                </span>
              </div>
              <div className="hidden sm:block w-1 h-1 rounded-full bg-slate-300" />
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <CalendarDays className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span>
                  Validity:{' '}
                  {stop.startDate
                    ? new Date(stop.startDate).toLocaleDateString()
                    : 'Now'}{' '}
                  -{' '}
                  {stop.expiryDate
                    ? new Date(stop.expiryDate).toLocaleDateString()
                    : 'N/A'}
                </span>
              </div>
            </div>

            {/* Instructions and QR block */}
            <div className="mt-auto bg-slate-50 rounded-lg border border-slate-100 p-3 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex-1 space-y-1.5">
                <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5 text-primary" />
                  How to Use
                </h5>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {stop.instructions ||
                    'Present this screen at the counter. Ensure the code is clearly visible to claim your benefit.'}
                </p>
              </div>
              <div className="shrink-0 bg-white border border-slate-200 rounded p-2 flex flex-col items-center justify-center min-w-[110px] w-full sm:w-auto shadow-sm">
                <QrCode
                  className="h-10 w-10 text-slate-800 mb-1"
                  strokeWidth={1.5}
                />
                <span className="text-[10px] font-mono font-bold text-slate-500 tracking-widest uppercase text-center w-full truncate px-1">
                  {stop.code || 'NO-CODE'}
                </span>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  )
}
