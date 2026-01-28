import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useLanguage } from '@/stores/LanguageContext'

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage()

  return (
    <Select value={language} onValueChange={(val: any) => setLanguage(val)}>
      <SelectTrigger className="w-[60px] h-8 text-xs bg-transparent border-none focus:ring-0 px-1 gap-1">
        <SelectValue placeholder="Lang" />
      </SelectTrigger>
      <SelectContent align="end">
        <SelectItem value="pt">🇧🇷 PT</SelectItem>
        <SelectItem value="en">🇺🇸 EN</SelectItem>
        <SelectItem value="es">🇪🇸 ES</SelectItem>
      </SelectContent>
    </Select>
  )
}
