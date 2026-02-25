import { useLanguage } from '@/stores/LanguageContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  const { user, updateUserPreferences } = useCouponStore()

  // Local state for settings form
  const [notifications, setNotifications] = useState(true)
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [pushAlerts, setPushAlerts] = useState(true)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [quietStart, setQuietStart] = useState('22:00')
  const [quietEnd, setQuietEnd] = useState('08:00')

  useEffect(() => {
    if (user?.preferences) {
      setNotifications(user.preferences.notifications ?? true)
      setEmailAlerts(user.preferences.emailAlerts ?? true)
      setPushAlerts(user.preferences.pushAlerts ?? true)
      setSelectedCategories(user.preferences.categories ?? [])
      setQuietStart(user.preferences.quietHoursStart ?? '22:00')
      setQuietEnd(user.preferences.quietHoursEnd ?? '08:00')
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

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="notifications">
            {t('profile.notifications')}
          </TabsTrigger>
          <TabsTrigger value="privacy">{t('settings.privacy')}</TabsTrigger>
          <TabsTrigger value="general">{t('settings.title')}</TabsTrigger>
        </TabsList>

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

        <TabsContent value="privacy" className="space-y-6">
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
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('settings.profile_visibility')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('settings.profile_visibility_desc')}
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
          <Button variant="destructive" className="w-full">
            {t('settings.delete_account')}
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
        </TabsContent>
      </Tabs>

      <AdSpace
        position="bottom"
        className="mt-8 rounded-lg border-none bg-transparent px-0"
      />
    </div>
  )
}
