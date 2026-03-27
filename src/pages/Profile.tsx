import { useState, useMemo } from 'react'
import { useCouponStore } from '@/stores/CouponContext'
import { useLanguage } from '@/stores/LanguageContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ProfileAvatar } from '@/components/ProfileAvatar'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { COUNTRIES, LOCATION_DATA } from '@/lib/locationData'
import { User } from '@/lib/types'

export default function Profile() {
  const { user, updateUserProfile, platformSettings } = useCouponStore()
  const { t } = useLanguage()

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    birthday: user?.birthday || '',
    gender: user?.gender || '',
    documentNumber: user?.documentNumber || '',
    country: user?.country || '',
    state: user?.state || '',
    city: user?.city || '',
    zipCode: user?.zipCode || '',
    categories: user?.preferences?.categories || [],
  })

  const availableStates = useMemo(() => {
    return formData.country
      ? Object.keys(LOCATION_DATA[formData.country]?.states || {})
      : []
  }, [formData.country])

  const availableCities = useMemo(() => {
    return formData.country && formData.state
      ? LOCATION_DATA[formData.country]?.states[formData.state] || []
      : []
  }, [formData.country, formData.state])

  const progress = useMemo(() => {
    let score = 0
    if (formData.name) score++
    if (formData.phone) score++
    if (formData.birthday) score++
    if (formData.gender) score++
    if (formData.documentNumber) score++
    if (formData.country) score++
    if (formData.state) score++
    if (formData.city) score++
    if (formData.zipCode) score++
    if (formData.categories.length > 0) score++
    return Math.round((score / 10) * 100)
  }, [formData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value
    if (formData.country === 'Brasil') {
      val = val.replace(/\D/g, '')
      if (val.length > 8) val = val.slice(0, 8)
      val = val.replace(/^(\d{5})(\d{0,3})/, '$1-$2')
    } else if (formData.country === 'USA') {
      val = val.replace(/\D/g, '')
      if (val.length > 5) val = val.slice(0, 5)
    }
    setFormData({ ...formData, zipCode: val })
  }

  const handleCategoryChange = (id: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      categories: checked
        ? [...prev.categories, id]
        : prev.categories.filter((c) => c !== id),
    }))
  }

  const handleSave = () => {
    updateUserProfile({
      name: formData.name,
      phone: formData.phone,
      birthday: formData.birthday,
      gender: formData.gender as User['gender'],
      documentNumber: formData.documentNumber,
      country: formData.country,
      state: formData.state,
      city: formData.city,
      zipCode: formData.zipCode,
      preferences: {
        ...user?.preferences,
        categories: formData.categories,
      },
    })
  }

  if (!user) return null

  return (
    <div className="container py-8 max-w-4xl mx-auto animate-fade-in-up mb-16 md:mb-0 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800">
          {t('profile.title', 'My Profile')}
        </h1>
        <Button onClick={handleSave}>
          {t('profile.save', 'Save Changes')}
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            <ProfileAvatar />
            <div className="flex-1 w-full space-y-4 pt-2">
              <div className="flex justify-between items-center text-sm mb-1">
                <span className="font-medium text-slate-700">
                  {t('profile.completion', 'Profile Completion')}
                </span>
                <span className="font-bold text-primary">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-slate-500">
                {t(
                  'profile.complete_prompt',
                  'Complete your profile to receive more relevant offers based on your region and interests. Information like Date of Birth and ID are mandatory for bookings.',
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>
              {t('profile.personal', 'Personal Information')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t('profile.name', 'Full Name')}</Label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your full name"
              />
            </div>
            <div className="space-y-2">
              <Label>{t('profile.email', 'Email')}</Label>
              <Input
                value={user.email}
                disabled
                className="bg-slate-50 text-slate-500"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('profile.phone', 'Phone')}</Label>
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 555 123-4567"
                />
              </div>
              <div className="space-y-2">
                <Label>
                  {t('profile.document', 'Document (ID / Passport)')}
                </Label>
                <Input
                  name="documentNumber"
                  value={formData.documentNumber}
                  onChange={handleChange}
                  placeholder="e.g.: 123.456.789-00"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {t('profile.demographics', 'Demographics & Location')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('profile.birthday', 'Date of Birth')}</Label>
                <Input
                  type="date"
                  name="birthday"
                  value={formData.birthday}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('profile.gender', 'Gender')}</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(v) => setFormData({ ...formData, gender: v })}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t('common.select', 'Select...')}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">
                      {t('gender.male', 'Male')}
                    </SelectItem>
                    <SelectItem value="female">
                      {t('gender.female', 'Female')}
                    </SelectItem>
                    <SelectItem value="non-binary">
                      {t('gender.nb', 'Non-binary')}
                    </SelectItem>
                    <SelectItem value="other">
                      {t('gender.other', 'Other')}
                    </SelectItem>
                    <SelectItem value="prefer-not-to-say">
                      {t('gender.none', 'Prefer not to say')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('profile.country', 'Country')}</Label>
                <Select
                  required
                  value={formData.country}
                  onValueChange={(v) =>
                    setFormData({
                      ...formData,
                      country: v,
                      state: '',
                      city: '',
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t('common.select', 'Select...')}
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
                <Label>{t('profile.state', 'State')}</Label>
                <Select
                  value={formData.state}
                  onValueChange={(v) =>
                    setFormData({ ...formData, state: v, city: '' })
                  }
                  disabled={!formData.country || availableStates.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t('common.select', 'Select...')}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {availableStates.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('profile.city', 'City')}</Label>
                <Select
                  value={formData.city}
                  onValueChange={(v) => setFormData({ ...formData, city: v })}
                  disabled={!formData.state || availableCities.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t('common.select', 'Select...')}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCities.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t('profile.zip', 'Zip / Postal Code')}</Label>
                <Input
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleZipChange}
                  placeholder="e.g.: 10001"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{t('profile.interests', 'Interests')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(platformSettings.availableInterests || []).map((cat) => (
                <div
                  key={cat.id}
                  className="flex flex-row items-center space-x-3 rounded-md border p-3 bg-card hover:bg-slate-50 transition-colors"
                >
                  <Checkbox
                    id={`cat-${cat.id}`}
                    checked={formData.categories.includes(cat.id)}
                    onCheckedChange={(c) => handleCategoryChange(cat.id, !!c)}
                  />
                  <div className="space-y-1 leading-none flex-1">
                    <Label
                      htmlFor={`cat-${cat.id}`}
                      className="text-sm font-medium cursor-pointer"
                    >
                      {cat.label}
                    </Label>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
