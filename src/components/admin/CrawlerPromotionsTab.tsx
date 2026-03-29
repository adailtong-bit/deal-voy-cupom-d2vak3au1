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
import { CheckCircle, XCircle, ExternalLink, Edit, FilterX } from 'lucide-react'
import { CrawlerAnalysisSheet } from './CrawlerAnalysisSheet'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { DiscoveredPromotion } from '@/lib/types'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface CrawlerPromotionsTabProps {
  pendingPromotions: DiscoveredPromotion[]
  basePendingPromotions: DiscoveredPromotion[]
  filterState: string
  setFilterState: (v: string) => void
  filterCity: string
  setFilterCity: (v: string) => void
  filterStore: string
  setFilterStore: (v: string) => void
  filterSource: string
  setFilterSource: (v: string) => void
  filterCategory: string
  setFilterCategory: (v: string) => void
  filterFetchDate: string
  setFilterFetchDate: (v: string) => void
}

export function CrawlerPromotionsTab({
  pendingPromotions,
  basePendingPromotions,
  filterState,
  setFilterState,
  filterCity,
  setFilterCity,
  filterStore,
  setFilterStore,
  filterSource,
  setFilterSource,
  filterCategory,
  setFilterCategory,
  filterFetchDate,
  setFilterFetchDate,
}: CrawlerPromotionsTabProps) {
  const { t } = useLanguage()
  const {
    importPromotion,
    ignorePromotion,
    user,
    franchises,
    platformSettings,
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
  const [editedCategories, setEditedCategories] = useState<
    Record<string, string>
  >({})

  const clearFilters = () => {
    setFilterState('all')
    setFilterCity('all')
    setFilterStore('all')
    setFilterSource('all')
    setFilterCategory('all')
    setFilterFetchDate('all')
  }

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

  const allSources = useMemo(
    () =>
      Array.from(
        new Set(basePendingPromotions.map((p) => p.sourceId).filter(Boolean)),
      ).sort() as string[],
    [basePendingPromotions],
  )

  const dynamicCategories = platformSettings?.categories || []

  const allCategories = useMemo(() => {
    const existing = Array.from(
      new Set(basePendingPromotions.map((p) => p.category).filter(Boolean)),
    )
    const dynamicLabels = dynamicCategories.map((c: any) => c.label)
    return Array.from(
      new Set([...existing, ...dynamicLabels]),
    ).sort() as string[]
  }, [basePendingPromotions, dynamicCategories])

  const allFetchDates = useMemo(() => {
    const dates = basePendingPromotions
      .map((p) => (p.capturedAt ? p.capturedAt.split('T')[0] : null))
      .filter(Boolean) as string[]
    return Array.from(new Set(dates)).sort((a, b) => b.localeCompare(a))
  }, [basePendingPromotions])

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

    let finalCategory = category || editedCategories[id] || finalData?.category

    // Map to ID if it's a label
    const mappedCat = dynamicCategories.find(
      (c: any) => c.label === finalCategory,
    )
    if (mappedCat) {
      finalCategory = mappedCat.id
    }

    ;(importPromotion as any)(id, finalCategory, finalData)
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

  const isFiltering =
    filterState !== 'all' ||
    filterCity !== 'all' ||
    filterStore !== 'all' ||
    filterSource !== 'all' ||
    filterCategory !== 'all' ||
    filterFetchDate !== 'all'

  const getOfferUrl = (promo: DiscoveredPromotion) => {
    return (
      promo.originalUrl ||
      promo.rawData?.source_link ||
      promo.rawData?.url ||
      ''
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div className="flex items-center flex-wrap gap-3">
          <h3 className="text-lg font-bold">
            {t('franchisee.crawler.imported_offers', 'Ofertas Importadas')}
          </h3>
          <Badge
            variant="secondary"
            className="text-sm shadow-sm font-semibold"
          >
            {isFiltering
              ? `${pendingPromotions.length} / ${basePendingPromotions.length}`
              : basePendingPromotions.length}{' '}
            {t('common.pending', 'Pendentes')}
          </Badge>
          <Badge variant="outline" className="text-slate-500">
            {t('franchisee.crawler.last_search', 'Última Busca')}:{' '}
            {filterFetchDate !== 'all'
              ? formatShortDate(filterFetchDate)
              : allFetchDates[0]
                ? formatShortDate(allFetchDates[0])
                : '-'}
          </Badge>
          {isFiltering && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-slate-500 h-8 px-2"
            >
              <FilterX className="w-4 h-4 mr-1" />
              {t('common.clear', 'Limpar Filtros')}
            </Button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto flex-wrap justify-end">
          <Select value={filterFetchDate} onValueChange={setFilterFetchDate}>
            <SelectTrigger className="w-full sm:w-[160px] bg-background">
              <SelectValue
                placeholder={t(
                  'franchisee.crawler.fetch_date',
                  'Data de Busca',
                )}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t('franchisee.crawler.all_dates', 'Todas as Datas')}
              </SelectItem>
              {allFetchDates.map((d) => (
                <SelectItem key={d} value={d}>
                  {formatShortDate(d)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full sm:w-[160px] bg-background">
              <SelectValue placeholder={t('common.category', 'Categoria')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t('franchisee.crawler.all_categories', 'Todas as Categorias')}
              </SelectItem>
              {allCategories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterStore} onValueChange={setFilterStore}>
            <SelectTrigger className="w-full sm:w-[160px] bg-background">
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

          <Select value={filterSource} onValueChange={setFilterSource}>
            <SelectTrigger className="w-full sm:w-[160px] bg-background">
              <SelectValue
                placeholder={t(
                  'franchisee.crawler.source_site',
                  'Site de Origem',
                )}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('common.all', 'Todos')}</SelectItem>
              {allSources.map((s) => (
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
            <SelectTrigger className="w-full sm:w-[160px] bg-background">
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
            <SelectTrigger className="w-full sm:w-[160px] bg-background">
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
          <Table className="min-w-[1300px]">
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">
                  {t('franchisee.crawler.company', 'Empresa')}
                </TableHead>
                <TableHead className="whitespace-nowrap">
                  {t('franchisee.crawler.source_site', 'Site de Origem')}
                </TableHead>
                <TableHead className="whitespace-nowrap">
                  {t('franchisee.crawler.fetch_date', 'Data de Busca')}
                </TableHead>
                <TableHead className="whitespace-nowrap">
                  {t('vouchers.expiration_date', 'Data de Expiração')}
                </TableHead>
                <TableHead className="min-w-[200px]">
                  {t('franchisee.crawler.description', 'Descrição')}
                </TableHead>
                <TableHead className="whitespace-nowrap">
                  {t('common.category', 'Categoria')}
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
                          {promo.storeName ||
                            promo.sourceId ||
                            'Marca Não Identificada'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {promo.region}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex flex-col">
                      {getOfferUrl(promo) ? (
                        <a
                          href={getOfferUrl(promo)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-medium text-blue-600 hover:underline max-w-[200px] truncate block"
                          title={getOfferUrl(promo)}
                        >
                          {getOfferUrl(promo)}
                        </a>
                      ) : (
                        <span
                          className="text-sm font-medium text-slate-700 max-w-[200px] truncate block"
                          title={promo.sourceId || 'Sem URL'}
                        >
                          {promo.sourceId || 'Sem URL'}
                        </span>
                      )}
                      {getOfferUrl(promo) && (
                        <span className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" />{' '}
                          {t('franchisee.crawler.offer_url', 'URL da Oferta')}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-slate-600 font-medium">
                    {promo.capturedAt ? (
                      <div className="flex flex-col">
                        <span>{formatShortDate(promo.capturedAt)}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(promo.capturedAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-slate-600 font-medium">
                    {promo.expiryDate ? formatShortDate(promo.expiryDate) : '-'}
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

                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <span className="text-xs text-muted-foreground line-clamp-2 cursor-help border-b border-dashed border-slate-300 pb-0.5 break-words">
                            {promo.rawData?.original_description ||
                              promo.description ||
                              t('common.no_description', 'Sem descrição')}
                          </span>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-[350px] max-w-[90vw] text-sm z-[100] bg-background shadow-xl border-border">
                          <div className="max-h-[300px] overflow-y-auto pr-2 hide-scrollbar">
                            <p className="font-semibold mb-1 text-foreground">
                              {t(
                                'franchisee.crawler.original_description',
                                'Descrição Original do Anunciante',
                              )}
                            </p>
                            <p className="text-muted-foreground whitespace-pre-wrap break-words">
                              {promo.rawData?.original_description ||
                                promo.description ||
                                t('common.no_description', 'Sem descrição')}
                            </p>
                            {promo.rawData?.original_title && (
                              <div className="mt-3 pt-2 border-t border-border/50">
                                <span className="text-xs font-semibold text-foreground">
                                  {t(
                                    'franchisee.crawler.original_title',
                                    'Título Original',
                                  )}
                                  :{' '}
                                </span>
                                <span className="text-xs text-muted-foreground break-words">
                                  {promo.rawData.original_title}
                                </span>
                              </div>
                            )}
                          </div>
                        </HoverCardContent>
                      </HoverCard>

                      <Badge
                        variant="secondary"
                        className="w-fit bg-green-100 text-green-800 hover:bg-green-100 mt-1"
                      >
                        {promo.discount}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm">
                    <Select
                      value={
                        editedCategories[promo.id] ||
                        dynamicCategories.find(
                          (c: any) => c.label === promo.category,
                        )?.id ||
                        promo.category ||
                        ''
                      }
                      onValueChange={(val) =>
                        setEditedCategories((prev) => ({
                          ...prev,
                          [promo.id]: val,
                        }))
                      }
                    >
                      <SelectTrigger className="w-[140px] h-8 text-xs">
                        <SelectValue placeholder="Categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {dynamicCategories.map((c: any) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.label}
                          </SelectItem>
                        ))}
                        {(editedCategories[promo.id] || promo.category) &&
                          !dynamicCategories.find(
                            (c: any) =>
                              c.id ===
                                (editedCategories[promo.id] ||
                                  promo.category) ||
                              c.label ===
                                (editedCategories[promo.id] || promo.category),
                          ) && (
                            <SelectItem
                              key="promo-cat-custom"
                              value={
                                editedCategories[promo.id] || promo.category
                              }
                            >
                              {editedCategories[promo.id] || promo.category}
                            </SelectItem>
                          )}
                      </SelectContent>
                    </Select>
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
                    colSpan={10}
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
