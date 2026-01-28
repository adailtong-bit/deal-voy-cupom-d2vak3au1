import React from 'react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  defaultCountry?: string
  className?: string
}

const COUNTRIES = [
  { code: 'BR', dial: '+55', mask: '(99) 99999-9999' },
  { code: 'US', dial: '+1', mask: '(999) 999-9999' },
  { code: 'PT', dial: '+351', mask: '999 999 999' },
  { code: 'FR', dial: '+33', mask: '9 99 99 99 99' },
]

export function PhoneInput({
  value,
  onChange,
  defaultCountry = 'BR',
  className,
}: PhoneInputProps) {
  const [country, setCountry] = React.useState(
    COUNTRIES.find((c) => c.code === defaultCountry) || COUNTRIES[0],
  )
  const [phoneNumber, setPhoneNumber] = React.useState(
    value.replace(country.dial, '').trim(),
  )

  const handleCountryChange = (val: string) => {
    const newCountry = COUNTRIES.find((c) => c.code === val) || COUNTRIES[0]
    setCountry(newCountry)
    onChange(`${newCountry.dial} ${phoneNumber}`)
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setPhoneNumber(val)
    onChange(`${country.dial} ${val}`)
  }

  return (
    <div className={cn('flex gap-2', className)}>
      <Select value={country.code} onValueChange={handleCountryChange}>
        <SelectTrigger className="w-[100px]">
          <SelectValue placeholder="Country" />
        </SelectTrigger>
        <SelectContent>
          {COUNTRIES.map((c) => (
            <SelectItem key={c.code} value={c.code}>
              {c.code} {c.dial}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        value={phoneNumber}
        onChange={handlePhoneChange}
        placeholder={country.mask}
        className="flex-1"
      />
    </div>
  )
}
