import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import { useLanguage } from '@/stores/LanguageContext'
import { Loader2, Save } from 'lucide-react'

export function AdminContentTab() {
  const { t } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [content, setContent] = useState({
    about: '',
    company: '',
    mission: '',
    contact: '',
  })

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'footer_content')
          .maybeSingle()

        if (error) throw error

        if (data && data.value) {
          setContent(data.value as any)
        }
      } catch (err) {
        console.error('Error fetching footer content:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  const handleChange = (field: string, value: string) => {
    setContent((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const { error } = await supabase.from('site_settings').upsert(
        {
          key: 'footer_content',
          value: content,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'key' },
      )

      if (error) throw error
      toast.success(t('admin.settings_saved', 'Settings saved successfully!'))
    } catch (err) {
      console.error('Error saving footer content:', err)
      toast.error(t('admin.settings_error', 'Error saving settings.'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('admin.content_tab.title', 'Footer Content')}</CardTitle>
        <CardDescription>
          {t(
            'admin.content_tab.desc',
            'Manage the texts displayed in the website footer (About Us, Our Company, Our Mission, Contact Us).',
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="about" className="text-sm font-medium leading-none">
            {t('admin.content_tab.about', 'About Us')}
          </label>
          <textarea
            id="about"
            rows={4}
            value={content.about}
            onChange={(e) => handleChange('about', e.target.value)}
            placeholder={t(
              'admin.content_tab.about_ph',
              'Text for the About Us section',
            )}
            className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="company" className="text-sm font-medium leading-none">
            {t('admin.content_tab.company', 'Our Company')}
          </label>
          <textarea
            id="company"
            rows={4}
            value={content.company}
            onChange={(e) => handleChange('company', e.target.value)}
            placeholder={t(
              'admin.content_tab.company_ph',
              'Text for the Our Company section',
            )}
            className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="mission" className="text-sm font-medium leading-none">
            {t('admin.content_tab.mission', 'Our Mission')}
          </label>
          <textarea
            id="mission"
            rows={4}
            value={content.mission}
            onChange={(e) => handleChange('mission', e.target.value)}
            placeholder={t(
              'admin.content_tab.mission_ph',
              'Text for the Our Mission section',
            )}
            className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="contact" className="text-sm font-medium leading-none">
            {t('admin.content_tab.contact', 'Contact Us')}
          </label>
          <textarea
            id="contact"
            rows={4}
            value={content.contact}
            onChange={(e) => handleChange('contact', e.target.value)}
            placeholder={t(
              'admin.content_tab.contact_ph',
              'Text for the Contact Us section (Email, phone, address...)',
            )}
            className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
          />
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full sm:w-auto"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {t('common.save_changes', 'Save Changes')}
        </Button>
      </CardContent>
    </Card>
  )
}
