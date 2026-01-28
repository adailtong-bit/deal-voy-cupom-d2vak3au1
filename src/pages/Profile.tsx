import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Settings,
  LogOut,
  Bell,
  CreditCard,
  ChevronRight,
  ShieldCheck,
  Edit2,
  MapPin,
  Wallet,
  Plane,
  Heart,
  History,
  Coins,
  ThumbsUp,
  Clock,
  Car,
} from 'lucide-react'
import { useCouponStore } from '@/stores/CouponContext'
import { useLanguage } from '@/stores/LanguageContext'
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PhoneInput } from '@/components/PhoneInput'
import { AddressForm } from '@/components/AddressForm'
import { AdSpace } from '@/components/AdSpace'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { COUNTRIES } from '@/lib/locationData'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'

export default function Profile() {
  const { user, updateUserProfile, logout } = useCouponStore()
  const { t, formatDate } = useLanguage()
  const navigate = useNavigate()

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    birthday: '',
    country: '',
    state: '',
    city: '',
    phone: '',
    zip: '',
    address: '',
  })

  useEffect(() => {
    if (user) {
      setFormData({
        birthday: user.birthday || '',
        country: user.country || '',
        state: user.state || '',
        city: user.city || '',
        phone: user.phone || '',
        zip: '',
        address: '',
      })
    }
  }, [user])

  const isProfileComplete =
    user?.birthday && user?.country && user?.state && user?.city && user?.phone

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateUserProfile(formData)
    setIsEditing(false)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (!user) {
    navigate('/login')
    return null
  }

  const LocationFields = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>{t('hub.date')}</Label>
        <Input
          type="date"
          required
          value={formData.birthday}
          onChange={(e) =>
            setFormData({
              ...formData,
              birthday: e.target.value,
            })
          }
        />
      </div>

      <div className="space-y-2">
        <Label>{t('profile.address')}</Label>
        <Select
          value={formData.country}
          onValueChange={(val) =>
            setFormData({ ...formData, country: val, state: '', city: '' })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Country" />
          </SelectTrigger>
          <SelectContent>
            {COUNTRIES.map((country) => (
              <SelectItem key={country} value={country}>
                {country}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <AddressForm
        country={formData.country}
        state={formData.state}
        city={formData.city}
        onChange={(data) => setFormData({ ...formData, ...data })}
      />

      <div className="space-y-2">
        <Label>{t('phone.label')}</Label>
        <PhoneInput
          value={formData.phone}
          onChange={(val) => setFormData({ ...formData, phone: val })}
          countryCode={formData.country}
        />
      </div>
    </div>
  )

  const ScenarioCard = ({ title, icon: Icon, path, color }: any) => (
    <Link to={path}>
      <Card className="hover:shadow-md transition-shadow h-full">
        <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
          <div className={`p-3 rounded-full bg-slate-50 ${color}`}>
            <Icon className="h-6 w-6" />
          </div>
          <span className="text-xs font-semibold">{title}</span>
        </CardContent>
      </Card>
    </Link>
  )

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
              {t('profile.complete_title')}
            </CardTitle>
            <p className="text-center text-muted-foreground text-sm">
              {t('profile.complete_desc')}
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <LocationFields />
              <Button type="submit" className="w-full font-bold">
                {t('profile.save')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

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
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div className="absolute bottom-4 right-0 bg-primary text-white p-1 rounded-full border-2 border-white">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-full inline-block">
            {user.email}
          </p>
          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mt-1">
            <MapPin className="w-3 h-3" />
            <p>
              {user.city}, {user.state}, {user.country}
            </p>
          </div>
          {user.birthday && (
            <p className="text-xs text-muted-foreground">
              {formatDate(user.birthday)}
            </p>
          )}
        </div>

        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogTrigger asChild>
            <Button variant="link" className="mt-2 text-primary h-auto p-0">
              <Edit2 className="w-3 h-3 mr-1" /> {t('profile.edit')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('profile.edit')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <LocationFields />
              <DialogFooter>
                <Button type="submit">{t('common.save')}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <ScenarioCard
          title={t('user.wallet')}
          icon={Wallet}
          path="/saved"
          color="text-emerald-500"
        />
        <ScenarioCard
          title={t('user.saved_itineraries')}
          icon={Plane}
          path="/travel-planner"
          color="text-blue-500"
        />
        <ScenarioCard
          title={t('user.favorites')}
          icon={Heart}
          path="/saved"
          color="text-red-500"
        />
        <ScenarioCard
          title={t('user.redemption_history')}
          icon={History}
          path="/rewards"
          color="text-orange-500"
        />
        <ScenarioCard
          title={t('user.nearby')}
          icon={MapPin}
          path="/explore"
          color="text-purple-500"
        />
        <ScenarioCard
          title={t('profile.settings')}
          icon={Settings}
          path="/settings"
        />
        <ScenarioCard
          title={t('user.points')}
          icon={Coins}
          path="/rewards"
          color="text-yellow-500"
        />
        <ScenarioCard
          title={t('user.recommended')}
          icon={ThumbsUp}
          path="/"
          color="text-indigo-500"
        />
        <ScenarioCard
          title={t('user.expiring')}
          icon={Clock}
          path="/saved"
          color="text-rose-500"
        />
        <ScenarioCard
          title={t('user.car_rentals')}
          icon={Car}
          path="/agencies"
          color="text-cyan-500"
        />
      </div>

      <div className="space-y-3">
        <Link to="/notifications">
          <Button
            variant="outline"
            className="w-full justify-between h-14 bg-white hover:bg-slate-50 border-slate-200 group"
          >
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-2 rounded-full group-hover:bg-orange-200 transition-colors">
                <Bell className="h-5 w-5 text-orange-600" />
              </div>
              <span className="font-semibold text-slate-700">
                {t('profile.notifications')}
              </span>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </Button>
        </Link>

        <Link to="/payment-methods">
          <Button
            variant="outline"
            className="w-full justify-between h-14 bg-white hover:bg-slate-50 border-slate-200 group"
          >
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-full group-hover:bg-blue-200 transition-colors">
                <CreditCard className="h-5 w-5 text-blue-600" />
              </div>
              <span className="font-semibold text-slate-700">
                {t('profile.payment_methods')}
              </span>
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
          <LogOut className="h-5 w-5" /> {t('profile.logout')}
        </Button>
      </div>
    </div>
  )
}
