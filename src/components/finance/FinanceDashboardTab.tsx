import { useState } from 'react'
import { TransactionsList } from './TransactionsList'
import { BankReconciliation } from './BankReconciliation'
import { BillingHistoryTab } from '@/components/admin/billing/BillingHistoryTab'
import { useLanguage } from '@/stores/LanguageContext'
import { Wallet, LineChart, CheckSquare, Receipt } from 'lucide-react'
import { cn } from '@/lib/utils'

export function FinanceDashboardTab({ franchiseId }: { franchiseId?: string }) {
  const { t } = useLanguage()
  const [activeView, setActiveView] = useState<
    'statement' | 'reconciliation' | 'billing'
  >('statement')

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
          <Wallet className="w-6 h-6 text-primary" />
          {t('finance.dashboard_title', 'Finance')}
        </h2>
        <p className="text-muted-foreground text-sm">
          {t(
            'finance.dashboard_desc',
            'Manage statements, track future projections, and reconcile bank accounts.',
          )}
        </p>
      </div>

      <div className="w-full">
        <div className="flex items-center gap-1 mb-6 bg-slate-100 p-1 rounded-lg border border-slate-200 w-fit overflow-x-auto">
          <button
            onClick={() => setActiveView('statement')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap',
              activeView === 'statement'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50',
            )}
          >
            <LineChart className="w-4 h-4" />
            {t('finance.statement_tab', 'Statement & Projections')}
          </button>
          <button
            onClick={() => setActiveView('reconciliation')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap',
              activeView === 'reconciliation'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50',
            )}
          >
            <CheckSquare className="w-4 h-4" />
            {t('finance.reconciliation', 'Bank Reconciliation')}
          </button>
          <button
            onClick={() => setActiveView('billing')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap',
              activeView === 'billing'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50',
            )}
          >
            <Receipt className="w-4 h-4" />
            {t('finance.billing', 'Billing')}
          </button>
        </div>

        <div className="mt-0">
          {activeView === 'statement' && (
            <TransactionsList franchiseId={franchiseId} />
          )}
          {activeView === 'reconciliation' && (
            <BankReconciliation franchiseId={franchiseId} />
          )}
          {activeView === 'billing' && (
            <BillingHistoryTab franchiseId={franchiseId} />
          )}
        </div>
      </div>
    </div>
  )
}
