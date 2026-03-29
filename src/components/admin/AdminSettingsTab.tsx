import { useState } from 'react'
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
import { toast } from 'sonner'
import { Save } from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'

export function AdminSettingsTab() {
  const { t } = useLanguage()
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('system_settings')
    return saved
      ? JSON.parse(saved)
      : {
          geoRadius: 50,
          maxPushPerDay: 3,
          sessionTimeout: 30,
          maintenanceMode: false,
        }
  })

  const handleSave = () => {
    localStorage.setItem('system_settings', JSON.stringify(settings))
    toast.success(
      t(
        'admin.settings_tab.save_success',
        'System parameters updated successfully.',
      ),
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {t('admin.settings_tab.title', 'System Settings')}
        </h2>
        <p className="text-muted-foreground">
          {t(
            'admin.settings_tab.desc',
            'Configure dynamic parameters and system thresholds globally.',
          )}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              {t('admin.settings_tab.geo_title', 'Geolocation Parameters')}
            </CardTitle>
            <CardDescription>
              {t(
                'admin.settings_tab.geo_desc',
                'Configure how proximity and distances are handled.',
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>
                {t(
                  'admin.settings_tab.geo_radius',
                  'Default Search Radius (km)',
                )}
              </Label>
              <Input
                type="number"
                value={settings.geoRadius}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    geoRadius: Number(e.target.value),
                  })
                }
              />
              <p className="text-xs text-muted-foreground">
                {t(
                  'admin.settings_tab.geo_radius_desc',
                  'Used as the default limit when exploring offers.',
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {t('admin.settings_tab.notif_title', 'Notification Thresholds')}
            </CardTitle>
            <CardDescription>
              {t(
                'admin.settings_tab.notif_desc',
                'Limits and triggers for push notifications.',
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>
                {t(
                  'admin.settings_tab.max_push',
                  'Max Push Notifications per User/Day',
                )}
              </Label>
              <Input
                type="number"
                value={settings.maxPushPerDay}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    maxPushPerDay: Number(e.target.value),
                  })
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {t('admin.settings_tab.sec_title', 'Security & Sessions')}
            </CardTitle>
            <CardDescription>
              {t(
                'admin.settings_tab.sec_desc',
                'Configure user session parameters.',
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>
                {t('admin.settings_tab.timeout', 'Session Timeout (minutes)')}
              </Label>
              <Input
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    sessionTimeout: Number(e.target.value),
                  })
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg">
          <Save className="w-4 h-4 mr-2" />{' '}
          {t('admin.settings_tab.save_changes', 'Save Changes')}
        </Button>
      </div>
    </div>
  )
}
