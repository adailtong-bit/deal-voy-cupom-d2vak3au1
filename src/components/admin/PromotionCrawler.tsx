import { useLocation } from 'react-router-dom'
import { useCouponStore } from '@/stores/CouponContext'
import { useLanguage } from '@/stores/LanguageContext'
import { useRegionFormatting } from '@/hooks/useRegionFormatting'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Globe, Box, History, Square, Loader2 } from 'lucide-react'
import { CrawlerSourcesTab } from './CrawlerSourcesTab'
import { CrawlerPromotionsTab } from './CrawlerPromotionsTab'
import { CrawlerHistoryTab } from './CrawlerHistoryTab'
import { cn } from '@/lib/utils'
import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  getCrawlerProgress,
  subscribeCrawler,
  stopExtractionTask,
} from '@/lib/crawlerTask'
import { fetchCrawlerPromotions } from '@/lib/api'
import { DiscoveredPromotion } from '@/lib/types'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'

export function PromotionCrawler({ franchiseId }: { franchiseId?: string }) {
  const { user, franchises, discoveredPromotions } = useCouponStore()
  const { t } = useLanguage()
  const location = useLocation()
  const isFranchisee = location.pathname.includes('/franchisee')

  const franchise = franchises.find((f) => f.id === franchiseId)
  const { formatNumber } = useRegionFormatting(franchise?.region)

  const [crawlerState, setCrawlerState] = useState(getCrawlerProgress())

  useEffect(() => {
    return subscribeCrawler(() => {
      setCrawlerState({ ...getCrawlerProgress() })
    })
  }, [])

  // Persist active tab
  const [activeTab, setActiveTab] = useState<string>(
    () => sessionStorage.getItem('crawler_activeTab') || 'sources',
  )

  useEffect(() => {
    sessionStorage.setItem('crawler_activeTab', activeTab)
  }, [activeTab])

  // Filters
  const [filterState, setFilterState] = useState<string>(
    () => sessionStorage.getItem('crawler_filterState') || 'all',
  )
  const [filterCity, setFilterCity] = useState<string>(
    () => sessionStorage.getItem('crawler_filterCity') || 'all',
  )
  const [filterStore, setFilterStore] = useState<string>(
    () => sessionStorage.getItem('crawler_filterStore') || 'all',
  )
  const [filterSource, setFilterSource] = useState<string>(
    () => sessionStorage.getItem('crawler_filterSource') || 'all',
  )
  const [filterCategory, setFilterCategory] = useState<string>(
    () => sessionStorage.getItem('crawler_filterCategory') || 'all',
  )
  const [filterFetchDate, setFilterFetchDate] = useState<string>(
    () => sessionStorage.getItem('crawler_filterFetchDate') || 'all',
  )

  useEffect(() => {
    sessionStorage.setItem('crawler_filterState', filterState)
    sessionStorage.setItem('crawler_filterCity', filterCity)
    sessionStorage.setItem('crawler_filterStore', filterStore)
    sessionStorage.setItem('crawler_filterSource', filterSource)
    sessionStorage.setItem('crawler_filterCategory', filterCategory)
    sessionStorage.setItem('crawler_filterFetchDate', filterFetchDate)
  }, [
    filterState,
    filterCity,
    filterStore,
    filterSource,
    filterCategory,
    filterFetchDate,
  ])

  const [dbPromotions, setDbPromotions] = useState<DiscoveredPromotion[]>([])
  const [isLoadingPromotions, setIsLoadingPromotions] = useState(false)

  const loadPromotions = useCallback(async () => {
    setIsLoadingPromotions(true)
    try {
      const response = await fetchCrawlerPromotions({ limit: 500, franchiseId })
      const data = response?.data || []
      setDbPromotions(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error('Failed to load promotions', e)
      setDbPromotions([])
    } finally {
      setIsLoadingPromotions(false)
    }
  }, [franchiseId])

  useEffect(() => {
    if (activeTab === 'promotions') {
      loadPromotions()
    }
  }, [activeTab, loadPromotions])

  useEffect(() => {
    if (!crawlerState.isScanning && activeTab === 'promotions') {
      loadPromotions()
    }
  }, [crawlerState.isScanning, activeTab, loadPromotions])

  const basePendingPromotions = useMemo(() => {
    const allPromos = Array.isArray(dbPromotions) ? dbPromotions : []

    return allPromos.filter(
      (p) =>
        p &&
        p.status === 'pending' &&
        p.storeName?.trim() &&
        p.title?.trim() &&
        p.description?.trim() &&
        (p.capturedAt || p.expiryDate),
    )
  }, [dbPromotions])

  const pendingPromotions = useMemo(() => {
    if (!Array.isArray(basePendingPromotions)) return []
    return basePendingPromotions.filter((p) => {
      if (!p) return false
      if (filterState !== 'all' && p.state !== filterState) return false
      if (filterCity !== 'all' && p.city !== filterCity) return false
      if (filterStore !== 'all' && p.storeName !== filterStore) return false
      if (filterCategory !== 'all' && p.category !== filterCategory)
        return false
      if (filterSource !== 'all' && p.sourceId !== filterSource) return false
      if (filterFetchDate !== 'all') {
        const pDate = p.capturedAt ? p.capturedAt.split('T')[0] : ''
        if (pDate !== filterFetchDate) return false
      }
      return true
    })
  }, [
    basePendingPromotions,
    filterState,
    filterCity,
    filterStore,
    filterSource,
    filterCategory,
    filterFetchDate,
  ])

  const pendingPromotionsCount = pendingPromotions.length

  return (
    <div
      className={cn('space-y-6 w-full', !isFranchisee && 'min-w-0 max-w-full')}
    >
      <Card className="min-w-0 overflow-hidden w-full max-w-full">
        <CardHeader className="min-w-0 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
              <CardTitle className="truncate">
                {t('franchisee.crawler.title', 'Gerenciamento de Crawler')}
              </CardTitle>
              <CardDescription className="truncate">
                {t(
                  'franchisee.crawler.desc',
                  'Configure fontes externas para capturar e importar ofertas para a plataforma.',
                )}
              </CardDescription>
            </div>
            {crawlerState.isScanning && (
              <Button
                variant="destructive"
                size="sm"
                onClick={stopExtractionTask}
              >
                <Square className="w-4 h-4 mr-2" fill="currentColor" />
                Parar Busca
              </Button>
            )}
          </div>

          {crawlerState.isScanning && (
            <div className="p-4 bg-slate-50 border rounded-lg space-y-3 animate-in fade-in slide-in-from-top-4">
              <div className="flex justify-between text-sm font-medium">
                <span className="flex items-center text-blue-600">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Buscando ofertas...
                </span>
                <span>
                  {crawlerState.current} / {crawlerState.total}
                </span>
              </div>
              <Progress
                value={
                  (crawlerState.current / Math.max(crawlerState.total, 1)) * 100
                }
                className="h-2"
              />
              <div className="flex gap-4 text-xs font-medium text-slate-500">
                <span>
                  Encontrados:{' '}
                  <strong className="text-slate-900">
                    {crawlerState.found}
                  </strong>
                </span>
                <span className="text-green-600">
                  Importados: <strong>{crawlerState.imported}</strong>
                </span>
                <span className="text-red-500">
                  Descartados: <strong>{crawlerState.errors}</strong>
                </span>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent className="p-4 sm:p-6 min-w-0 overflow-x-hidden pt-0 sm:pt-0">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="min-w-0 w-full"
          >
            <TabsList className="mb-6 w-full justify-start h-auto p-1 bg-slate-100 flex-wrap overflow-x-auto hide-scrollbar">
              <TabsTrigger
                value="sources"
                className="py-2 px-4 whitespace-nowrap"
              >
                <Globe className="h-4 w-4 mr-2 shrink-0" />
                {t('franchisee.crawler.sources', 'Fontes de Dados')}
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="py-2 px-4 whitespace-nowrap"
              >
                <History className="h-4 w-4 mr-2 shrink-0" />
                {t('franchisee.crawler.history', 'Histórico de Buscas')}
              </TabsTrigger>
              <TabsTrigger
                value="promotions"
                className="py-2 px-4 whitespace-nowrap"
              >
                <Box className="h-4 w-4 mr-2 shrink-0" />
                {t('franchisee.crawler.promotions', 'Ofertas Pendentes')} (
                {formatNumber(pendingPromotionsCount)})
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="sources"
              className="animate-in fade-in-50 min-w-0 w-full"
            >
              <CrawlerSourcesTab />
            </TabsContent>

            <TabsContent
              value="history"
              className="animate-in fade-in-50 min-w-0 w-full"
            >
              <CrawlerHistoryTab isScanning={crawlerState.isScanning} />
            </TabsContent>

            <TabsContent
              value="promotions"
              className="animate-in fade-in-50 min-w-0 w-full"
            >
              {!isLoadingPromotions &&
              pendingPromotions.length === 0 &&
              basePendingPromotions.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
                  <p className="text-slate-500 font-medium">
                    {t(
                      'franchisee.crawler.empty',
                      'Nenhuma promoção pendente encontrada no momento.',
                    )}
                  </p>
                </div>
              ) : (
                <CrawlerPromotionsTab
                  pendingPromotions={pendingPromotions}
                  basePendingPromotions={basePendingPromotions}
                  filterState={filterState}
                  setFilterState={setFilterState}
                  filterCity={filterCity}
                  setFilterCity={setFilterCity}
                  filterStore={filterStore}
                  setFilterStore={setFilterStore}
                  filterSource={filterSource}
                  setFilterSource={setFilterSource}
                  filterCategory={filterCategory}
                  setFilterCategory={setFilterCategory}
                  filterFetchDate={filterFetchDate}
                  setFilterFetchDate={setFilterFetchDate}
                  isLoading={isLoadingPromotions}
                />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
