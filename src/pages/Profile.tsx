import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Settings,
  LogOut,
  Bell,
  CreditCard,
  ChevronRight,
  Edit2,
  MapPin,
  Wallet,
  Plane,
  History,
  Coins,
  ThumbsUp,
  Clock,
  Car,
  Gift,
} from 'lucide-react'
import { useCouponStore } from '@/stores/CouponContext'
import { useLanguage } from '@/stores/LanguageContext'
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AdSpace } from '@/components/AdSpace'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { ProfileAvatar } from '@/components/ProfileAvatar'
import { ProfileEditForm } from '@/components/ProfileEditForm'

export default function Profile() {
  const { user, updateUserProfile, logout } = useCouponStore()
  const { t, formatDate } = useLanguage()
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (!user) {
      navigate('/login')
    }
  }, [user, navigate])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (!user) return null

  const isProfileComplete =
    user?.birthday && user?.country && user?.state && user?.city && user?.phone

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
            <ProfileEditForm user={user} onSave={updateUserProfile} />
          </CardContent>
        </Card>
      </div>
    )
  }

  const scenarios = [
    {
      title: t('user.wallet'),
      Icon: Wallet,
      path: '/saved',
      color: 'text-emerald-500',
    },
    {
      title: t('user.saved_itineraries'),
      Icon: Plane,
      path: '/travel-planner',
      color: 'text-blue-500',
    },
    {
      title: t('rewards.external'),
      Icon: Gift,
      path: '/rewards?tab=external',
      color: 'text-purple-600',
    },
    {
      title: t('user.redemption_history'),
      Icon: History,
      path: '/rewards',
      color: 'text-orange-500',
    },
    {
      title: t('user.nearby'),
      Icon: MapPin,
      path: '/explore',
      color: 'text-purple-500',
    },
    {
      title: t('profile.settings'),
      Icon: Settings,
      path: '/settings',
      color: '',
    },
    {
      title: t('user.points'),
      Icon: Coins,
      path: '/rewards',
      color: 'text-yellow-500',
    },
    {
      title: t('user.recommended'),
      Icon: ThumbsUp,
      path: '/',
      color: 'text-indigo-500',
    },
    {
      title: t('user.expiring'),
      Icon: Clock,
      path: '/saved',
      color: 'text-rose-500',
    },
    {
      title: t('user.car_rentals'),
      Icon: Car,
      path: '/agencies',
      color: 'text-cyan-500',
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8 max-w-lg">
      <AdSpace
        position="top"
        className="mb-6 rounded-lg border-none bg-transparent px-0"
      />

      <div className="flex flex-col items-center mb-8">
        <ProfileAvatar user={user} onUpdate={updateUserProfile} />

        <div className="text-center space-y-1 mt-2">
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-full inline-block">
            {user.email}
          </p>
          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mt-2">
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
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t('profile.edit')}</DialogTitle>
            </DialogHeader>
            <ProfileEditForm
              user={user}
              onSave={(data) => {
                updateUserProfile(data)
                setIsEditing(false)
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        {scenarios.map((s) => (
          <Link to={s.path} key={s.title}>
            <Card className="hover:shadow-md transition-shadow h-full">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
                <div className={cn('p-3 rounded-full bg-slate-50', s.color)}>
                  <s.Icon className="h-6 w-6" />
                </div>
                <span className="text-xs font-semibold">{s.title}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
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

        <Separator className="my-6" />

        <Button
          variant="ghost"
          className="w-full justify-start h-12 gap-3 text-red-500 hover:text-red-600 hover:bg-red-50 font-semibold"
          size="lg"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" /> {t('profile.logout')}
        </Button>
      </div>
    </div>
  )
}
