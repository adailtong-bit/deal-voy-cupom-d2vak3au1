import { useLanguage } from '@/stores/LanguageContext'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { AdSpace } from '@/components/AdSpace'
import {
  Settings as SettingsIcon,
  Shield,
  Bell,
  Globe,
  Tag,
  MapPin,
  Crown,
  CheckCircle2,
} from 'lucide-react'
import { LanguageSelector } from '@/components/LanguageSelector'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useCouponStore } from '@/stores/CouponContext'
import { Checkbox } from '@/components/ui/checkbox'
import { CATEGORIES } from '@/lib/data'
import { Input } from '@/components/ui/input'
import { useState, useEffect } from 'react'

export default function Settings() {
  const { t } = useLanguage()
  const { user, updateUserPreferences, upgradeSubscription, platformSettings } =
    useCouponStore()

  // Local state for settings form
  const [notifications, setNotifications] = useState(true)
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [pushAlerts, setPushAlerts] = useState(true)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [quietStart, setQuietStart] = useState('22:00')
  const [quietEnd, setQuietEnd] = useState('08:00')
  const [travelMode, setTravelMode] = useState(false)

  useEffect(() => {
    if (user?.preferences) {
      setNotifications(user.preferences.notifications ?? true)
      setEmailAlerts(user.preferences.emailAlerts ?? true)
      setPushAlerts(user.preferences.pushAlerts ?? true)
      setSelectedCategories(user.preferences.categories ?? [])
      setQuietStart(user.preferences.quietHoursStart ?? '22:00')
      setQuietEnd(user.preferences.quietHoursEnd ?? '08:00')
      setTravelMode(user.preferences.travelMode ?? false)
    }
  }, [user])

  const handleSave = () => {
    updateUserPreferences({
      notifications,
      emailAlerts,
      pushAlerts,
      categories: selectedCategories,
      quietHoursStart: quietStart,
      quietHoursEnd: quietEnd,
      travelMode,
    })
  }

  const toggleCategory = (catId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(catId) ? prev.filter((c) => c !== catId) : [...prev, catId],
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <AdSpace
        position="top"
        className="mb-6 rounded-lg border-none bg-transparent px-0"
      />

      <h1 className="text-3xl font-bold flex items-center gap-2 mb-8">
        <SettingsIcon className="h-8 w-8 text-slate-700" />
        {t('settings.title')}
      </h1>

      <Tabs defaultValue="subscription" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 flex-wrap h-auto">
          <TabsTrigger value="subscription" className="py-2">
            Assinatura
          </TabsTrigger>
          <TabsTrigger value="notifications" className="py-2">
            {t('profile.notifications')}
          </TabsTrigger>
          <TabsTrigger value="travel" className="py-2">
            Viagem
          </TabsTrigger>
          <TabsTrigger value="general" className="py-2">
            Geral
          </TabsTrigger>
        </TabsList>

        <TabsContent value="subscription" className="space-y-6">
          <Card className="border-2 border-primary/20">
            <CardHeader className="text-center pb-2">
              <Crown className="w-12 h-12 mx-auto text-primary mb-2" />
              <CardTitle>
                Plano Atual:{' '}
                <span className="uppercase text-primary">
                  {user?.subscriptionTier || 'FREE'}
                </span>
              </CardTitle>
              <CardDescription>
                Faça upgrade para obter mais cashback e benefícios exclusivos.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  className={`border p-4 rounded-xl relative ${user?.subscriptionTier === 'premium' ? 'border-primary bg-primary/5' : ''}`}
                >
                  {user?.subscriptionTier === 'premium' && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle2 className="text-primary w-5 h-5" />
                    </div>
                  )}
                  <h3 className="font-bold text-lg mb-1">Premium</h3>
                  <p className="text-2xl font-extrabold mb-2">
                    ${platformSettings.subscriptionPricing.premium}
                    <span className="text-sm font-normal text-muted-foreground">
                      /mo
                    </span>
                  </p>
                  <ul className="text-sm space-y-2 mb-4 text-muted-foreground">
                    <li>• 3% - 10% Cashback</li>
                    <li>• Ofertas exclusivas (Voos/Hotéis)</li>
                    <li>• Saques prioritários</li>
                  </ul>
                  <Button
                    variant={
                      user?.subscriptionTier === 'premium'
                        ? 'secondary'
                        : 'default'
                    }
                    className="w-full"
                    disabled={user?.subscriptionTier === 'premium'}
                    onClick={() => upgradeSubscription('premium')}
                  >
                    {user?.subscriptionTier === 'premium'
                      ? 'Plano Atual'
                      : 'Assinar Premium'}
                  </Button>
                </div>
                <div
                  className={`border p-4 rounded-xl relative ${user?.subscriptionTier === 'vip' ? 'border-purple-500 bg-purple-50' : 'border-purple-200'}`}
                >
                  {user?.subscriptionTier === 'vip' && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle2 className="text-purple-500 w-5 h-5" />
                    </div>
                  )}
                  <h3 className="font-bold text-lg mb-1 text-purple-700">
                    VIP Traveler
                  </h3>
                  <p className="text-2xl font-extrabold mb-2">
                    ${platformSettings.subscriptionPricing.vip}
                    <span className="text-sm font-normal text-muted-foreground">
                      /mo
                    </span>
                  </p>
                  <ul className="text-sm space-y-2 mb-4 text-muted-foreground">
                    <li>• Cashback Máximo</li>
                    <li>• Acesso antecipado a promos</li>
                    <li>• Concierge 24/7</li>
                  </ul>
                  <Button
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    disabled={user?.subscriptionTier === 'vip'}
                    onClick={() => upgradeSubscription('vip')}
                  >
                    {user?.subscriptionTier === 'vip'
                      ? 'Plano Atual'
                      : 'Assinar VIP'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="travel" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-500" /> Modo Viagem
              </CardTitle>
              <CardDescription>
                Ative o Modo Viagem para priorizar cupons e restaurantes
                baseados na sua localização atual de viagem, ocultando ofertas
                da sua cidade natal.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50/50">
                <div className="space-y-0.5">
                  <Label className="text-base font-bold text-blue-900">
                    Ativar Modo Viagem
                  </Label>
                  <p className="text-sm text-blue-700">
                    Geolocalização dinâmica ativada.
                  </p>
                </div>
                <Switch
                  checked={travelMode}
                  onCheckedChange={(v) => {
                    setTravelMode(v)
                    handleSave()
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="h-5 w-5 text-orange-500" />{' '}
                {t('settings.notifications')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <Label className="text-base">
                  {t('settings.enable_notifications')}
                </Label>
                <Switch
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <Label>{t('settings.email_alerts')}</Label>
                  <Switch
                    checked={emailAlerts}
                    onCheckedChange={setEmailAlerts}
                    disabled={!notifications}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>{t('settings.push_notifications')}</Label>
                  <Switch
                    checked={pushAlerts}
                    onCheckedChange={setPushAlerts}
                    disabled={!notifications}
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <Label className="text-base font-semibold block mb-2">
                  {t('settings.quiet_hours')}
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('settings.start')}</Label>
                    <Input
                      type="time"
                      value={quietStart}
                      onChange={(e) => setQuietStart(e.target.value)}
                      disabled={!notifications}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('settings.end')}</Label>
                    <Input
                      type="time"
                      value={quietEnd}
                      onChange={(e) => setQuietEnd(e.target.value)}
                      disabled={!notifications}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <Label className="text-base font-semibold flex items-center gap-2 mb-2">
                  <Tag className="h-4 w-4" /> {t('settings.categories')}
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
                    <div key={cat.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`cat-${cat.id}`}
                        checked={selectedCategories.includes(cat.id)}
                        onCheckedChange={() => toggleCategory(cat.id)}
                        disabled={!notifications}
                      />
                      <label
                        htmlFor={`cat-${cat.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {t(cat.translationKey)}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          <Button onClick={handleSave} className="w-full font-bold">
            {t('common.save')}
          </Button>
        </TabsContent>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-500" />{' '}
                {t('settings.language')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>{t('settings.app_language')}</Label>
                <LanguageSelector />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-500" />{' '}
                {t('settings.privacy')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('settings.2fa')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('settings.2fa_desc')}
                  </p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('settings.location')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('settings.location_desc')}
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
          <Button variant="destructive" className="w-full">
            {t('settings.delete_account')}
          </Button>
        </TabsContent>
      </Tabs>

      <AdSpace
        position="bottom"
        className="mt-8 rounded-lg border-none bg-transparent px-0"
      />
    </div>
  )
}
