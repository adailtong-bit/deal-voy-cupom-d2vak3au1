import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { COUNTRIES } from '@/lib/locationData'
import { AddressForm } from '@/components/AddressForm'
import { PhoneInput } from '@/components/PhoneInput'
import { User } from '@/lib/types'
import { useLanguage } from '@/stores/LanguageContext'

interface ProfileEditFormProps {
  user: User
  onSave: (data: Partial<User>) => void
}

export function ProfileEditForm({ user, onSave }: ProfileEditFormProps) {
  const { t } = useLanguage()
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    birthday: user.birthday || '',
    country: user.country || '',
    state: user.state || '',
    city: user.city || '',
    phone: user.phone || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label>{t('profile.name') || 'Name'}</Label>
        <Input
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          required
        />
      </div>
      <div className="space-y-2">
        <Label>{t('profile.email') || 'Email'}</Label>
        <Input
          type="email"
          value={formData.email}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, email: e.target.value }))
          }
          required
        />
      </div>
      <div className="space-y-2">
        <Label>{t('hub.date') || 'Birthday'}</Label>
        <Input
          type="date"
          value={formData.birthday}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, birthday: e.target.value }))
          }
          required
        />
      </div>
      <div className="space-y-2">
        <Label>{t('profile.address') || 'Country'}</Label>
        <Select
          value={formData.country}
          onValueChange={(val) =>
            setFormData((prev) => ({
              ...prev,
              country: val,
              state: '',
              city: '',
            }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Country" />
          </SelectTrigger>
          <SelectContent>
            {COUNTRIES.map((country) => (
              <SelectItem key={country} value={country}>
                {country}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <AddressForm
        country={formData.country}
        state={formData.state}
        city={formData.city}
        onChange={(data) => setFormData((prev) => ({ ...prev, ...data }))}
      />

      <div className="space-y-2">
        <Label>{t('phone.label') || 'Phone'}</Label>
        <PhoneInput
          value={formData.phone}
          onChange={(val) => setFormData((prev) => ({ ...prev, phone: val }))}
          countryCode={formData.country}
        />
      </div>

      <Button type="submit" className="w-full font-bold h-11 mt-4">
        {t('profile.save') || 'Save Profile'}
      </Button>
    </form>
  )
}
