import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BillingGenerationTab } from './billing/BillingGenerationTab'
import { BillingStagingTab } from './billing/BillingStagingTab'
import { BillingHistoryTab } from './billing/BillingHistoryTab'

export function PartnerBillingTab({ franchiseId }: { franchiseId?: string }) {
  return (
    <div className="space-y-6 animate-fade-in-up w-full max-w-full min-w-0">
      <Tabs defaultValue="generation" className="w-full">
        <TabsList className="mb-4 flex flex-wrap h-auto p-1 bg-slate-100 min-w-0 max-w-full overflow-x-auto hide-scrollbar justify-start">
          <TabsTrigger
            value="generation"
            className="py-2.5 px-4 font-semibold whitespace-nowrap"
          >
            Geração de Faturas
          </TabsTrigger>
          <TabsTrigger
            value="staging"
            className="py-2.5 px-4 font-semibold whitespace-nowrap"
          >
            Área de Preparação (Rascunhos)
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="py-2.5 px-4 font-semibold whitespace-nowrap"
          >
            Histórico e Gestão
          </TabsTrigger>
        </TabsList>
        <TabsContent value="generation" className="mt-0 min-w-0 w-full">
          <BillingGenerationTab franchiseId={franchiseId} />
        </TabsContent>
        <TabsContent value="staging" className="mt-0 min-w-0 w-full">
          <BillingStagingTab franchiseId={franchiseId} />
        </TabsContent>
        <TabsContent value="history" className="mt-0 min-w-0 w-full">
          <BillingHistoryTab franchiseId={franchiseId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
