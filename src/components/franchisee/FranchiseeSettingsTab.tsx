import { useState, useEffect } from 'react'
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
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { Save } from 'lucide-react'
import { toast } from 'sonner'
import { REGIONS } from '@/lib/locationData'
import { supabase } from '@/lib/supabase/client'

export function FranchiseeSettingsTab({
  franchiseId,
}: {
  franchiseId: string
}) {
  const { t } = useLanguage()
  const { franchises, platformSettings, updateCompany } = useCouponStore()
  const location = useLocation()
  const isFranchisee = location.pathname.includes('/franchisee')

  const myFranchise = franchises.find((f) => f.id === franchiseId)

  const [data, setData] = useState<any>({})
  const [isLoading, setIsLoading] = useState(true)

  const fetchRealState = async () => {
    if (!myFranchise?.id) return
    setIsLoading(true)

    // Force fetch to avoid cache
    const { data: remoteData, error } = await supabase
      .from('franchises')
      .select('*')
      .eq('id', myFranchise.id)
      .maybeSingle()

    if (remoteData && !error) {
      setData({
        ...myFranchise,
        ...remoteData,
        name: remoteData.name || myFranchise.name || '',
        email: remoteData.email || myFranchise.email || '',
        region:
          remoteData.region ||
          remoteData.region_id ||
          myFranchise.region ||
          'Global',
        addressCountry:
          remoteData.address_country ||
          remoteData.country ||
          myFranchise.addressCountry ||
          'USA',
        country:
          remoteData.country ||
          remoteData.address_country ||
          myFranchise.country ||
          'USA',
      })
    } else {
      setData({
        ...myFranchise,
        region: myFranchise.region || myFranchise.addressCountry || 'Global',
      })
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchRealState()
  }, [franchiseId, myFranchise?.id])

  const { formatNumber, currency } = useRegionFormatting(
    data.region,
    data.addressCountry,
  )

  const royaltyRate = platformSettings.franchiseRoyaltyRate || 15

  const savedSettings = localStorage.getItem('system_settings')
  const settings = savedSettings ? JSON.parse(savedSettings) : {}
  const customRegions = settings.customRegions || []
  const ALL_REGIONS = Array.from(new Set([...REGIONS, ...customRegions]))

  const [isSaving, setIsSaving] = useState(false)

  if (!myFranchise) return null

  const handleSave = async () => {
    try {
      setIsSaving(true)
      const payload = {
        region: data.region,
        country: data.addressCountry || data.country,
        addressCountry: data.addressCountry || data.country,
      }

      try {
        await updateCompany(franchiseId, payload)
      } catch (e) {
        console.warn('Store update warning', e)
      }

      // Sync to Supabase directly
      const { error: sbError } = await supabase.from('franchises').upsert(
        {
          id: franchiseId,
          name: data.name || myFranchise.name || 'Franchise',
          email: data.email || myFranchise.email || '',
          region: data.region || '',
          region_id: data.region || '',
          country: payload.country || '',
          address_country: payload.addressCountry || '',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' },
      )

      if (sbError) {
        throw new Error(sbError.message)
      }

      await fetchRealState() // Reload latest data directly from Supabase
      toast.success(
        t('franchisee.settings.save_success', 'Settings saved successfully'),
      )
    } catch (e: any) {
      console.error('Error saving franchise settings:', e)
      toast.error(
        e.message || t('common.error', 'An error occurred while saving.'),
      )
    } finally {
      setIsSaving(false)
    }
  }

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
            <Select
              value={data.region || ''}
              onValueChange={(v) => setData({ ...data, region: v })}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder={t('common.select', 'Select...')} />
              </SelectTrigger>
              <SelectContent>
                {ALL_REGIONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              {t(
                'franchisee.settings.region_help',
                'Defines standard formats for this franchise',
              )}
            </p>
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
          <div className="pt-4 border-t flex justify-end">
            <Button onClick={handleSave} disabled={isSaving || isLoading}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving
                ? t('common.saving', 'Saving...')
                : t('common.save', 'Save Changes')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
