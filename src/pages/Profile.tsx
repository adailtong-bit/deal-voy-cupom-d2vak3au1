import { useState } from 'react'
import { useCouponStore } from '@/stores/CouponContext'
import { useLanguage } from '@/stores/LanguageContext'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ProfileAvatar } from '@/components/ProfileAvatar'
import { User, Mail, Phone } from 'lucide-react'

export default function Profile() {
  const { user, updateUserProfile } = useCouponStore()
  const { t } = useLanguage()

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSave = () => {
    updateUserProfile(formData)
  }

  if (!user) return null

  return (
    <div className="container py-8 max-w-4xl mx-auto animate-fade-in-up mb-16 md:mb-0">
      <h1 className="text-3xl font-bold mb-6 text-slate-800">
        {t('profile.title', 'Meu Perfil')}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <ProfileAvatar />
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                {t('profile.personalInfo', 'Informações Pessoais')}
              </CardTitle>
              <CardDescription>
                {t(
                  'profile.desc',
                  'Atualize seus dados para manter sua conta segura.',
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />{' '}
                  {t('profile.name', 'Nome')}
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />{' '}
                  {t('profile.email', 'E-mail')}
                </Label>
                <Input
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled
                  className="bg-slate-50 text-slate-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />{' '}
                  {t('profile.phone', 'Telefone')}
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              <Button onClick={handleSave} className="w-full mt-6">
                {t('profile.save', 'Salvar Alterações')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
