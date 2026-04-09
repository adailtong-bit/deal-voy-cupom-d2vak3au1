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
import { useLanguage } from '@/stores/LanguageContext'
import { COUNTRIES, LOCATION_DATA } from '@/lib/locationData'
import { PhoneInput } from '@/components/PhoneInput'
import { toast } from 'sonner'

export function VendorSettingsTab({ company }: any) {
  const { updateCompany } = useCouponStore()
  const { t } = useLanguage()
  const [data, setData] = useState<any>({})

  useEffect(() => {
    if (company) {
      // Ensure country and addressCountry are synced when loading
      setData({
        ...company,
        addressCountry: company.addressCountry || company.country || 'USA',
        country: company.country || company.addressCountry || 'USA',
      })
    }
  }, [company])

  const handleChange = (k: string, v: any) => setData({ ...data, [k]: v })

  const currentCountry = data.addressCountry || data.country
  const states = currentCountry
    ? Object.keys(LOCATION_DATA[currentCountry]?.states || {})
    : []
  const cities =
    currentCountry && data.addressState
      ? LOCATION_DATA[currentCountry]?.states[data.addressState] || []
      : []

  const formattedAddress = useMemo(() => {
    const {
      addressCountry,
      country,
      addressState: s,
      addressCity: ci,
      addressZip: z,
      addressStreet: st,
      addressNumber: n,
      addressComplement: comp,
    } = data
    const c = addressCountry || country
    if (!st || !n)
      return t(
        'vendor.settings_tab.fill_address',
        'Fill Street and Number to preview',
      )

    const cText = comp ? ` - ${comp}` : ''
    const usCText = comp ? `, ${comp}` : ''

    if (c === 'USA') {
      return `${n} ${st}${usCText}, ${ci || 'City'}, ${s || 'State'} ${z || 'ZIP'}`
    }
    return `${st}, ${n}${cText}, ${ci || 'City'} - ${s || 'State'}, ${z || 'ZIP'}`
  }, [data, t])

  const handleSave = async () => {
    try {
      // Force sync both fields before saving to ensure backend persists it
      const payload = {
        ...data,
        country: data.addressCountry || data.country,
        addressCountry: data.addressCountry || data.country,
      }

      await updateCompany(company.id, payload)

      toast.success(
        t(
          'vendor.settings_tab.save_success',
          'Store settings updated successfully',
        ),
      )
    } catch (e) {
      toast.error(t('common.error', 'An error occurred while saving.'))
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
            <Input
              value={data.region || ''}
              onChange={(e) => handleChange('region', e.target.value)}
              placeholder="Global"
              className="bg-white"
            />
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
                  {COUNTRIES.map((c) => (
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
                onChange={(e) => handleChange('addressZip', e.target.value)}
                placeholder={
                  (data.addressCountry || data.country) === 'USA'
                    ? '12345'
                    : '00000-000'
                }
                className="bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="space-y-2 sm:col-span-6">
              <Label className="text-slate-700">
                {t('vendor.settings_tab.street', 'Street / Address')}
              </Label>
              <Input
                value={data.addressStreet || ''}
                onChange={(e) => handleChange('addressStreet', e.target.value)}
                placeholder="e.g. 123 Ocean Drive"
                className="bg-white"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label className="text-slate-700">
                {t('vendor.settings_tab.number', 'Number')}
              </Label>
              <Input
                value={data.addressNumber || ''}
                onChange={(e) => handleChange('addressNumber', e.target.value)}
                placeholder="1000"
                className="bg-white"
              />
            </div>
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
