import { useState, useEffect } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DiscoveredPromotion, Coupon } from '@/lib/types'
import { CouponCard } from '@/components/CouponCard'
import { ScrollArea } from '@/components/ui/scroll-area'
import { CheckCircle, XCircle } from 'lucide-react'
import { CATEGORIES } from '@/lib/data'
import { useLanguage } from '@/stores/LanguageContext'
import { LOCATION_DATA, COUNTRIES } from '@/lib/locationData'

interface CrawlerAnalysisSheetProps {
  promo: DiscoveredPromotion | null
  open: boolean
  onClose: () => void
  onImport: (
    id: string,
    category?: string,
    editedData?: DiscoveredPromotion,
  ) => void
  onIgnore: (id: string) => void
}

export function CrawlerAnalysisSheet({
  promo,
  open,
  onClose,
  onImport,
  onIgnore,
}: CrawlerAnalysisSheetProps) {
  const { t } = useLanguage()
  const [importCategory, setImportCategory] = useState<string>('all')
  const [editedPromo, setEditedPromo] = useState<DiscoveredPromotion | null>(
    null,
  )

  useEffect(() => {
    if (promo) {
      let expiry = promo.expiryDate
      if (!expiry) {
        const date = promo.capturedAt ? new Date(promo.capturedAt) : new Date()
        date.setDate(date.getDate() + 30)
        expiry = date.toISOString()
      }
      setEditedPromo({ ...promo, expiryDate: expiry })
      setImportCategory('all')
    } else {
      setEditedPromo(null)
    }
  }, [promo, open])

  if (!promo || !editedPromo) return null

  const previewCoupon: Coupon = {
    id: editedPromo.id,
    storeName: editedPromo.storeName,
    title: editedPromo.title,
    description: editedPromo.description,
    discount: editedPromo.discount,
    category: (importCategory !== 'all'
      ? importCategory
      : editedPromo.category) as any,
    distance: 0,
    expiryDate: editedPromo.expiryDate,
    image: editedPromo.image,
    code: 'PREVIEW-CODE',
    coordinates: { lat: 0, lng: 0 },
    status: 'active',
    source: 'organic',
    region: editedPromo.region,
    country: editedPromo.country,
    state: editedPromo.state,
    city: editedPromo.city,
    price: editedPromo.price,
    currency: editedPromo.currency,
  }

  const handleImport = () => {
    onImport(
      editedPromo.id,
      importCategory !== 'all' ? importCategory : undefined,
      editedPromo,
    )
    onClose()
  }

  const handleIgnore = () => {
    onIgnore(editedPromo.id)
    onClose()
  }

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        className="w-[95vw] sm:max-w-2xl overflow-y-auto"
        side="right"
      >
        <SheetHeader className="mb-6">
          <SheetTitle>
            {t(
              'franchisee.crawler.analysis_title',
              'Revisar e Editar Promoção',
            )}
          </SheetTitle>
          <SheetDescription>
            {t(
              'franchisee.crawler.analysis_desc',
              'Revise e edite os dados extraídos antes de aprovar e importar a oferta para o catálogo ativo.',
            )}
          </SheetDescription>
        </SheetHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full pb-10">
          <div className="flex flex-col space-y-6">
            <div>
              <h3 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wider">
                {t('common.edit_details', 'Editar Detalhes')}
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{t('franchisee.crawler.company', 'Empresa')}</Label>
                  <Input
                    value={editedPromo.storeName}
                    onChange={(e) =>
                      setEditedPromo({
                        ...editedPromo,
                        storeName: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('common.title', 'Título da Oferta')}</Label>
                  <Input
                    value={editedPromo.title}
                    onChange={(e) =>
                      setEditedPromo({ ...editedPromo, title: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('common.description', 'Descrição')}</Label>
                  <textarea
                    value={editedPromo.description}
                    onChange={(e) =>
                      setEditedPromo({
                        ...editedPromo,
                        description: e.target.value,
                      })
                    }
                    rows={3}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('common.discount', 'Desconto')}</Label>
                    <Input
                      value={editedPromo.discount}
                      onChange={(e) =>
                        setEditedPromo({
                          ...editedPromo,
                          discount: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>
                      {t('common.expiry_date', 'Data de Expiração')}
                    </Label>
                    <Input
                      type="date"
                      value={
                        editedPromo.expiryDate
                          ? editedPromo.expiryDate.split('T')[0]
                          : ''
                      }
                      onChange={(e) => {
                        const val = e.target.value
                        if (val) {
                          const date = new Date(val)
                          date.setUTCHours(23, 59, 59, 999)
                          setEditedPromo({
                            ...editedPromo,
                            expiryDate: date.toISOString(),
                          })
                        } else {
                          setEditedPromo({
                            ...editedPromo,
                            expiryDate: '',
                          })
                        }
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('common.country', 'País')}</Label>
                    <Select
                      value={editedPromo.country || ''}
                      onValueChange={(val) => {
                        setEditedPromo({
                          ...editedPromo,
                          country: val,
                          state: '',
                          city: '',
                        })
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t('common.select', 'Selecione')}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from(
                          new Set(
                            [...COUNTRIES, editedPromo.country].filter(Boolean),
                          ),
                        ).map((c) => (
                          <SelectItem key={c as string} value={c as string}>
                            {c as string}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('common.state', 'Estado')}</Label>
                    <Select
                      value={editedPromo.state || ''}
                      onValueChange={(val) => {
                        setEditedPromo({
                          ...editedPromo,
                          state: val,
                          city: '',
                        })
                      }}
                      disabled={!editedPromo.country}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t('common.select', 'Selecione')}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from(
                          new Set(
                            [
                              ...(editedPromo.country &&
                              LOCATION_DATA[editedPromo.country]
                                ? Object.keys(
                                    LOCATION_DATA[editedPromo.country].states,
                                  )
                                : []),
                              editedPromo.state,
                            ].filter(Boolean),
                          ),
                        ).map((s) => (
                          <SelectItem key={s as string} value={s as string}>
                            {s as string}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('common.city', 'Cidade')}</Label>
                    <Select
                      value={editedPromo.city || ''}
                      onValueChange={(val) => {
                        setEditedPromo({
                          ...editedPromo,
                          city: val,
                        })
                      }}
                      disabled={!editedPromo.state || !editedPromo.country}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t('common.select', 'Selecione')}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from(
                          new Set(
                            [
                              ...(editedPromo.country &&
                              editedPromo.state &&
                              LOCATION_DATA[editedPromo.country]?.states[
                                editedPromo.state
                              ]
                                ? LOCATION_DATA[editedPromo.country].states[
                                    editedPromo.state
                                  ]
                                : []),
                              editedPromo.city,
                            ].filter(Boolean),
                          ),
                        ).map((c) => (
                          <SelectItem key={c as string} value={c as string}>
                            {c as string}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col flex-1 min-h-[150px]">
              <h3 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wider">
                {t('franchisee.crawler.raw_data', 'Dados Brutos Extraídos')}
              </h3>
              <ScrollArea className="flex-1 bg-slate-950 text-green-400 p-4 rounded-lg font-mono text-xs shadow-inner min-h-[150px]">
                <pre>{JSON.stringify(promo.rawData || promo, null, 2)}</pre>
              </ScrollArea>
            </div>
          </div>

          <div className="flex flex-col">
            <h3 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wider">
              {t('franchisee.crawler.ui_preview', 'Pré-visualização (App)')}
            </h3>
            <div className="mb-6 border p-4 rounded-xl bg-slate-50 flex items-center justify-center">
              <div className="w-full max-w-[280px]">
                <CouponCard coupon={previewCoupon} variant="vertical" />
              </div>
            </div>

            {promo.status === 'pending' && (
              <div className="mt-auto space-y-4 border-t pt-4">
                <div className="space-y-2">
                  <Label>
                    {t(
                      'franchisee.crawler.map_category',
                      'Mapear para Categoria do App',
                    )}
                  </Label>
                  <Select
                    value={importCategory}
                    onValueChange={setImportCategory}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t(
                          'franchisee.crawler.map_category',
                          'Mapear para Categoria do App',
                        )}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {t(c.translationKey, c.label)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={handleIgnore}
                  >
                    <XCircle className="h-4 w-4 mr-2" />{' '}
                    {t('franchisee.crawler.ignore', 'Ignorar')}
                  </Button>
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    onClick={handleImport}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />{' '}
                    {t(
                      'franchisee.crawler.approve_import',
                      'Aprovar e Importar',
                    )}
                  </Button>
                </div>
              </div>
            )}
            {promo.status !== 'pending' && (
              <div className="mt-auto text-center p-4 bg-muted rounded-lg font-medium">
                {t(
                  'franchisee.crawler.already_processed',
                  'Esta promoção já foi processada ({status}).',
                ).replace('{status}', promo.status)}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
