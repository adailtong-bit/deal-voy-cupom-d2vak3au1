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
  countryCode?: string // e.g. 'Brasil', 'USA'
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

  // Sync with prop if provided
  useEffect(() => {
    if (countryCode) {
      const found = COUNTRIES.find((c) => c.name === countryCode)
      if (found) setCountry(found)
    }
  }, [countryCode])

  // Parse initial value
  useEffect(() => {
    if (value) {
      const cleanValue = value.replace(country.dial, '').trim()
      setPhoneNumber(cleanValue)
    }
  }, [value, country.dial])

  const applyMask = (val: string, mask: string) => {
    let i = 0
    const noMask = val.replace(/\D/g, '')
    return mask.replace(/9/g, (_) => (noMask[i] ? noMask[i++] : ''))
  }

  const handleCountryChange = (val: string) => {
    const newCountry = COUNTRIES.find((c) => c.code === val) || COUNTRIES[0]
    setCountry(newCountry)
    onChange(`${newCountry.dial} ${phoneNumber}`)
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    // Simple mask application based on country mask
    // Note: For robust masking, a library like react-input-mask is better,
    // but here we implement basic "display" logic or just let user type if complex.
    // For this user story, "Automatic adjustment of input masks" is requested.
    // We'll filter digits and apply mask logic.

    const digits = val.replace(/\D/g, '')
    // We only apply mask if it matches length approx or just let it be loose for now to avoid UX issues
    // without a library. But let's try a simple formatter.
    let formatted = digits
    if (country.code === 'BR') {
      if (digits.length <= 10) {
        formatted = digits.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
      } else {
        formatted = digits.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3')
      }
    } else if (country.code === 'US') {
      formatted = digits.replace(/^(\d{3})(\d{3})(\d{0,4})/, '($1) $2-$3')
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
              <span className="mr-1">{c.code}</span> {c.dial}
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
