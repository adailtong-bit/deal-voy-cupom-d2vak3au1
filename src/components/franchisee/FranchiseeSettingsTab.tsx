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

export function FranchiseeSettingsTab({
  franchiseId,
}: {
  franchiseId: string
}) {
  const { t } = useLanguage()
  const { franchises, platformSettings } = useCouponStore()

  const myFranchise = franchises.find((f) => f.id === franchiseId)
  const { formatNumber, currency } = useRegionFormatting(
    myFranchise?.region,
    myFranchise?.addressCountry,
  )

  const royaltyRate = platformSettings.franchiseRoyaltyRate || 15

  if (!myFranchise) return null

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">
          {t('franchisee.settings.title', 'Configurações')}
        </h2>
        <p className="text-muted-foreground">
          {t(
            'franchisee.settings.desc',
            'Parâmetros operacionais da franquia.',
          )}
        </p>
      </div>
      <Card className="max-w-2xl shadow-sm border-slate-200">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="text-lg">
            {t('franchisee.settings.contract_info', 'Informações Contratuais')}
          </CardTitle>
          <CardDescription>
            {t(
              'franchisee.settings.contract_desc',
              'Configurações gerenciadas pela rede Master.',
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 pt-6">
          <div className="space-y-2">
            <Label className="font-semibold text-slate-700">
              {t('franchisee.settings.region', 'Região de Atuação')}
            </Label>
            <Input
              value={myFranchise.region || myFranchise.addressCountry || ''}
              disabled
              className="bg-slate-100 font-medium"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-semibold text-slate-700">
                {t('franchisee.settings.currency', 'Moeda Padrão')}
              </Label>
              <Input
                value={currency}
                disabled
                className="bg-slate-100 font-medium"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-semibold text-slate-700">
                {t(
                  'franchisee.settings.royalty_rate',
                  'Taxa de Royalties (Publicidade)',
                )}
              </Label>
              <Input
                value={`${formatNumber(royaltyRate)}%`}
                disabled
                className="bg-slate-100 font-medium text-orange-600"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
