import { Coupon } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Utensils } from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'

export function CouponMenu({ coupon }: { coupon: Coupon }) {
  const { t } = useLanguage()

  if (!coupon.menu || coupon.menu.length === 0) return null

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Utensils className="h-5 w-5" /> Menu
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {coupon.menu.map((item, idx) => (
            <div
              key={idx}
              className="flex justify-between items-start border-b last:border-0 pb-3 last:pb-0"
            >
              <div>
                <h4 className="font-bold text-sm">{item.name}</h4>
                <p className="text-xs text-muted-foreground">
                  {item.description}
                </p>
              </div>
              <span className="font-semibold text-sm">
                R$ {item.price.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
