import { useState, useMemo, useEffect } from 'react'
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
import { Store, Save, MapPin } from 'lucide-react'
import { useCouponStore } from '@/stores/CouponContext'
import { supabase } from '@/lib/supabase/client'
import { useLanguage } from '@/stores/LanguageContext'
import { COUNTRIES, LOCATION_DATA, REGIONS } from '@/lib/locationData'
import { PhoneInput } from '@/components/PhoneInput'
import { toast } from 'sonner'

export function VendorSettingsTab({ company }: any) {
  const { updateCompany } = useCouponStore()
  const { t } = useLanguage()
  const [data, setData] = useState<any>({})

  useEffect(() => {
    const fetchRealState = async () => {
      if (company?.id) {
        const { data: remoteData, error } = await supabase
          .from('merchants')
          .select('*')
          .eq('id', company.id)
          .maybeSingle()

        if (remoteData && !error) {
          setData({
            ...company,
            ...remoteData,
            name: remoteData.name || company.name || '',
            email: remoteData.email || company.email || '',
            addressCountry:
              remoteData.address_country ||
              remoteData.country ||
              company.addressCountry ||
              'USA',
            country:
              remoteData.country ||
              remoteData.address_country ||
              company.country ||
              'USA',
            region:
              remoteData.region ||
              remoteData.region_id ||
              company.region ||
              'Global',
            businessPhone: remoteData.business_phone || company.businessPhone,
            addressState: remoteData.address_state || company.addressState,
            addressCity: remoteData.address_city || company.addressCity,
            addressZip: remoteData.address_zip || company.addressZip,
            addressStreet: remoteData.address_street || company.addressStreet,
            addressNumber: remoteData.address_number || company.addressNumber,
            addressComplement:
              remoteData.address_complement || company.addressComplement,
          })
          return
        }
      }

      setData({
        ...company,
        addressCountry: company.addressCountry || company.country || 'USA',
        country: company.country || company.addressCountry || 'USA',
        region:
          company.region ||
          company.addressCountry ||
          company.country ||
          'Global',
      })
    }

    if (company) {
      fetchRealState()
    }
  }, [company])

  const handleChange = (k: string, v: any) => setData({ ...data, [k]: v })

  const savedSettings = localStorage.getItem('system_settings')
  const settings = savedSettings ? JSON.parse(savedSettings) : {}
  const customRegions = settings.customRegions || []

  const ALL_COUNTRIES = Array.from(new Set([...COUNTRIES, ...customRegions]))
  const ALL_REGIONS = Array.from(new Set([...REGIONS, ...customRegions]))

  const currentCountry = data.addressCountry || data.country
  const states =
    currentCountry && LOCATION_DATA[currentCountry]
      ? Object.keys(LOCATION_DATA[currentCountry]?.states || {})
      : []
  const cities =
    currentCountry && data.addressState && LOCATION_DATA[currentCountry]
      ? LOCATION_DATA[currentCountry]?.states[data.addressState] || []
      : []

  const isUSA = ['USA', 'US', 'United States'].includes(currentCountry || 'USA')

  const formattedAddress = useMemo(() => {
    const {
      addressState: s,
      addressCity: ci,
      addressZip: z,
      addressStreet: st,
      addressNumber: n,
      addressComplement: comp,
    } = data

    if (!st && !n)
      return t('vendor.settings_tab.fill_address', 'Fill Street to preview')

    const cText = comp ? ` - ${comp}` : ''
    const usCText = comp ? `, ${comp}` : ''

    if (isUSA) {
      const streetPart = n ? `${n} ${st}` : st
      return `${streetPart}${usCText}, ${ci || 'City'}, ${s || 'State'} ${z || 'ZIP'}`
    }
    return `${st}${n ? `, ${n}` : ''}${cText}, ${ci || 'City'} - ${s || 'State'}, ${z || 'ZIP'}`
  }, [data, isUSA, t])

  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '')
    if (
      currentCountry === 'Brasil' ||
      currentCountry === 'Brazil' ||
      currentCountry === 'BR'
    ) {
      if (val.length > 8) val = val.slice(0, 8)
      val = val.replace(/^(\d{5})(\d{0,3})/, '$1-$2').replace(/-$/, '')
    } else if (isUSA) {
      if (val.length > 5) val = val.slice(0, 5)
    } else {
      if (val.length > 10) val = val.slice(0, 10)
    }
    handleChange('addressZip', val)
  }

  const handleSave = async () => {
    try {
      const targetCountry = data.addressCountry || data.country || 'USA'
      const targetIsUSA = ['USA', 'US', 'United States'].includes(targetCountry)

      const payload = {
        ...data,
        country: targetCountry,
        addressCountry: targetCountry,
        region: data.region,
        addressNumber: targetIsUSA ? '' : data.addressNumber,
      }

      // Sanitize payload for backend read-only fields
      delete payload.id
      delete payload.created
      delete payload.updated
      delete payload.collectionId
      delete payload.collectionName
      delete payload.expand

      try {
        await updateCompany(company.id, payload)
      } catch (e) {
        console.warn('Store update warning', e)
      }

      // Sync directly to Supabase as requested
      const { error: sbError } = await supabase.from('merchants').upsert(
        {
          id: company.id,
          name: data.name || '',
          email: data.email || '',
          business_phone: data.businessPhone || '',
          region: data.region || '',
          region_id: data.region || '',
          country: payload.country || '',
          address_country: payload.addressCountry || '',
          address_state: data.addressState || '',
          address_city: data.addressCity || '',
          address_zip: data.addressZip || '',
          address_street: data.addressStreet || '',
          address_number: payload.addressNumber || '',
          address_complement: data.addressComplement || '',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' },
      )

      if (sbError) {
        throw new Error(sbError.message)
      }

      toast.success(
        t(
          'vendor.settings_tab.save_success',
          'Store settings updated successfully',
        ),
      )
    } catch (e: any) {
      console.error('Error saving company:', e)
      toast.error(
        e.message || t('common.error', 'An error occurred while saving.'),
      )
    }
  }

  return (
    <Card className="max-w-4xl border-slate-200 shadow-sm animate-fade-in-up">
      <CardHeader className="border-b bg-slate-50/50 pb-5">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Store className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">
              {t('vendor.settings_tab.title', 'Store Settings')}
            </CardTitle>
            <CardDescription>
              {t(
                'vendor.settings_tab.desc',
                'Manage your company profile and location details.',
              )}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label className="text-slate-700">
              {t('vendor.settings_tab.store_name', 'Store Name')}
            </Label>
            <Input
              value={data.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
              className="bg-white"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-700">
              {t('vendor.settings_tab.contact_email', 'Contact Email')}
            </Label>
            <Input
              type="email"
              value={data.email || ''}
              onChange={(e) => handleChange('email', e.target.value)}
              className="bg-white"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-700">
              {t('vendor.settings_tab.business_phone', 'Business Phone')}
            </Label>
            <PhoneInput
              value={data.businessPhone || ''}
              onChange={(val) => handleChange('businessPhone', val)}
              className="bg-white"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-700">
              {t('vendor.settings_tab.assigned_region', 'Assigned Region')}
            </Label>
            <Select
              value={data.region || ''}
              onValueChange={(v) => handleChange('region', v)}
            >
              <SelectTrigger className="bg-white">
                <SelectValue
                  placeholder={t('vendor.settings_tab.select', 'Select...')}
                />
              </SelectTrigger>
              <SelectContent>
                {ALL_REGIONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[10px] text-slate-400 mt-1 font-medium">
              {t(
                'vendor.settings_tab.region_help_editable',
                'Defines standard formats for this store',
              )}
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-slate-500" />
            <h3 className="text-lg font-semibold text-slate-800">
              {t(
                'vendor.settings_tab.physical_address',
                'Physical Address (Map)',
              )}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="space-y-2">
              <Label className="text-slate-700">
                {t('vendor.settings_tab.country', 'Country')}
              </Label>
              <Select
                value={data.addressCountry || data.country || ''}
                onValueChange={(v) =>
                  setData({
                    ...data,
                    addressCountry: v,
                    country: v,
                    addressState: '',
                    addressCity: '',
                  })
                }
              >
                <SelectTrigger className="bg-white">
                  <SelectValue
                    placeholder={t('vendor.settings_tab.select', 'Select...')}
                  />
                </SelectTrigger>
                <SelectContent>
                  {ALL_COUNTRIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700">
                {t('vendor.settings_tab.state', 'State / Province')}
              </Label>
              {states.length > 0 ? (
                <Select
                  value={data.addressState || ''}
                  onValueChange={(v) =>
                    setData({ ...data, addressState: v, addressCity: '' })
                  }
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue
                      placeholder={t('vendor.settings_tab.select', 'Select...')}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={data.addressState || ''}
                  onChange={(e) =>
                    setData({
                      ...data,
                      addressState: e.target.value,
                      addressCity: '',
                    })
                  }
                  placeholder={t(
                    'vendor.settings_tab.state',
                    'State / Province',
                  )}
                  className="bg-white"
                />
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700">
                {t('vendor.settings_tab.city', 'City')}
              </Label>
              {cities.length > 0 ? (
                <Select
                  value={data.addressCity || ''}
                  onValueChange={(v) => handleChange('addressCity', v)}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue
                      placeholder={t('vendor.settings_tab.select', 'Select...')}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={data.addressCity || ''}
                  onChange={(e) => handleChange('addressCity', e.target.value)}
                  placeholder={t('vendor.settings_tab.city', 'City')}
                  className="bg-white"
                />
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700">
                {t('vendor.settings_tab.zip', 'ZIP / Postal Code')}
              </Label>
              <Input
                value={data.addressZip || ''}
                onChange={handleZipChange}
                placeholder={isUSA ? '12345' : '00000-000'}
                className="bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div
              className={`space-y-2 ${isUSA ? 'sm:col-span-8' : 'sm:col-span-6'}`}
            >
              <Label className="text-slate-700">
                {t('vendor.settings_tab.street', 'Street / Address')}
              </Label>
              <Input
                value={data.addressStreet || ''}
                onChange={(e) => handleChange('addressStreet', e.target.value)}
                placeholder={
                  isUSA ? 'e.g. 123 Ocean Drive' : 'e.g. Rua Paulista'
                }
                className="bg-white"
              />
            </div>

            {!isUSA && (
              <div className="space-y-2 sm:col-span-2 animate-in fade-in zoom-in duration-200">
                <Label className="text-slate-700">
                  {t('vendor.settings_tab.number', 'Number')}
                </Label>
                <Input
                  value={data.addressNumber || ''}
                  onChange={(e) =>
                    handleChange('addressNumber', e.target.value)
                  }
                  placeholder="1000"
                  className="bg-white"
                />
              </div>
            )}

            <div className="space-y-2 sm:col-span-4">
              <Label className="text-slate-700">
                {t('vendor.settings_tab.complement', 'Complement (Optional)')}
              </Label>
              <Input
                value={data.addressComplement || ''}
                onChange={(e) =>
                  handleChange('addressComplement', e.target.value)
                }
                placeholder="Suite, Floor, etc."
                className="bg-white"
              />
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-5">
            <p className="text-[11px] text-slate-500 font-bold mb-1.5 uppercase tracking-wider">
              {t(
                'vendor.settings_tab.app_preview',
                'How it will appear in the app',
              )}
            </p>
            <p className="text-slate-800 font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary shrink-0" />{' '}
              {formattedAddress}
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <Button onClick={handleSave} className="font-bold shadow-sm">
            <Save className="w-4 h-4 mr-2" />{' '}
            {t('vendor.settings_tab.save', 'Save Changes')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
