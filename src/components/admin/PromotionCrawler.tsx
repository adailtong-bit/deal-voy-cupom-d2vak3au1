import { useCouponStore } from '@/stores/CouponContext'
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

export function PromotionCrawler() {
  const { user, discoveredPromotions } = useCouponStore()

  const isFranchisee = user?.role === 'franchisee'

  const pendingPromotionsCount = discoveredPromotions.filter(
    (p) =>
      p.status === 'pending' && (!isFranchisee || p.region === user?.region),
  ).length

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Crawler Management</CardTitle>
          <CardDescription>
            Configure external sources to scrape and automatically import deals
            into the platform. Review captured data before publishing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="sources">
            <TabsList className="mb-6 w-full justify-start h-auto p-1 bg-slate-100">
              <TabsTrigger value="sources" className="py-2 px-4">
                <Globe className="h-4 w-4 mr-2" /> Data Sources
              </TabsTrigger>
              <TabsTrigger value="promotions" className="py-2 px-4">
                <Box className="h-4 w-4 mr-2" /> Imported Offers (
                {pendingPromotionsCount})
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
