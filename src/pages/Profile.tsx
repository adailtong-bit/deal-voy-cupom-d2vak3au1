import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Settings,
  LogOut,
  User as UserIcon,
  Bell,
  CreditCard,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react'
import { useCouponStore } from '@/stores/CouponContext'
import { useLanguage } from '@/stores/LanguageContext'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PhoneInput } from '@/components/PhoneInput'
import { AdSpace } from '@/components/AdSpace'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function Profile() {
  const { user, updateUserProfile, logout } = useCouponStore()
  const { t } = useLanguage()
  const navigate = useNavigate()

  // Onboarding States
  const [onboardingData, setOnboardingData] = useState({
    birthday: user?.birthday || '',
    country: user?.country || '',
    city: user?.city || '',
    phone: user?.phone || '',
  })

  // Check if profile is complete (Onboarding Logic)
  const isProfileComplete =
    user?.birthday && user?.country && user?.city && user?.phone

  const handleOnboardingSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateUserProfile(onboardingData)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (!user) {
    navigate('/login')
    return null
  }

  // Onboarding View
  if (!isProfileComplete) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-md min-h-screen flex flex-col justify-center">
        <AdSpace
          position="top"
          className="mb-8 rounded-lg border-none bg-transparent px-0"
        />
        <Card className="shadow-lg border-t-4 border-t-primary">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-primary">
              {t('profile.onboarding_title')}
            </CardTitle>
            <p className="text-center text-muted-foreground text-sm">
              {t('profile.onboarding_desc')}
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleOnboardingSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>{t('profile.birthday')}</Label>
                <Input
                  type="date"
                  required
                  value={onboardingData.birthday}
                  onChange={(e) =>
                    setOnboardingData({
                      ...onboardingData,
                      birthday: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{t('profile.country')}</Label>
                <Select
                  value={onboardingData.country}
                  onValueChange={(val) =>
                    setOnboardingData({ ...onboardingData, country: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Brasil">Brasil</SelectItem>
                    <SelectItem value="USA">USA</SelectItem>
                    <SelectItem value="Portugal">Portugal</SelectItem>
                    <SelectItem value="France">France</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('profile.city')}</Label>
                <Input
                  required
                  placeholder="Ex: São Paulo"
                  value={onboardingData.city}
                  onChange={(e) =>
                    setOnboardingData({
                      ...onboardingData,
                      city: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{t('profile.phone')}</Label>
                <PhoneInput
                  value={onboardingData.phone}
                  onChange={(val) =>
                    setOnboardingData({ ...onboardingData, phone: val })
                  }
                  defaultCountry={
                    onboardingData.country === 'Brasil'
                      ? 'BR'
                      : onboardingData.country === 'USA'
                        ? 'US'
                        : undefined
                  }
                />
              </div>
              <Button type="submit" className="w-full font-bold">
                {t('profile.save')}
              </Button>
            </form>
          </CardContent>
        </Card>
        <AdSpace
          position="bottom"
          className="mt-8 rounded-lg border-none bg-transparent px-0"
        />
      </div>
    )
  }

  // Main Profile View
  return (
    <div className="container mx-auto px-4 py-8 max-w-lg">
      <AdSpace
        position="top"
        className="mb-6 rounded-lg border-none bg-transparent px-0"
      />

      <div className="flex flex-col items-center mb-8">
        <div className="relative">
          <Avatar className="h-24 w-24 mb-4 border-4 border-background shadow-xl">
            <AvatarImage
              src={
                user.avatar ||
                'https://img.usecurling.com/ppl/thumbnail?gender=male'
              }
            />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div className="absolute bottom-4 right-0 bg-primary text-white p-1 rounded-full border-2 border-white">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
        <h1 className="text-2xl font-bold">{user.name}</h1>
        <p className="text-muted-foreground">{user.email}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {user.city}, {user.country}
        </p>
      </div>

      <div className="space-y-3">
        <Link to="/notifications">
          <Button
            variant="outline"
            className="w-full justify-between h-14 bg-white hover:bg-slate-50 border-slate-200"
          >
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-2 rounded-full">
                <Bell className="h-5 w-5 text-orange-600" />
              </div>
              <span className="font-semibold">
                {t('profile.notifications')}
              </span>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </Button>
        </Link>

        <Link to="/payment-methods">
          <Button
            variant="outline"
            className="w-full justify-between h-14 bg-white hover:bg-slate-50 border-slate-200"
          >
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <CreditCard className="h-5 w-5 text-blue-600" />
              </div>
              <span className="font-semibold">
                {t('profile.payment_methods')}
              </span>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </Button>
        </Link>

        <Link to="/settings">
          <Button
            variant="outline"
            className="w-full justify-between h-14 bg-white hover:bg-slate-50 border-slate-200"
          >
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-full">
                <Settings className="h-5 w-5 text-green-600" />
              </div>
              <span className="font-semibold">{t('profile.settings')}</span>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </Button>
        </Link>

        <Separator className="my-4" />

        <Button
          variant="ghost"
          className="w-full justify-start h-12 gap-3 text-red-500 hover:text-red-600 hover:bg-red-50"
          size="lg"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" /> Logout
        </Button>
      </div>

      <AdSpace
        position="bottom"
        className="mt-8 rounded-lg border-none bg-transparent px-0"
      />
    </div>
  )
}
