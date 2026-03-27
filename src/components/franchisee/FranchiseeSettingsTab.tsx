import { useLocation } from 'react-router-dom'
import { useLanguage } from '@/stores/LanguageContext'
import { useRegionFormatting } from '@/hooks/useRegionFormatting'
import { useCouponStore } from '@/stores/CouponContext'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export function FranchiseeSettingsTab({
  franchiseId,
}: {
  franchiseId: string
}) {
  const { t } = useLanguage()
  const { franchises, platformSettings } = useCouponStore()
  const location = useLocation()
  const isFranchisee = location.pathname.includes('/franchisee')

  const myFranchise = franchises.find((f) => f.id === franchiseId)
  const { formatNumber, currency } = useRegionFormatting(
    myFranchise?.region,
    myFranchise?.addressCountry,
  )

  const royaltyRate = platformSettings.franchiseRoyaltyRate || 15

  if (!myFranchise) return null

  return (
    <div
      className={cn(
        'space-y-6 animate-fade-in-up w-full',
        !isFranchisee && 'min-w-0 max-w-full',
      )}
    >
      <div className="min-w-0">
        <h2 className="text-2xl font-bold text-slate-800 truncate">
          {t('franchisee.settings.title', 'Settings')}
        </h2>
        <p className="text-muted-foreground truncate">
          {t('franchisee.settings.desc', 'Franchise operational parameters.')}
        </p>
      </div>
      <Card className="max-w-2xl shadow-sm border-slate-200 min-w-0 w-full">
        <CardHeader className="bg-slate-50 border-b min-w-0">
          <CardTitle className="text-lg truncate">
            {t('franchisee.settings.contract_info', 'Contract Information')}
          </CardTitle>
          <CardDescription className="line-clamp-2">
            {t(
              'franchisee.settings.contract_desc',
              'Settings managed by the Master network.',
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 pt-6 min-w-0">
          <div className="space-y-2 min-w-0">
            <Label className="font-semibold text-slate-700 truncate block">
              {t('franchisee.settings.region', 'Operating Region')}
            </Label>
            <Input
              value={myFranchise.region || myFranchise.addressCountry || ''}
              disabled
              className="bg-slate-100 font-medium w-full"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0">
            <div className="space-y-2 min-w-0">
              <Label className="font-semibold text-slate-700 truncate block">
                {t('franchisee.settings.currency', 'Default Currency')}
              </Label>
              <Input
                value={currency}
                disabled
                className="bg-slate-100 font-medium w-full"
              />
            </div>
            <div className="space-y-2 min-w-0">
              <Label
                className="font-semibold text-slate-700 truncate block"
                title={t(
                  'franchisee.settings.royalty_rate',
                  'Royalty Rate (Advertising)',
                )}
              >
                {t(
                  'franchisee.settings.royalty_rate',
                  'Royalty Rate (Advertising)',
                )}
              </Label>
              <Input
                value={`${formatNumber(royaltyRate)}%`}
                disabled
                className="bg-slate-100 font-medium text-orange-600 w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
