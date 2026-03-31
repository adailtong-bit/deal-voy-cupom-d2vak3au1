import { useState, useMemo, useEffect } from 'react'
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
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { COUNTRIES, LOCATION_DATA } from '@/lib/locationData'
import { User } from '@/lib/types'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { updateUser } from '@/lib/api'

function FieldDisplay({ value }: { value: string | undefined }) {
  return (
    <div className="flex min-h-10 w-full items-center rounded-md border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm text-slate-700">
      {value || <span className="text-slate-400 italic">Not provided</span>}
    </div>
  )
}

export default function Profile() {
  const { user, updateUserProfile, platformSettings } = useCouponStore()
  const { t } = useLanguage()
  const { toast } = useToast()

  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    birthday: user?.birthday || '',
    gender: user?.gender || '',
    documentNumber: user?.documentNumber || '',
    country: user?.country || '',
    state: user?.state || '',
    city: user?.city || '',
    zipCode: user?.zipCode || '',
    categories: user?.preferences?.categories || [],
    companyName: user?.companyName || '',
    businessEmail: user?.businessEmail || '',
    businessPhone: user?.businessPhone || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    if (user && !isEditing) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        birthday: user.birthday || '',
        gender: user.gender || '',
        documentNumber: user.documentNumber || '',
        country: user.country || '',
        state: user.state || '',
        city: user.city || '',
        zipCode: user.zipCode || '',
        categories: user.preferences?.categories || [],
        companyName: user.companyName || '',
        businessEmail: user.businessEmail || '',
        businessPhone: user.businessPhone || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    }
  }, [user, isEditing])

  const availableStates = useMemo(() => {
    return formData.country
      ? Object.keys(LOCATION_DATA[formData.country]?.states || {})
      : []
  }, [formData.country])

  const availableCities = useMemo(() => {
    return formData.country && formData.state
      ? LOCATION_DATA[formData.country]?.states[formData.state] || []
      : []
  }, [formData.country, formData.state])

  const progress = useMemo(() => {
    let score = 0
    if (formData.name) score++
    if (formData.phone) score++
    if (formData.birthday) score++
    if (formData.gender) score++
    if (formData.documentNumber) score++
    if (formData.country) score++
    if (formData.state) score++
    if (formData.city) score++
    if (formData.zipCode) score++
    if (formData.categories.length > 0) score++
    return Math.round((score / 10) * 100)
  }, [formData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value
    if (formData.country === 'Brasil') {
      val = val.replace(/\D/g, '')
      if (val.length > 8) val = val.slice(0, 8)
      val = val.replace(/^(\d{5})(\d{0,3})/, '$1-$2')
    } else if (formData.country === 'USA') {
      val = val.replace(/\D/g, '')
      if (val.length > 5) val = val.slice(0, 5)
    }
    setFormData({ ...formData, zipCode: val })
  }

  const handleCategoryChange = (id: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      categories: checked
        ? [...prev.categories, id]
        : prev.categories.filter((c) => c !== id),
    }))
  }

  const hasChanges = useMemo(() => {
    if (!user) return false
    return (
      formData.name !== (user.name || '') ||
      formData.email !== (user.email || '') ||
      formData.phone !== (user.phone || '') ||
      formData.birthday !== (user.birthday || '') ||
      formData.gender !== (user.gender || '') ||
      formData.documentNumber !== (user.documentNumber || '') ||
      formData.country !== (user.country || '') ||
      formData.state !== (user.state || '') ||
      formData.city !== (user.city || '') ||
      formData.zipCode !== (user.zipCode || '') ||
      formData.companyName !== (user.companyName || '') ||
      formData.businessEmail !== (user.businessEmail || '') ||
      formData.businessPhone !== (user.businessPhone || '') ||
      JSON.stringify(formData.categories) !==
        JSON.stringify(user.preferences?.categories || []) ||
      !!formData.newPassword ||
      !!formData.currentPassword
    )
  }, [formData, user])

  const isSaveDisabled =
    isSaving ||
    !hasChanges ||
    (!!formData.newPassword &&
      (formData.newPassword !== formData.confirmPassword ||
        !formData.currentPassword))

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        birthday: user.birthday || '',
        gender: user.gender || '',
        documentNumber: user.documentNumber || '',
        country: user.country || '',
        state: user.state || '',
        city: user.city || '',
        zipCode: user.zipCode || '',
        categories: user.preferences?.categories || [],
        companyName: user.companyName || '',
        businessEmail: user.businessEmail || '',
        businessPhone: user.businessPhone || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    }
    setIsEditing(false)
  }

  const handleSave = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (formData.email && !emailRegex.test(formData.email)) {
      toast({
        title: t('common.error', 'Error'),
        description: t(
          'profile.invalid_email',
          'Please enter a valid email address.',
        ),
        variant: 'destructive',
      })
      return
    }

    if (
      user?.role === 'super_admin' ||
      user?.role === ('admin' as any) ||
      user?.role === 'franchisee' ||
      user?.role === 'shopkeeper'
    ) {
      if (!formData.companyName || !formData.businessEmail) {
        toast({
          title: t('common.error', 'Error'),
          description: t(
            'profile.missing_business_info',
            'Company Name and Business Email are required for admins.',
          ),
          variant: 'destructive',
        })
        return
      }
      if (!emailRegex.test(formData.businessEmail)) {
        toast({
          title: t('common.error', 'Error'),
          description: t(
            'profile.invalid_business_email',
            'Please enter a valid business email address.',
          ),
          variant: 'destructive',
        })
        return
      }
    }

    if (formData.newPassword) {
      if (formData.newPassword.length < 8) {
        toast({
          title: t('common.error', 'Erro'),
          description: t(
            'profile.password_too_short',
            'A nova senha deve ter no mínimo 8 caracteres.',
          ),
          variant: 'destructive',
        })
        return
      }
      if (formData.newPassword !== formData.confirmPassword) {
        toast({
          title: t('common.error', 'Erro'),
          description: t(
            'profile.password_mismatch',
            'A nova senha e a confirmação não coincidem.',
          ),
          variant: 'destructive',
        })
        return
      }
      if (!formData.currentPassword) {
        toast({
          title: t('common.error', 'Erro'),
          description: t(
            'profile.current_password_required',
            'Por favor, insira sua senha atual para definir uma nova.',
          ),
          variant: 'destructive',
        })
        return
      }
    }
    setIsSaving(true)
    try {
      const updateData: any = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        birthday: formData.birthday,
        gender: formData.gender,
        documentNumber: formData.documentNumber,
        country: formData.country,
        state: formData.state,
        city: formData.city,
        zipCode: formData.zipCode,
        companyName: formData.companyName,
        businessEmail: formData.businessEmail,
        businessPhone: formData.businessPhone,
        preferences: {
          ...user?.preferences,
          categories: formData.categories,
        },
      }

      if (formData.newPassword) {
        updateData.oldPassword = formData.currentPassword
        updateData.password = formData.newPassword
        updateData.passwordConfirm = formData.confirmPassword
      }

      await updateUser(user.id, updateData)

      updateUserProfile({
        ...updateData,
        ...(formData.newPassword ? { password: formData.newPassword } : {}),
      } as any)

      toast({
        title: t('profile.successTitle', 'Sucesso!'),
        description: t('profile.successDesc', 'Alterações salvas com sucesso!'),
      })

      if (formData.newPassword) {
        toast({
          title: t('profile.passwordUpdated', 'Senha Atualizada'),
          description: t(
            'profile.passwordUpdatedDesc',
            'Sua senha foi alterada com sucesso.',
          ),
        })
      }

      setFormData((prev) => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }))

      setIsEditing(false)
    } catch (error: any) {
      toast({
        title: t('common.error', 'Erro'),
        description:
          error.message ||
          t(
            'profile.errorDesc',
            'Ocorreu um erro ao salvar as alterações. Por favor, tente novamente.',
          ),
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (!user) return null

  return (
    <div className="container py-8 max-w-4xl mx-auto animate-fade-in-up mb-16 md:mb-0 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            {t('profile.title', 'My Profile')}
          </h1>
          <p className="text-slate-500 mt-1">
            {t(
              'profile.subtitle',
              'Manage your account settings and preferences.',
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} size="lg">
              {t('profile.edit', 'Edit Profile')}
            </Button>
          ) : (
            <>
              <Button
                onClick={handleCancel}
                size="lg"
                variant="outline"
                disabled={isSaving}
              >
                {t('common.cancel', 'Cancel')}
              </Button>
              <Button onClick={handleSave} size="lg" disabled={isSaveDisabled}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSaving
                  ? t('common.saving', 'Salvando...')
                  : t('profile.save', 'Salvar')}
              </Button>
            </>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            <ProfileAvatar />
            <div className="flex-1 w-full space-y-4 pt-2">
              <div className="flex justify-between items-center text-sm mb-1">
                <span className="font-medium text-slate-700">
                  {t('profile.completion', 'Profile Completion')}
                </span>
                <span className="font-bold text-primary">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-slate-500">
                {t(
                  'profile.complete_prompt',
                  'Complete your profile to receive more relevant offers based on your region and interests. Information like Date of Birth and ID are mandatory for bookings.',
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full h-auto gap-2 p-1 bg-slate-100/50">
          <TabsTrigger
            value="personal"
            className="py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            {t('profile.personal_tab', 'Personal Info')}
          </TabsTrigger>
          <TabsTrigger
            value="location"
            className="py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            {t('profile.location_tab', 'Location')}
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            {t('profile.security_tab', 'Security')}
          </TabsTrigger>
          <TabsTrigger
            value="business"
            className="py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm disabled:opacity-50"
            disabled={
              user?.role !== 'super_admin' &&
              user?.role !== ('admin' as any) &&
              user?.role !== 'franchisee' &&
              user?.role !== 'shopkeeper'
            }
          >
            {t('profile.business_tab', 'Business Identity')}
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="personal"
          className="space-y-6 animate-in fade-in-50 duration-500"
        >
          <Card>
            <CardHeader>
              <CardTitle>
                {t('profile.personal', 'Personal Information')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('profile.name', 'Full Name')}</Label>
                  {isEditing ? (
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your full name"
                    />
                  ) : (
                    <FieldDisplay value={formData.name} />
                  )}
                </div>
                <div className="space-y-2">
                  <Label>{t('profile.phone', 'Phone Number')}</Label>
                  {isEditing ? (
                    <Input
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+1 555 123-4567"
                    />
                  ) : (
                    <FieldDisplay value={formData.phone} />
                  )}
                </div>
                <div className="space-y-2">
                  <Label>
                    {t('profile.document', 'Document (ID / Passport)')}
                  </Label>
                  {isEditing ? (
                    <Input
                      name="documentNumber"
                      value={formData.documentNumber}
                      onChange={handleChange}
                      placeholder="e.g.: 123.456.789-00"
                    />
                  ) : (
                    <FieldDisplay value={formData.documentNumber} />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('profile.demographics', 'Demographics')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('profile.birthday', 'Date of Birth')}</Label>
                  {isEditing ? (
                    <Input
                      type="date"
                      name="birthday"
                      value={formData.birthday}
                      onChange={handleChange}
                    />
                  ) : (
                    <FieldDisplay value={formData.birthday} />
                  )}
                </div>
                <div className="space-y-2">
                  <Label>{t('profile.gender', 'Gender')}</Label>
                  {isEditing ? (
                    <Select
                      value={formData.gender}
                      onValueChange={(v) =>
                        setFormData({ ...formData, gender: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t('common.select', 'Select...')}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">
                          {t('gender.male', 'Male')}
                        </SelectItem>
                        <SelectItem value="female">
                          {t('gender.female', 'Female')}
                        </SelectItem>
                        <SelectItem value="non-binary">
                          {t('gender.nb', 'Non-binary')}
                        </SelectItem>
                        <SelectItem value="other">
                          {t('gender.other', 'Other')}
                        </SelectItem>
                        <SelectItem value="prefer-not-to-say">
                          {t('gender.none', 'Prefer not to say')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <FieldDisplay
                      value={
                        formData.gender === 'male'
                          ? t('gender.male', 'Male')
                          : formData.gender === 'female'
                            ? t('gender.female', 'Female')
                            : formData.gender === 'non-binary'
                              ? t('gender.nb', 'Non-binary')
                              : formData.gender === 'other'
                                ? t('gender.other', 'Other')
                                : formData.gender === 'prefer-not-to-say'
                                  ? t('gender.none', 'Prefer not to say')
                                  : formData.gender
                      }
                    />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('profile.interests', 'Interests')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(platformSettings.availableInterests || []).map((cat) => (
                  <div
                    key={cat.id}
                    className="flex flex-row items-center space-x-3 rounded-md border p-3 bg-card hover:bg-slate-50 transition-colors"
                  >
                    <Checkbox
                      id={`cat-${cat.id}`}
                      checked={formData.categories.includes(cat.id)}
                      onCheckedChange={(c) => handleCategoryChange(cat.id, !!c)}
                      disabled={!isEditing}
                    />
                    <div className="space-y-1 leading-none flex-1">
                      <Label
                        htmlFor={`cat-${cat.id}`}
                        className={`text-sm font-medium ${isEditing ? 'cursor-pointer' : 'opacity-70'}`}
                      >
                        {cat.label}
                      </Label>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent
          value="location"
          className="space-y-6 animate-in fade-in-50 duration-500"
        >
          <Card>
            <CardHeader>
              <CardTitle>
                {t('profile.location', 'Location Settings')}
              </CardTitle>
              <CardDescription>
                {t(
                  'profile.location_desc',
                  'Your location determines the currency and regional formats across the platform.',
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('profile.country', 'Country')}</Label>
                  {isEditing ? (
                    <Select
                      required
                      value={formData.country}
                      onValueChange={(v) =>
                        setFormData({
                          ...formData,
                          country: v,
                          state: '',
                          city: '',
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t('common.select', 'Select...')}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <FieldDisplay value={formData.country} />
                  )}
                </div>

                <div className="space-y-2">
                  <Label>{t('profile.state', 'State')}</Label>
                  {isEditing ? (
                    <Select
                      value={formData.state}
                      onValueChange={(v) =>
                        setFormData({ ...formData, state: v, city: '' })
                      }
                      disabled={
                        !formData.country || availableStates.length === 0
                      }
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t('common.select', 'Select...')}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {availableStates.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <FieldDisplay value={formData.state} />
                  )}
                </div>

                <div className="space-y-2">
                  <Label>{t('profile.city', 'City')}</Label>
                  {isEditing ? (
                    <Select
                      value={formData.city}
                      onValueChange={(v) =>
                        setFormData({ ...formData, city: v })
                      }
                      disabled={!formData.state || availableCities.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t('common.select', 'Select...')}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCities.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <FieldDisplay value={formData.city} />
                  )}
                </div>

                <div className="space-y-2">
                  <Label>{t('profile.zip', 'Zip / Postal Code')}</Label>
                  {isEditing ? (
                    <Input
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleZipChange}
                      placeholder="e.g.: 10001"
                    />
                  ) : (
                    <FieldDisplay value={formData.zipCode} />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent
          value="security"
          className="space-y-6 animate-in fade-in-50 duration-500"
        >
          <Card>
            <CardHeader>
              <CardTitle>
                {t('profile.security', 'Security & Credentials')}
              </CardTitle>
              <CardDescription>
                {t(
                  'profile.security_desc',
                  'Manage your login credentials and security preferences.',
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-slate-800 border-b pb-2">
                  Login Email
                </h3>
                <div className="space-y-2 max-w-md">
                  <Label>{t('profile.email', 'Email Address')}</Label>
                  {isEditing ? (
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                    />
                  ) : (
                    <FieldDisplay value={formData.email} />
                  )}
                  <p className="text-xs text-slate-500">
                    {t(
                      'profile.email_note',
                      'This email is used to sign in to your account.',
                    )}
                  </p>
                </div>
              </div>

              {isEditing && (
                <div className="space-y-4 animate-in fade-in-50">
                  <h3 className="text-sm font-medium text-slate-800 border-b pb-2">
                    {t('profile.change_password', 'Alterar Senha')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                    <div className="space-y-2 md:col-span-2">
                      <Label>
                        {t('profile.current_password', 'Senha Atual')}
                      </Label>
                      <div className="relative">
                        <Input
                          type={showCurrentPassword ? 'text' : 'password'}
                          name="currentPassword"
                          value={formData.currentPassword}
                          onChange={handleChange}
                          placeholder="••••••••"
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowCurrentPassword(!showCurrentPassword)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                          title={
                            showCurrentPassword
                              ? t('profile.hide_password', 'Ocultar senha')
                              : t('profile.show_password', 'Mostrar senha')
                          }
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>{t('profile.new_password', 'Nova Senha')}</Label>
                      <div className="relative">
                        <Input
                          type={showNewPassword ? 'text' : 'password'}
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleChange}
                          placeholder="••••••••"
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                          title={
                            showNewPassword
                              ? t('profile.hide_password', 'Ocultar senha')
                              : t('profile.show_password', 'Mostrar senha')
                          }
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>
                        {t('profile.confirm_password', 'Confirmar Nova Senha')}
                      </Label>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          placeholder="••••••••"
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                          title={
                            showConfirmPassword
                              ? t('profile.hide_password', 'Ocultar senha')
                              : t('profile.show_password', 'Mostrar senha')
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {(user?.role === 'super_admin' ||
          user?.role === ('admin' as any) ||
          user?.role === 'franchisee' ||
          user?.role === 'shopkeeper') && (
          <TabsContent
            value="business"
            className="space-y-6 animate-in fade-in-50 duration-500"
          >
            <Card>
              <CardHeader>
                <CardTitle>
                  {t(
                    'profile.business_identity',
                    'Business Identity & Billing',
                  )}
                </CardTitle>
                <CardDescription>
                  {t(
                    'profile.business_desc',
                    'This information will be used as the Issuer Information when generating invoices and billing documents.',
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>
                      {t('profile.company_name', 'Company Name / Razão Social')}{' '}
                      <span className="text-red-500">*</span>
                    </Label>
                    {isEditing ? (
                      <Input
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        placeholder="e.g. Acme Corporation"
                        required
                      />
                    ) : (
                      <FieldDisplay value={formData.companyName} />
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>
                      {t('profile.business_email', 'Official Business Email')}{' '}
                      <span className="text-red-500">*</span>
                    </Label>
                    {isEditing ? (
                      <Input
                        type="email"
                        name="businessEmail"
                        value={formData.businessEmail}
                        onChange={handleChange}
                        placeholder="billing@acme.com"
                        required
                      />
                    ) : (
                      <FieldDisplay value={formData.businessEmail} />
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>
                      {t('profile.business_phone', 'Business Phone Number')}
                    </Label>
                    {isEditing ? (
                      <Input
                        name="businessPhone"
                        value={formData.businessPhone}
                        onChange={handleChange}
                        placeholder="+1 800 555-0199"
                      />
                    ) : (
                      <FieldDisplay value={formData.businessPhone} />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
