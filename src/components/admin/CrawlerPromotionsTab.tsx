import { useState } from 'react'
import { useLanguage } from '@/stores/LanguageContext'
import { useRegionFormatting } from '@/hooks/useRegionFormatting'
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
  const {
    discoveredPromotions,
    importPromotion,
    ignorePromotion,
    user,
    franchises,
  } = useCouponStore()

  const myFranchise =
    franchises.find((f) => f.ownerId === user?.id) || franchises[0]
  const { formatShortDate } = useRegionFormatting(
    myFranchise?.region,
    myFranchise?.addressCountry,
  )

  const [selectedPromo, setSelectedPromo] =
    useState<DiscoveredPromotion | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const pendingPromotions = discoveredPromotions.filter(
    (p) =>
      p.status === 'pending' &&
      p.storeName?.trim() &&
      p.title?.trim() &&
      p.description?.trim() &&
      (p.capturedAt || p.expiryDate),
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
                {t('franchisee.crawler.company', 'Empresa')}
              </TableHead>
              <TableHead>
                {t('franchisee.crawler.description', 'O que é (Descrição)')}
              </TableHead>
              <TableHead>{t('franchisee.crawler.origin', 'Origem')}</TableHead>
              <TableHead>{t('franchisee.crawler.date', 'Data')}</TableHead>
              <TableHead className="text-right">
                {t('common.actions', 'Ações')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendingPromotions.map((promo) => (
              <TableRow key={promo.id}>
                <TableCell className="font-medium whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <img
                      src={promo.image}
                      alt=""
                      className="w-10 h-10 rounded-md object-cover"
                    />
                    <div className="flex flex-col">
                      <span className="font-bold">
                        {promo.storeName || 'Desconhecida'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {promo.region}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="min-w-[200px] max-w-[300px]">
                  <div className="flex flex-col space-y-1">
                    <span className="font-semibold text-sm line-clamp-1">
                      {promo.title}
                    </span>
                    <span className="text-xs text-muted-foreground line-clamp-2">
                      {promo.description}
                    </span>
                    <Badge
                      variant="secondary"
                      className="w-fit bg-green-100 text-green-800 hover:bg-green-100"
                    >
                      {promo.discount}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <div className="flex flex-col space-y-0.5">
                    <span className="text-sm font-medium">
                      {promo.sourceId === 'custom'
                        ? 'Busca Web'
                        : promo.sourceId}
                    </span>
                    {promo.originalUrl && (
                      <a
                        href={promo.originalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                      >
                        Ver fonte <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm text-slate-600">
                  {promo.capturedAt
                    ? formatShortDate(promo.capturedAt)
                    : formatShortDate(promo.expiryDate)}
                </TableCell>
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
