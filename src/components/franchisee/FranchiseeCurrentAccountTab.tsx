import { useLanguage } from '@/stores/LanguageContext'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TransactionsList } from '../finance/TransactionsList'
import { FutureForecasting } from '../finance/FutureForecasting'
import { BankReconciliation } from '../finance/BankReconciliation'

export function FranchiseeCurrentAccountTab({
  franchiseId,
}: {
  franchiseId?: string
}) {
  const { t } = useLanguage()

  return (
    <div className="space-y-6 animate-fade-in-up w-full max-w-full">
      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="mb-6 grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="transactions">
            {t('finance.transactions', 'Extrato')}
          </TabsTrigger>
          <TabsTrigger value="forecasting">
            {t('finance.forecasting', 'Previsões')}
          </TabsTrigger>
          <TabsTrigger value="reconciliation">
            {t('finance.reconciliation', 'Conciliação')}
          </TabsTrigger>
        </TabsList>
        <TabsContent
          value="transactions"
          className="m-0 focus-visible:outline-none focus-visible:ring-0"
        >
          <TransactionsList franchiseId={franchiseId} />
        </TabsContent>
        <TabsContent
          value="forecasting"
          className="m-0 focus-visible:outline-none focus-visible:ring-0"
        >
          <FutureForecasting franchiseId={franchiseId} />
        </TabsContent>
        <TabsContent
          value="reconciliation"
          className="m-0 focus-visible:outline-none focus-visible:ring-0"
        >
          <BankReconciliation franchiseId={franchiseId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
