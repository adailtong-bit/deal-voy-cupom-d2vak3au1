import { useLanguage } from '@/stores/LanguageContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { AdSpace } from '@/components/AdSpace'
import { Settings as SettingsIcon, Shield, Bell, Globe } from 'lucide-react'
import { LanguageSelector } from '@/components/LanguageSelector'

export default function Settings() {
  const { t } = useLanguage()

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

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-500" /> Language & Region
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>App Language</Label>
              <LanguageSelector />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-500" /> Privacy & Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Add extra security
                </p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Location Tracking</Label>
                <p className="text-sm text-muted-foreground">
                  Allow app to use location
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Profile Visibility</Label>
                <p className="text-sm text-muted-foreground">
                  Make profile public
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="h-5 w-5 text-orange-500" /> Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <Label>Newsletter</Label>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label>Marketing Emails</Label>
              <Switch />
            </div>
          </CardContent>
        </Card>

        <Button variant="destructive" className="w-full">
          Delete Account
        </Button>
      </div>

      <AdSpace
        position="bottom"
        className="mt-8 rounded-lg border-none bg-transparent px-0"
      />
    </div>
  )
}
