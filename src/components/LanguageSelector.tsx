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
      <SelectTrigger className="w-[80px] h-8 text-xs bg-transparent border border-input focus:ring-0 px-2 gap-1 rounded-full">
        <SelectValue placeholder="Lang" />
      </SelectTrigger>
      <SelectContent align="end">
        <SelectItem value="pt">🇧🇷 PT</SelectItem>
        <SelectItem value="en">🇺🇸 EN</SelectItem>
        <SelectItem value="es">🇪🇸 ES</SelectItem>
        <SelectItem value="fr">🇫🇷 FR</SelectItem>
        <SelectItem value="de">🇩🇪 DE</SelectItem>
        <SelectItem value="it">🇮🇹 IT</SelectItem>
        <SelectItem value="zh">🇨🇳 ZH</SelectItem>
        <SelectItem value="ja">🇯🇵 JA</SelectItem>
      </SelectContent>
    </Select>
  )
}
