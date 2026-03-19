import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AdPricingTab } from './AdPricingTab'
import { AdvertisersTab } from './AdvertisersTab'
import { AdCampaignsTab } from './AdCampaignsTab'
import { AdBillingTab } from './AdBillingTab'
import { LayoutDashboard, Users, DollarSign, FileText } from 'lucide-react'

export function AdminAdsManager() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Gestão de Publicidade</h2>
        <p className="text-muted-foreground">
          Gerencie anunciantes, preços, campanhas e cobranças.
        </p>
      </div>

      <Tabs defaultValue="campaigns" className="w-full">
        <TabsList className="mb-4 flex flex-wrap h-auto">
          <TabsTrigger value="campaigns">
            <LayoutDashboard className="h-4 w-4 mr-2" /> Campanhas
          </TabsTrigger>
          <TabsTrigger value="advertisers">
            <Users className="h-4 w-4 mr-2" /> Anunciantes
          </TabsTrigger>
          <TabsTrigger value="pricing">
            <DollarSign className="h-4 w-4 mr-2" /> Tabela de Preços
          </TabsTrigger>
          <TabsTrigger value="billing">
            <FileText className="h-4 w-4 mr-2" /> Cobranças
          </TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="animate-in fade-in-50">
          <AdCampaignsTab />
        </TabsContent>
        <TabsContent value="advertisers" className="animate-in fade-in-50">
          <AdvertisersTab />
        </TabsContent>
        <TabsContent value="pricing" className="animate-in fade-in-50">
          <AdPricingTab />
        </TabsContent>
        <TabsContent value="billing" className="animate-in fade-in-50">
          <AdBillingTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
