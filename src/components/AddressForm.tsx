import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LOCATION_DATA } from '@/lib/locationData'
import { useLanguage } from '@/stores/LanguageContext'

interface AddressFormProps {
  country: string
  state: string
  city: string
  onChange: (data: {
    state: string
    city: string
    zip?: string
    address?: string
  }) => void
}

export function AddressForm({
  country,
  state,
  city,
  onChange,
}: AddressFormProps) {
  const { t } = useLanguage()
  const [zip, setZip] = useState('')
  const [address, setAddress] = useState('')

  const availableStates = country
    ? Object.keys(LOCATION_DATA[country]?.states || {})
    : []

  const availableCities =
    country && state ? LOCATION_DATA[country]?.states[state] || [] : []

  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '')
    // Dynamic Masking
    if (country === 'Brasil') {
      if (val.length > 8) val = val.slice(0, 8)
      val = val.replace(/^(\d{5})(\d{0,3})/, '$1-$2')
    } else if (country === 'USA') {
      if (val.length > 5) val = val.slice(0, 5)
    }
    setZip(val)
    onChange({ state, city, zip: val, address })
  }

  return (
    <div className="space-y-4 animate-in slide-in-from-top-2">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t('address.zip')}</Label>
          <Input
            value={zip}
            onChange={handleZipChange}
            placeholder={
              country === 'Brasil'
                ? '00000-000'
                : country === 'USA'
                  ? '33101'
                  : '0000'
            }
          />
        </div>
        <div className="space-y-2">
          <Label>{t('address.state')}</Label>
          <Select
            value={state}
            onValueChange={(val) =>
              onChange({ state: val, city: '', zip, address })
            }
            disabled={!country || availableStates.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('address.state')} />
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

      <div className="space-y-2">
        <Label>{t('address.city')}</Label>
        <Select
          value={city}
          onValueChange={(val) => onChange({ state, city: val, zip, address })}
          disabled={!state || availableCities.length === 0}
        >
          <SelectTrigger>
            <SelectValue placeholder={t('address.city')} />
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
        <Label>{t('address.street')}</Label>
        <Input
          value={address}
          onChange={(e) => {
            setAddress(e.target.value)
            onChange({ state, city, zip, address: e.target.value })
          }}
          placeholder={
            country === 'Brasil' ? 'Rua Paulista, 1000' : '123 Ocean Drive'
          }
        />
      </div>
    </div>
  )
}
