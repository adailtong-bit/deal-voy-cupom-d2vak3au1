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
import { Globe, Box } from 'lucide-react'
import { CrawlerSourcesTab } from './CrawlerSourcesTab'
import { CrawlerPromotionsTab } from './CrawlerPromotionsTab'

export function PromotionCrawler({ franchiseId }: { franchiseId?: string }) {
  const { user, discoveredPromotions, franchises } = useCouponStore()
  const { t } = useLanguage()

  const franchise = franchises.find((f) => f.id === franchiseId)
  const { formatNumber } = useRegionFormatting(franchise?.region)

  const pendingPromotionsCount = discoveredPromotions.filter((p) => {
    if (p.status !== 'pending') return false
    if (franchiseId) {
      return p.franchiseId === franchiseId || p.region === user?.region
    }
    return true
  }).length

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {t('franchisee.crawler.title', 'Gerenciamento de Crawler')}
          </CardTitle>
          <CardDescription>
            {t(
              'franchisee.crawler.desc',
              'Configure fontes externas para capturar e importar ofertas para a plataforma.',
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="sources">
            <TabsList className="mb-6 w-full justify-start h-auto p-1 bg-slate-100">
              <TabsTrigger value="sources" className="py-2 px-4">
                <Globe className="h-4 w-4 mr-2" />{' '}
                {t('franchisee.crawler.sources', 'Fontes de Dados')}
              </TabsTrigger>
              <TabsTrigger value="promotions" className="py-2 px-4">
                <Box className="h-4 w-4 mr-2" />{' '}
                {t(
                  'franchisee.crawler.promotions',
                  'Ofertas Importadas',
                ).replace('{count}', formatNumber(pendingPromotionsCount))}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="sources" className="animate-in fade-in-50">
              <CrawlerSourcesTab />
            </TabsContent>

            <TabsContent value="promotions" className="animate-in fade-in-50">
              <CrawlerPromotionsTab />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
