import { useState, useMemo } from 'react'
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
import { CheckCircle, XCircle, ExternalLink, Edit } from 'lucide-react'
import { CrawlerAnalysisSheet } from './CrawlerAnalysisSheet'
import { DiscoveredPromotion } from '@/lib/types'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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
  const [filterState, setFilterState] = useState<string>('all')
  const [filterCity, setFilterCity] = useState<string>('all')
  const [filterStore, setFilterStore] = useState<string>('all')

  const basePendingPromotions = discoveredPromotions.filter(
    (p) =>
      p.status === 'pending' &&
      p.storeName?.trim() &&
      p.title?.trim() &&
      p.description?.trim() &&
      (p.capturedAt || p.expiryDate),
  )

  const allStates = useMemo(
    () =>
      Array.from(
        new Set(basePendingPromotions.map((p) => p.state).filter(Boolean)),
      ).sort() as string[],
    [basePendingPromotions],
  )

  const allCities = useMemo(
    () =>
      Array.from(
        new Set(
          basePendingPromotions
            .filter((p) => filterState === 'all' || p.state === filterState)
            .map((p) => p.city)
            .filter(Boolean),
        ),
      ).sort() as string[],
    [basePendingPromotions, filterState],
  )

  const allStores = useMemo(
    () =>
      Array.from(
        new Set(basePendingPromotions.map((p) => p.storeName).filter(Boolean)),
      ).sort() as string[],
    [basePendingPromotions],
  )

  const pendingPromotions = useMemo(() => {
    return basePendingPromotions.filter((p) => {
      if (filterState !== 'all' && p.state !== filterState) return false
      if (filterCity !== 'all' && p.city !== filterCity) return false
      if (filterStore !== 'all' && p.storeName !== filterStore) return false
      return true
    })
  }, [basePendingPromotions, filterState, filterCity, filterStore])

  const handleImport = (
    id: string,
    category?: string,
    editedData?: DiscoveredPromotion,
  ) => {
    let finalData = editedData
    if (!finalData) {
      const promo = basePendingPromotions.find((p) => p.id === id)
      if (promo) {
        let expiry = promo.expiryDate
        if (!expiry) {
          const date = promo.capturedAt
            ? new Date(promo.capturedAt)
            : new Date()
          date.setDate(date.getDate() + 30)
          expiry = date.toISOString()
        }
        finalData = { ...promo, expiryDate: expiry }
      }
    }

    // Attempting to pass editedData if the mock store supports it internally
    ;(importPromotion as any)(id, category, finalData)
    toast.success(
      t(
        'franchisee.crawler.imported_success',
        'Oferta aprovada e importada com sucesso!',
      ),
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold">
            {t('franchisee.crawler.imported_offers', 'Ofertas Importadas')}
          </h3>
          <Badge variant="secondary">
            {pendingPromotions.length} {t('common.pending', 'Pendentes')}
          </Badge>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto flex-wrap justify-end">
          <Select value={filterStore} onValueChange={setFilterStore}>
            <SelectTrigger className="w-full sm:w-[180px] bg-background">
              <SelectValue placeholder={t('common.store', 'Loja')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t('common.all_stores', 'Todas as Lojas')}
              </SelectItem>
              {allStores.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filterState}
            onValueChange={(val) => {
              setFilterState(val)
              setFilterCity('all')
            }}
          >
            <SelectTrigger className="w-full sm:w-[180px] bg-background">
              <SelectValue placeholder={t('common.state', 'Estado')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t('common.all_states', 'Todos os Estados')}
              </SelectItem>
              {allStates.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterCity} onValueChange={setFilterCity}>
            <SelectTrigger className="w-full sm:w-[180px] bg-background">
              <SelectValue placeholder={t('common.city', 'Cidade')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t('common.all_cities', 'Todas as Cidades')}
              </SelectItem>
              {allCities.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border bg-card overflow-hidden">
        <div className="w-full overflow-x-auto hide-scrollbar">
          <Table className="min-w-[1200px]">
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">
                  {t('franchisee.crawler.company', 'Empresa')}
                </TableHead>
                <TableHead className="whitespace-nowrap">
                  {t('vouchers.source_site', 'Site de Origem')}
                </TableHead>
                <TableHead className="whitespace-nowrap">
                  {t('vouchers.expiration_date', 'Data de Expiração')}
                </TableHead>
                <TableHead className="min-w-[200px]">
                  {t('franchisee.crawler.description', 'Descrição')}
                </TableHead>
                <TableHead className="whitespace-nowrap">
                  {t('common.country', 'País')}
                </TableHead>
                <TableHead className="whitespace-nowrap">
                  {t('common.state', 'Estado')}
                </TableHead>
                <TableHead className="whitespace-nowrap">
                  {t('common.city', 'Cidade')}
                </TableHead>
                <TableHead className="text-right whitespace-nowrap sticky right-0 bg-card z-10">
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
                        className="w-10 h-10 rounded-md object-cover shrink-0"
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
                  <TableCell className="whitespace-nowrap">
                    <div className="flex flex-col space-y-0.5">
                      <span
                        className="text-sm font-medium max-w-[150px] truncate"
                        title={promo.originalUrl || promo.sourceId}
                      >
                        {promo.originalUrl
                          ? (() => {
                              try {
                                return new URL(
                                  promo.originalUrl,
                                ).hostname.replace('www.', '')
                              } catch (e) {
                                return promo.sourceId
                              }
                            })()
                          : promo.sourceId === 'custom'
                            ? 'Busca Web'
                            : promo.sourceId}
                      </span>
                      {promo.originalUrl && (
                        <a
                          href={promo.originalUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                          title={promo.originalUrl}
                        >
                          {t('common.view', 'Ver')}{' '}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-slate-600 font-medium">
                    {promo.expiryDate
                      ? formatShortDate(promo.expiryDate)
                      : promo.capturedAt
                        ? formatShortDate(promo.capturedAt)
                        : '-'}
                  </TableCell>
                  <TableCell className="min-w-[200px] max-w-[300px]">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="font-semibold text-sm line-clamp-1"
                          title={promo.title}
                        >
                          {promo.title}
                        </span>
                        {promo.rawData?.suspicious && (
                          <Badge
                            variant="destructive"
                            className="text-[10px] px-1 py-0 h-4"
                          >
                            {t('common.suspicious', 'Suspeito')}
                          </Badge>
                        )}
                      </div>
                      <span
                        className="text-xs text-muted-foreground line-clamp-2"
                        title={promo.description}
                      >
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
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {promo.country || '-'}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {promo.state || '-'}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {promo.city || '-'}
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap sticky right-0 bg-card z-10 shadow-[-10px_0_15px_-5px_rgba(0,0,0,0.05)]">
                    <div className="flex justify-end gap-2 items-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedPromo(promo)
                          setIsSheetOpen(true)
                        }}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        {t('common.edit', 'Editar')}
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white shadow-sm"
                        onClick={() => handleImport(promo.id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        {t('common.approve', 'Aprovar')}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:bg-red-50 h-8 w-8"
                        onClick={() => handleIgnore(promo.id)}
                        title={t('common.ignore', 'Ignorar')}
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
                    colSpan={8}
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
