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
import { Globe, Box, History } from 'lucide-react'
import { CrawlerSourcesTab } from './CrawlerSourcesTab'
import { CrawlerPromotionsTab } from './CrawlerPromotionsTab'
import { CrawlerHistoryTab } from './CrawlerHistoryTab'
import { cn } from '@/lib/utils'
import { useState, useEffect, useMemo } from 'react'

export function PromotionCrawler({ franchiseId }: { franchiseId?: string }) {
  const { user, franchises, discoveredPromotions } = useCouponStore()
  const { t } = useLanguage()
  const location = useLocation()
  const isFranchisee = location.pathname.includes('/franchisee')

  const franchise = franchises.find((f) => f.id === franchiseId)
  const { formatNumber } = useRegionFormatting(franchise?.region)

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

  const basePendingPromotions = useMemo(
    () =>
      discoveredPromotions.filter(
        (p) =>
          p.status === 'pending' &&
          p.storeName?.trim() &&
          p.title?.trim() &&
          p.description?.trim() &&
          (p.capturedAt || p.expiryDate),
      ),
    [discoveredPromotions],
  )

  const pendingPromotions = useMemo(() => {
    return basePendingPromotions.filter((p) => {
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
        <CardHeader className="min-w-0">
          <CardTitle className="truncate">
            {t('franchisee.crawler.title', 'Gerenciamento de Crawler')}
          </CardTitle>
          <CardDescription className="truncate">
            {t(
              'franchisee.crawler.desc',
              'Configure fontes externas para capturar e importar ofertas para a plataforma.',
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 min-w-0 overflow-x-hidden">
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
              <CrawlerHistoryTab />
            </TabsContent>

            <TabsContent
              value="promotions"
              className="animate-in fade-in-50 min-w-0 w-full"
            >
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
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
