import { useMemo } from 'react'
import { useCouponStore } from '@/stores/CouponContext'
import { useLanguage } from '@/stores/LanguageContext'

export interface FinancialEntry {
  id: string
  date: string
  desc: string
  category: string
  amount: number
  type: 'in' | 'out'
  status: 'completed' | 'pending' | 'future'
  entityId?: string
}

export function useFinanceData(franchiseId?: string) {
  const { partnerInvoices, ads, platformSettings } = useCouponStore()
  const { t } = useLanguage()

  const data = useMemo(() => {
    const royaltyRate = platformSettings?.franchiseRoyaltyRate || 15
    const transactions: FinancialEntry[] = []

    ads.forEach((ad) => {
      if (franchiseId && ad.franchiseId !== franchiseId) return
      const amt = ad.price || ad.budget || 0
      const isCompleted = ad.status === 'active' || ad.status === 'ended'

      transactions.push({
        id: `ad_inc_${ad.id}`,
        date: ad.startDate || new Date().toISOString(),
        desc: `${t('finance.ad_sales', 'Ad Sales')}: ${ad.title}`,
        category: 'Sales',
        amount: amt,
        type: 'in',
        status: isCompleted ? 'completed' : 'future',
        entityId: ad.franchiseId,
      })

      transactions.push({
        id: `royalty_${ad.id}`,
        date: ad.startDate || new Date().toISOString(),
        desc: `${t('finance.royalty', 'Royalties')} (${royaltyRate}%): ${ad.title}`,
        category: 'Royalties',
        amount: amt * (royaltyRate / 100),
        type: 'out',
        status: isCompleted ? 'completed' : 'future',
        entityId: ad.franchiseId,
      })
    })

    partnerInvoices.forEach((inv) => {
      if (franchiseId && inv.franchiseId !== franchiseId) return

      let status: FinancialEntry['status'] = 'completed'
      if (['draft', 'pending', 'invoiced', 'sent'].includes(inv.status)) {
        status = 'future'
      }

      transactions.push({
        id: `inv_${inv.id}`,
        date: inv.issueDate || new Date().toISOString(),
        desc: `${t('finance.invoice', 'Invoice')}: ${inv.referenceNumber}`,
        category: 'Fees',
        amount: inv.totalCommission,
        type: 'in',
        status,
        entityId: inv.franchiseId,
      })
    })

    if (transactions.length === 0) {
      transactions.push({
        id: 'initial',
        date: new Date(Date.now() - 30 * 86400000).toISOString(),
        desc: t('finance.initial_deposit', 'Initial Deposit'),
        category: 'Deposit',
        amount: 1000,
        type: 'in',
        status: 'completed',
        entityId: franchiseId,
      })
    }

    transactions.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    )

    return transactions
  }, [ads, partnerInvoices, platformSettings, franchiseId, t])

  return data
}
