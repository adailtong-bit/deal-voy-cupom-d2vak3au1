import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useLanguage } from '@/stores/LanguageContext'
import { Globe } from 'lucide-react'

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage()

  return (
    <Select value={language} onValueChange={(val: any) => setLanguage(val)}>
      <SelectTrigger className="w-[130px] h-9 text-xs font-medium border-slate-200 shadow-sm bg-white">
        <div className="flex items-center gap-2">
          <Globe className="h-3 w-3 text-slate-500" />
          <SelectValue placeholder="Idioma" />
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="pt">🇧🇷 Português</SelectItem>
        <SelectItem value="en">🇺🇸 English</SelectItem>
        <SelectItem value="es">🇪🇸 Español</SelectItem>
        <SelectItem value="fr">🇫🇷 Français</SelectItem>
        <SelectItem value="de">🇩🇪 Deutsch</SelectItem>
        <SelectItem value="it">🇮🇹 Italiano</SelectItem>
        <SelectItem value="zh">🇨🇳 中文</SelectItem>
        <SelectItem value="ja">🇯🇵 日本語</SelectItem>
      </SelectContent>
    </Select>
  )
}
