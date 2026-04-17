import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/stores/LanguageContext'
import { Plus, Search, Globe, Check, X, Edit, Trash2 } from 'lucide-react'

export function AdminTranslationsTab() {
  const {
    t,
    supportedLanguages,
    addLanguage,
    updateLanguage,
    deleteLanguage,
    getAllKeys,
    getDefaultTranslation,
    overrides,
    updateTranslation,
  } = useLanguage()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLang, setSelectedLang] = useState('en')

  const [isAddLangOpen, setIsAddLangOpen] = useState(false)
  const [isEditLangOpen, setIsEditLangOpen] = useState(false)
  const [newLangCode, setNewLangCode] = useState('')
  const [newLangName, setNewLangName] = useState('')
  const [editLangName, setEditLangName] = useState('')

  const allKeys = useMemo(() => getAllKeys(), [])

  const filteredKeys = useMemo(() => {
    if (!searchTerm) return allKeys
    return allKeys.filter((k) =>
      k.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [allKeys, searchTerm])

  const handleAddLanguage = () => {
    if (newLangCode && newLangName) {
      addLanguage(newLangCode.toLowerCase(), newLangName)
      setNewLangCode('')
      setNewLangName('')
      setIsAddLangOpen(false)
    }
  }

  const handleEditLanguage = () => {
    if (selectedLang && editLangName) {
      updateLanguage(selectedLang, editLangName)
      setIsEditLangOpen(false)
    }
  }

  const handleDeleteLanguage = () => {
    if (
      confirm(
        t(
          'admin.translations.confirm_delete',
          'Are you sure you want to delete this language?',
        ),
      )
    ) {
      const nextLang =
        supportedLanguages.find((l) => l.code !== selectedLang)?.code || 'en'
      deleteLanguage(selectedLang)
      setSelectedLang(nextLang)
    }
  }

  const openEditModal = () => {
    const lang = supportedLanguages.find((l) => l.code === selectedLang)
    if (lang) {
      setEditLangName(lang.name)
      setIsEditLangOpen(true)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up relative">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {t('admin.translations.title', 'Translation Management')}
          </h2>
          <p className="text-muted-foreground">
            {t(
              'admin.translations.desc',
              'Manage language settings and modify translation masks directly.',
            )}
          </p>
        </div>

        <Button onClick={() => setIsAddLangOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t('admin.translations.add_lang', 'Add Language')}
        </Button>
      </div>

      {isEditLangOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md overflow-hidden animate-fade-in-up">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">
                {t('admin.translations.edit_lang_title', 'Edit Language')}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditLangOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t('admin.translations.lang_name', 'Language Name')}
                </label>
                <input
                  value={editLangName}
                  onChange={(e) => setEditLangName(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                />
              </div>
            </div>
            <div className="flex justify-end p-4 border-t gap-2 bg-slate-50">
              <Button
                variant="outline"
                onClick={() => setIsEditLangOpen(false)}
              >
                {t('admin.translations.cancel', 'Cancel')}
              </Button>
              <Button onClick={handleEditLanguage} disabled={!editLangName}>
                {t('admin.translations.save_lang', 'Save Language')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {isAddLangOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md overflow-hidden animate-fade-in-up">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">
                {t(
                  'admin.translations.add_lang_title',
                  'Add Supported Language',
                )}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsAddLangOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t(
                    'admin.translations.lang_code',
                    'Language Code (e.g. fr, de, it)',
                  )}
                </label>
                <input
                  value={newLangCode}
                  onChange={(e) => setNewLangCode(e.target.value)}
                  placeholder="fr"
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t('admin.translations.lang_name', 'Language Name')}
                </label>
                <input
                  value={newLangName}
                  onChange={(e) => setNewLangName(e.target.value)}
                  placeholder="Français"
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>
            <div className="flex justify-end p-4 border-t gap-2 bg-slate-50">
              <Button variant="outline" onClick={() => setIsAddLangOpen(false)}>
                {t('admin.translations.cancel', 'Cancel')}
              </Button>
              <Button
                onClick={handleAddLanguage}
                disabled={!newLangCode || !newLangName}
              >
                {t('admin.translations.save_lang', 'Save Language')}
              </Button>
            </div>
          </div>
        </div>
      )}

      <Card>
        <CardHeader className="pb-3 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-2 w-full sm:w-1/2">
              <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
              <select
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value)}
                className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {supportedLanguages.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.name} ({l.code})
                  </option>
                ))}
              </select>
              <Button
                variant="outline"
                size="icon"
                onClick={openEditModal}
                title={t('common.edit', 'Edit')}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleDeleteLanguage}
                disabled={supportedLanguages.length <= 1}
                title={t('common.delete', 'Delete')}
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="relative w-full sm:w-1/2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                placeholder={t(
                  'admin.translations.search_keys',
                  'Search keys...',
                )}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white pl-8 pr-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto max-h-[600px] custom-scrollbar">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 bg-slate-50 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-4 py-3 font-semibold w-1/3 border-b">
                    {t('admin.translations.key', 'Translation Key')}
                  </th>
                  <th className="px-4 py-3 font-semibold border-b">
                    {t('admin.translations.value', 'Value')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredKeys.slice(0, 100).map((key) => {
                  // limit to 100 to avoid perf issues when no search
                  const isOverridden =
                    overrides[selectedLang]?.[key] !== undefined
                  const displayValue = isOverridden
                    ? overrides[selectedLang][key]
                    : getDefaultTranslation(selectedLang, key)

                  return (
                    <tr
                      key={key}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-slate-500 break-all align-top pt-5">
                        {key}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <input
                            value={displayValue || ''}
                            onChange={(e) =>
                              updateTranslation(
                                selectedLang,
                                key,
                                e.target.value,
                              )
                            }
                            className={`flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 ${isOverridden ? 'border-primary ring-1 ring-primary/20' : ''}`}
                            placeholder={t(
                              'admin.translations.value_placeholder',
                              'Translation value...',
                            )}
                          />
                          {isOverridden && (
                            <span
                              className="text-primary"
                              title={t(
                                'admin.translations.override_applied',
                                'Custom override applied',
                              )}
                            >
                              <Check className="h-4 w-4 shrink-0" />
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {filteredKeys.length > 100 && (
              <div className="p-4 text-center text-sm text-muted-foreground border-t">
                {t(
                  'admin.translations.showing_top',
                  'Showing top 100 results. Use search to find specific keys.',
                )}
              </div>
            )}
            {filteredKeys.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                {t(
                  'admin.translations.not_found',
                  'No translation keys found.',
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
