import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Coins } from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'
import { useCouponStore } from '@/stores/CouponContext'
import { Company } from '@/lib/types'

export function VendorSettingsTab({ company }: { company: Company }) {
  const { t } = useLanguage()
  const { toggleLoyaltySystem } = useCouponStore()

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('vendor.operational')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
          <div className="space-y-0.5">
            <Label className="text-base flex items-center gap-2">
              <Coins className="h-4 w-4 text-yellow-500" />{' '}
              {t('vendor.loyalty')}
            </Label>
            <p className="text-sm text-muted-foreground">
              {t('vendor.loyalty_desc')}
            </p>
          </div>
          <Switch
            checked={company.enableLoyalty}
            onCheckedChange={(checked) =>
              toggleLoyaltySystem(company.id, checked)
            }
          />
        </div>
      </CardContent>
    </Card>
  )
}
