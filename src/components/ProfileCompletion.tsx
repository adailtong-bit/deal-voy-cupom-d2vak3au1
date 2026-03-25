import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCouponStore } from '@/stores/CouponContext'
import { useLanguage } from '@/stores/LanguageContext'
import { toast } from 'sonner'

interface ProfileCompletionProps {
  onSuccess: () => void
}

export function ProfileCompletion({ onSuccess }: ProfileCompletionProps) {
  const { user, updateUserProfile } = useCouponStore()
  const { t } = useLanguage()

  const [profName, setProfName] = useState(user?.name || '')
  const [profGender, setProfGender] = useState(user?.gender || '')
  const [profBirthday, setProfBirthday] = useState(user?.birthday || '')
  const [profDoc, setProfDoc] = useState(user?.documentNumber || '')

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    if (!profName || !profGender || !profBirthday || !profDoc) {
      toast.error(
        t('booking.fill_all_fields', 'Preencha todos os campos obrigatórios.'),
      )
      return
    }
    updateUserProfile({
      name: profName,
      gender: profGender as any,
      birthday: profBirthday,
      documentNumber: profDoc,
    })
    toast.success(
      t(
        'booking.profile_updated',
        'Perfil atualizado! Você pode continuar sua solicitação.',
      ),
    )
    onSuccess()
  }

  return (
    <form onSubmit={handleSaveProfile} className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-slate-700">
          {t('profile.name', 'Nome Completo')}
        </Label>
        <Input
          required
          value={profName}
          onChange={(e) => setProfName(e.target.value)}
          className="bg-white shadow-sm"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-slate-700">
          {t('profile.gender', 'Gênero')}
        </Label>
        <Select value={profGender} onValueChange={setProfGender} required>
          <SelectTrigger className="bg-white shadow-sm">
            <SelectValue placeholder={t('common.select', 'Selecione...')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="male">
              {t('gender.male', 'Masculino')}
            </SelectItem>
            <SelectItem value="female">
              {t('gender.female', 'Feminino')}
            </SelectItem>
            <SelectItem value="non-binary">
              {t('gender.nb', 'Não-binário')}
            </SelectItem>
            <SelectItem value="other">{t('gender.other', 'Outro')}</SelectItem>
            <SelectItem value="prefer-not-to-say">
              {t('gender.none', 'Prefiro não dizer')}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-slate-700">
          {t('profile.birthday', 'Data de Nascimento')}
        </Label>
        <Input
          required
          type="date"
          value={profBirthday}
          onChange={(e) => setProfBirthday(e.target.value)}
          className="bg-white shadow-sm"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-slate-700">
          {t('profile.document', 'Documento (CPF/Passaporte/ID)')}
        </Label>
        <Input
          required
          value={profDoc}
          onChange={(e) => setProfDoc(e.target.value)}
          className="bg-white shadow-sm"
          placeholder="Ex: 123.456.789-00"
        />
      </div>
      <Button type="submit" className="w-full mt-4 font-bold shadow-sm">
        {t('booking.save_and_continue', 'Salvar e Continuar')}
      </Button>
    </form>
  )
}
