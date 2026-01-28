import React, { useEffect } from 'react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/stores/LanguageContext'

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  countryCode?: string
  className?: string
}

const COUNTRIES = [
  { name: 'Brasil', code: 'BR', dial: '+55', mask: '(99) 99999-9999' },
  { name: 'USA', code: 'US', dial: '+1', mask: '(999) 999-9999' },
  { name: 'Portugal', code: 'PT', dial: '+351', mask: '999 999 999' },
  { name: 'France', code: 'FR', dial: '+33', mask: '9 99 99 99 99' },
  { name: 'Germany', code: 'DE', dial: '+49', mask: '9999 999999' },
]

export function PhoneInput({
  value,
  onChange,
  countryCode,
  className,
}: PhoneInputProps) {
  const { t } = useLanguage()
  const [country, setCountry] = React.useState(COUNTRIES[0])
  const [phoneNumber, setPhoneNumber] = React.useState('')

  // Automatically adjust mask based on country prop
  useEffect(() => {
    if (countryCode) {
      // Logic to map incoming country name to our COUNTRIES list
      const found = COUNTRIES.find(
        (c) =>
          c.name === countryCode ||
          c.code === countryCode ||
          (countryCode === 'Brasil' && c.code === 'BR') ||
          (countryCode === 'USA' && c.code === 'US'),
      )
      if (found) setCountry(found)
    }
  }, [countryCode])

  useEffect(() => {
    if (value) {
      const cleanValue = value.replace(country.dial, '').trim()
      setPhoneNumber(cleanValue)
    }
  }, [value, country.dial])

  const handleCountryChange = (val: string) => {
    const newCountry = COUNTRIES.find((c) => c.code === val) || COUNTRIES[0]
    setCountry(newCountry)
    // Re-trigger masked value update logic if needed or just clear
    onChange(`${newCountry.dial} ${phoneNumber}`)
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '')
    let formatted = val

    // Specific Masking Logic
    if (country.code === 'BR') {
      if (val.length > 11) val = val.slice(0, 11)
      if (val.length > 10) {
        // (11) 99999-9999
        formatted = val.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
      } else if (val.length > 2) {
        // (11) 9999-9999
        formatted = val.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
      }
    } else if (country.code === 'US') {
      if (val.length > 10) val = val.slice(0, 10)
      if (val.length > 6) {
        // (999) 999-9999
        formatted = val.replace(/^(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')
      } else if (val.length > 3) {
        formatted = val.replace(/^(\d{3})(\d{0,3})/, '($1) $2')
      }
    }

    setPhoneNumber(formatted)
    onChange(`${country.dial} ${formatted}`)
  }

  return (
    <div className={cn('flex gap-2', className)}>
      <Select value={country.code} onValueChange={handleCountryChange}>
        <SelectTrigger className="w-[110px]">
          <SelectValue placeholder="Code" />
        </SelectTrigger>
        <SelectContent>
          {COUNTRIES.map((c) => (
            <SelectItem key={c.code} value={c.code}>
              <span className="mr-1 font-bold">{c.code}</span> {c.dial}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        value={phoneNumber}
        onChange={handlePhoneChange}
        placeholder={country.mask}
        className="flex-1"
        type="tel"
      />
    </div>
  )
}
