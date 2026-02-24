import * as React from 'react'
import { Check, MapPin, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { POPULAR_DESTINATIONS } from '@/lib/data'
import { useLanguage } from '@/stores/LanguageContext'

interface LocationInputProps {
  value: string
  onChange: (value: string) => void
  onSelect?: (location: { lat: number; lng: number }) => void
  placeholder?: string
  className?: string
  icon?: React.ReactNode
}

export function LocationInput({
  value,
  onChange,
  onSelect,
  placeholder,
  className,
  icon,
}: LocationInputProps) {
  const [open, setOpen] = React.useState(false)
  const { t } = useLanguage()

  const defaultPlaceholder = placeholder || t('explore.select_location')

  // Flatten locations into a searchable list
  const locations = Object.entries(POPULAR_DESTINATIONS).map(([key, data]) => ({
    value: key,
    label: data.label,
    ...data,
  }))

  const handleSelect = (currentValue: string) => {
    // If selecting an existing item
    const selected = locations.find((item) => item.value === currentValue)
    if (selected) {
      onChange(selected.label)
      onSelect?.({ lat: selected.lat, lng: selected.lng })
    } else {
      // If free text (handled by input change mostly, but command might capture clicks)
      onChange(currentValue)
    }
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative w-full">
          <div className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground z-10">
            {icon || <MapPin className="h-4 w-4" />}
          </div>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              'w-full justify-between pl-9 text-left font-normal bg-white',
              !value && 'text-muted-foreground',
              className,
            )}
          >
            {value || defaultPlaceholder}
          </Button>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput
            placeholder={defaultPlaceholder}
            onValueChange={(val) => onChange(val)}
            value={value}
          />
          <CommandList>
            <CommandEmpty>{t('explore.no_location')}</CommandEmpty>
            <CommandGroup heading={t('explore.popular_destinations')}>
              {locations.map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.value}
                  onSelect={handleSelect}
                  className="cursor-pointer"
                >
                  <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                  {item.label}
                  <Check
                    className={cn(
                      'ml-auto h-4 w-4',
                      value === item.label ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
