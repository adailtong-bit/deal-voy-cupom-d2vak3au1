import { useState, useMemo } from 'react'
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
import { REGIONS, LOCATION_DATA } from '@/lib/locationData'

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

  const handleSave = () => {
    localStorage.setItem('system_settings', JSON.stringify(settings))
    toast.success(
      t(
        'admin.settings_tab.save_success',
        'System parameters updated successfully.',
      ),
    )
  }

  const ALL_REGIONS = Array.from(
    new Set([...REGIONS, ...(settings.customRegions || [])]),
  )

  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)
  const [selectedState, setSelectedState] = useState<string | null>(null)
  const [newCountryName, setNewCountryName] = useState('')
  const [newStateName, setNewStateName] = useState('')
  const [newCityName, setNewCityName] = useState('')

  const geoTree = useMemo(() => {
    const tree = JSON.parse(JSON.stringify(LOCATION_DATA))

    const customLocs = settings.customLocations || {}
    for (const [c, cData] of Object.entries(customLocs as any)) {
      if (!tree[c]) tree[c] = { states: {} }
      for (const [s, cities] of Object.entries((cData as any).states || {})) {
        if (!tree[c].states[s]) tree[c].states[s] = []
        tree[c].states[s] = Array.from(
          new Set([...tree[c].states[s], ...(cities as any)]),
        ).sort()
      }
    }

    const cRegions = settings.customRegions || []
    cRegions.forEach((r: string) => {
      if (!tree[r]) tree[r] = { states: {} }
    })

    return tree
  }, [settings.customLocations, settings.customRegions])

  const handleAddCountry = () => {
    if (!newCountryName.trim()) return
    const name = newCountryName.trim()
    const current = settings.customRegions || []
    if (!current.includes(name)) {
      setSettings({
        ...settings,
        customRegions: [...current, name],
        customLocations: {
          ...(settings.customLocations || {}),
          [name]: { states: {} },
        },
      })
    }
    setNewCountryName('')
    setSelectedCountry(name)
    setSelectedState(null)
  }

  const handleAddState = () => {
    if (!selectedCountry || !newStateName.trim()) return
    const sName = newStateName.trim()
    const customLocs = { ...(settings.customLocations || {}) }
    if (!customLocs[selectedCountry])
      customLocs[selectedCountry] = { states: {} }
    if (!customLocs[selectedCountry].states[sName])
      customLocs[selectedCountry].states[sName] = []

    setSettings({ ...settings, customLocations: customLocs })
    setNewStateName('')
    setSelectedState(sName)
  }

  const handleAddCity = () => {
    if (!selectedCountry || !selectedState || !newCityName.trim()) return
    const cName = newCityName.trim()
    const customLocs = { ...(settings.customLocations || {}) }
    if (!customLocs[selectedCountry])
      customLocs[selectedCountry] = { states: {} }
    if (!customLocs[selectedCountry].states[selectedState])
      customLocs[selectedCountry].states[selectedState] = []

    if (!customLocs[selectedCountry].states[selectedState].includes(cName)) {
      customLocs[selectedCountry].states[selectedState].push(cName)
    }

    setSettings({ ...settings, customLocations: customLocs })
    setNewCityName('')
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
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Geographic Hierarchy Manager</CardTitle>
            <CardDescription>
              Manage Countries, States, and Cities for your franchises and
              merchants. Select an item to view or add children.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[400px]">
              {/* Countries */}
              <div className="border rounded-md flex flex-col h-full">
                <div className="p-3 border-b bg-slate-50 font-medium">
                  Countries
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  {Object.keys(geoTree)
                    .sort()
                    .map((c) => (
                      <button
                        key={c}
                        onClick={() => {
                          setSelectedCountry(c)
                          setSelectedState(null)
                        }}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${selectedCountry === c ? 'bg-primary text-primary-foreground' : 'hover:bg-slate-100'}`}
                      >
                        {c}
                      </button>
                    ))}
                </div>
                <div className="p-2 border-t mt-auto bg-slate-50">
                  <div className="flex gap-2">
                    <Input
                      size={1}
                      className="h-8 text-sm"
                      placeholder="New Country"
                      value={newCountryName}
                      onChange={(e) => setNewCountryName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddCountry()}
                    />
                    <Button
                      size="sm"
                      className="h-8 px-2"
                      onClick={handleAddCountry}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* States */}
              <div className="border rounded-md flex flex-col h-full">
                <div className="p-3 border-b bg-slate-50 font-medium">
                  {selectedCountry
                    ? `States in ${selectedCountry}`
                    : 'Select a Country'}
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  {selectedCountry &&
                    Object.keys(geoTree[selectedCountry]?.states || {})
                      .sort()
                      .map((s) => (
                        <button
                          key={s}
                          onClick={() => setSelectedState(s)}
                          className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${selectedState === s ? 'bg-primary text-primary-foreground' : 'hover:bg-slate-100'}`}
                        >
                          {s}
                        </button>
                      ))}
                  {selectedCountry &&
                    Object.keys(geoTree[selectedCountry]?.states || {})
                      .length === 0 && (
                      <p className="text-xs text-muted-foreground p-2">
                        No states found.
                      </p>
                    )}
                </div>
                {selectedCountry && (
                  <div className="p-2 border-t mt-auto bg-slate-50">
                    <div className="flex gap-2">
                      <Input
                        size={1}
                        className="h-8 text-sm"
                        placeholder="New State"
                        value={newStateName}
                        onChange={(e) => setNewStateName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddState()}
                      />
                      <Button
                        size="sm"
                        className="h-8 px-2"
                        onClick={handleAddState}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Cities */}
              <div className="border rounded-md flex flex-col h-full">
                <div className="p-3 border-b bg-slate-50 font-medium">
                  {selectedState
                    ? `Cities in ${selectedState}`
                    : 'Select a State'}
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  {selectedCountry &&
                    selectedState &&
                    (geoTree[selectedCountry]?.states[selectedState] || []).map(
                      (city: string) => (
                        <div
                          key={city}
                          className="w-full text-left px-3 py-2 rounded-md text-sm bg-slate-50"
                        >
                          {city}
                        </div>
                      ),
                    )}
                  {selectedCountry &&
                    selectedState &&
                    (geoTree[selectedCountry]?.states[selectedState] || [])
                      .length === 0 && (
                      <p className="text-xs text-muted-foreground p-2">
                        No cities found.
                      </p>
                    )}
                </div>
                {selectedCountry && selectedState && (
                  <div className="p-2 border-t mt-auto bg-slate-50">
                    <div className="flex gap-2">
                      <Input
                        size={1}
                        className="h-8 text-sm"
                        placeholder="New City"
                        value={newCityName}
                        onChange={(e) => setNewCityName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddCity()}
                      />
                      <Button
                        size="sm"
                        className="h-8 px-2"
                        onClick={handleAddCity}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              * Remember to click <strong>Save Changes</strong> at the bottom of
              the page to persist these locations.
            </p>
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
