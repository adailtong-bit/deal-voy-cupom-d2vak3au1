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
import { Save, X, Plus } from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { REGIONS } from '@/lib/locationData'

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
          defaultRegion: 'Global',
          customRegions: [],
        }
  })

  const [newRegion, setNewRegion] = useState('')

  const handleSave = () => {
    localStorage.setItem('system_settings', JSON.stringify(settings))
    toast.success(
      t(
        'admin.settings_tab.save_success',
        'System parameters updated successfully.',
      ),
    )
  }

  const handleAddRegion = () => {
    if (!newRegion.trim()) return
    const current = settings.customRegions || []
    if (!current.includes(newRegion.trim())) {
      setSettings({
        ...settings,
        customRegions: [...current, newRegion.trim()],
      })
      setNewRegion('')
    }
  }

  const handleRemoveRegion = (regionToRemove: string) => {
    setSettings({
      ...settings,
      customRegions: (settings.customRegions || []).filter(
        (r: string) => r !== regionToRemove,
      ),
    })
  }

  const ALL_REGIONS = Array.from(
    new Set([...REGIONS, ...(settings.customRegions || [])]),
  )

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
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>
              {t(
                'admin.settings_tab.global_region_title',
                'Global Region & Standards',
              )}
            </CardTitle>
            <CardDescription>
              {t(
                'admin.settings_tab.global_region_desc',
                'Define the master default region for the entire platform. This applies standard formats (currency, phone, dates) globally.',
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2 md:w-1/2">
              <Label>
                {t(
                  'admin.settings_tab.default_region',
                  'Master Default Region',
                )}
              </Label>
              <Select
                value={settings.defaultRegion || 'Global'}
                onValueChange={(v) =>
                  setSettings({ ...settings, defaultRegion: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select master region" />
                </SelectTrigger>
                <SelectContent>
                  {ALL_REGIONS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-2">
                {t(
                  'admin.settings_tab.default_region_help',
                  'All new franchises and merchants will inherit this region format unless overridden individually in their specific settings.',
                )}
              </p>
            </div>

            <div className="pt-4 border-t">
              <Label className="mb-2 block">
                {t(
                  'admin.settings_tab.manage_regions',
                  'Manage Custom Regions / Countries',
                )}
              </Label>
              <div className="flex gap-2 max-w-md">
                <Input
                  value={newRegion}
                  onChange={(e) => setNewRegion(e.target.value)}
                  placeholder={t(
                    'admin.settings_tab.new_region_placeholder',
                    'e.g. Argentina',
                  )}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddRegion()}
                />
                <Button
                  onClick={handleAddRegion}
                  type="button"
                  variant="secondary"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  {t('common.add', 'Add')}
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {(settings.customRegions || []).map((r: string) => (
                  <div
                    key={r}
                    className="flex items-center gap-2 bg-slate-100 text-slate-800 px-3 py-1.5 rounded-full text-sm font-medium"
                  >
                    {r}
                    <button
                      type="button"
                      onClick={() => handleRemoveRegion(r)}
                      className="text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {(!settings.customRegions ||
                  settings.customRegions.length === 0) && (
                  <p className="text-sm text-muted-foreground italic">
                    {t(
                      'admin.settings_tab.no_custom_regions',
                      'No custom regions added yet.',
                    )}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

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
