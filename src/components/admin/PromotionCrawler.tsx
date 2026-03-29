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
import { useState, useEffect } from 'react'
import { fetchCrawlerPromotions } from '@/lib/api'

export function PromotionCrawler({ franchiseId }: { franchiseId?: string }) {
  const { user, franchises } = useCouponStore()
  const { t } = useLanguage()
  const location = useLocation()
  const isFranchisee = location.pathname.includes('/franchisee')

  const franchise = franchises.find((f) => f.id === franchiseId)
  const { formatNumber } = useRegionFormatting(franchise?.region)

  const [pendingPromotionsCount, setPendingPromotionsCount] = useState(0)

  // Persist active tab
  const [activeTab, setActiveTab] = useState<string>(
    () => sessionStorage.getItem('crawler_activeTab') || 'sources',
  )

  useEffect(() => {
    sessionStorage.setItem('crawler_activeTab', activeTab)
  }, [activeTab])

  // Real-Time Synchronization via Optimized Polling
  useEffect(() => {
    let isMounted = true

    const pollPromotions = async () => {
      try {
        const res = await fetchCrawlerPromotions({
          franchiseId,
          region: user?.region,
          limit: 1, // We only need total count here
        })
        if (isMounted) {
          setPendingPromotionsCount(res.total)
        }
      } catch (err) {
        console.error('Failed to poll crawler promotions', err)
      }
    }

    pollPromotions()
    const interval = setInterval(pollPromotions, 10000) // Poll every 10s

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [franchiseId, user?.region])

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
              <CrawlerPromotionsTab />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
