import { Coupon } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { useLanguage } from '@/stores/LanguageContext'
import { Utensils } from 'lucide-react'

export function CouponMenu({ coupon }: { coupon: Coupon }) {
  const { formatCurrency } = useLanguage()

  if (!coupon.menu || coupon.menu.length === 0) return null

  return (
    <div className="space-y-4 mb-6">
      <h3 className="font-semibold text-lg flex items-center gap-2">
        <Utensils className="h-5 w-5" /> Menu Highlights
      </h3>
      <div className="space-y-3">
        {coupon.menu.map((item, idx) => (
          <Card key={idx} className="bg-slate-50/50 border-slate-100">
            <CardContent className="p-3 flex justify-between items-center">
              <div>
                <p className="font-bold text-sm">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  {item.description}
                </p>
              </div>
              <span className="font-bold text-primary text-sm ml-4">
                {formatCurrency(item.price)}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
