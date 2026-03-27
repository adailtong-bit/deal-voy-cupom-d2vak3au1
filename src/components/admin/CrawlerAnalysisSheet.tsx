import { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
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

interface CrawlerAnalysisSheetProps {
  promo: DiscoveredPromotion | null
  open: boolean
  onClose: () => void
  onImport: (id: string, category?: string) => void
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

  if (!promo) return null

  const previewCoupon: Coupon = {
    id: promo.id,
    storeName: promo.storeName,
    title: promo.title,
    description: promo.description,
    discount: promo.discount,
    category: (importCategory !== 'all'
      ? importCategory
      : promo.category) as any,
    distance: 0,
    expiryDate: promo.expiryDate,
    image: promo.image,
    code: 'PREVIEW-CODE',
    coordinates: { lat: 0, lng: 0 },
    status: 'active',
    source: 'organic',
    region: promo.region,
    price: promo.price,
    currency: promo.currency,
  }

  const handleImport = () => {
    onImport(promo.id, importCategory !== 'all' ? importCategory : undefined)
    onClose()
  }

  const handleIgnore = () => {
    onIgnore(promo.id)
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
            {t('franchisee.crawler.analysis_title', 'Análise da Promoção')}
          </SheetTitle>
          <SheetDescription>
            {t(
              'franchisee.crawler.analysis_desc',
              'Revise os dados extraídos antes de aprovar e importar a oferta.',
            )}
          </SheetDescription>
        </SheetHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
          <div className="flex flex-col">
            <h3 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wider">
              {t('franchisee.crawler.raw_data', 'Dados Brutos Extraídos')}
            </h3>
            <ScrollArea className="flex-1 bg-slate-950 text-green-400 p-4 rounded-lg font-mono text-xs shadow-inner">
              <pre>{JSON.stringify(promo.rawData || promo, null, 2)}</pre>
            </ScrollArea>
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
                    className="flex-1 bg-green-600 hover:bg-green-700"
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
