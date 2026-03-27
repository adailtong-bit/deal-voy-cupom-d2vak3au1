import { useState } from 'react'
import { useLanguage } from '@/stores/LanguageContext'
import { useCouponStore } from '@/stores/CouponContext'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, ExternalLink } from 'lucide-react'
import { CrawlerAnalysisSheet } from './CrawlerAnalysisSheet'
import { DiscoveredPromotion } from '@/lib/types'
import { toast } from 'sonner'

export function CrawlerPromotionsTab() {
  const { t } = useLanguage()
  const { discoveredPromotions, importPromotion, ignorePromotion } =
    useCouponStore()

  const [selectedPromo, setSelectedPromo] =
    useState<DiscoveredPromotion | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const pendingPromotions = discoveredPromotions.filter(
    (p) => p.status === 'pending',
  )

  const handleImport = (id: string, category?: string) => {
    importPromotion(id, category)
    toast.success(
      t('franchisee.crawler.imported_success', 'Oferta importada com sucesso!'),
    )
  }

  const handleIgnore = (id: string) => {
    ignorePromotion(id)
    toast.success(
      t(
        'franchisee.crawler.ignored_success',
        'Oferta ignorada e removida da lista.',
      ),
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold">
          {t('franchisee.crawler.found_offers', 'Ofertas Encontradas')}
        </h3>
        <Badge variant="secondary">
          {pendingPromotions.length} {t('common.pending', 'Pendentes')}
        </Badge>
      </div>

      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                {t('franchisee.crawler.offer_title', 'Título')}
              </TableHead>
              <TableHead>
                {t('franchisee.crawler.discount', 'Desconto')}
              </TableHead>
              <TableHead>
                {t('franchisee.crawler.source', 'Fonte / Lojista (Orgânico)')}
              </TableHead>
              <TableHead>
                {t('franchisee.crawler.category', 'Categoria')}
              </TableHead>
              <TableHead className="text-right">
                {t('common.actions', 'Ações')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendingPromotions.map((promo) => (
              <TableRow key={promo.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <img
                      src={promo.image}
                      alt=""
                      className="w-8 h-8 rounded object-cover"
                    />
                    <span>{promo.title}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                    {promo.discount}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{promo.storeName}</span>
                    <span className="text-xs text-muted-foreground">
                      {promo.region}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{promo.category}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedPromo(promo)
                        setIsSheetOpen(true)
                      }}
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      {t('common.view', 'Visualizar')}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-green-600 hover:bg-green-50"
                      onClick={() => handleImport(promo.id)}
                    >
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => handleIgnore(promo.id)}
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {pendingPromotions.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                >
                  {t(
                    'franchisee.crawler.no_pending',
                    'Nenhuma oferta orgânica aguardando importação.',
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <CrawlerAnalysisSheet
        promo={selectedPromo}
        open={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        onImport={handleImport}
        onIgnore={handleIgnore}
      />
    </div>
  )
}
