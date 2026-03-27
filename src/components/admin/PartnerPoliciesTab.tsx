import { useState } from 'react'
import { useSearchParams, useLocation } from 'react-router-dom'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useLanguage } from '@/stores/LanguageContext'
import { useRegionFormatting } from '@/hooks/useRegionFormatting'
import { useCouponStore } from '@/stores/CouponContext'
import { PartnerPolicy } from '@/lib/types'
import { cn } from '@/lib/utils'

export function PartnerPoliciesTab({ franchiseId }: { franchiseId?: string }) {
  const { t } = useLanguage()
  const {
    partnerPolicies,
    companies,
    updatePartnerPolicy,
    deletePartnerPolicy,
    franchises,
  } = useCouponStore()
  const [searchParams] = useSearchParams()
  const searchQuery = (searchParams.get('q') || '').toLowerCase()
  const location = useLocation()
  const isFranchisee = location.pathname.includes('/franchisee')

  const franchise = franchises.find((f) => f.id === franchiseId)
  const { formatNumber } = useRegionFormatting(franchise?.region)

  const displayCompanies = franchiseId
    ? companies.filter((c) => c.franchiseId === franchiseId)
    : companies
  const companyIds = displayCompanies.map((c) => c.id)

  const getCompanyName = (id: string) =>
    displayCompanies.find((c) => c.id === id)?.name || id

  const displayPolicies = (
    franchiseId
      ? partnerPolicies.filter((p) => companyIds.includes(p.companyId))
      : partnerPolicies
  ).filter((p) => {
    if (!searchQuery) return true
    return (
      getCompanyName(p.companyId).toLowerCase().includes(searchQuery) ||
      p.billingModel.toLowerCase().includes(searchQuery)
    )
  })

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPolicy, setEditingPolicy] = useState<PartnerPolicy | null>(null)

  const [formData, setFormData] = useState<Partial<PartnerPolicy>>({
    companyId: '',
    commissionRate: 0,
    cashbackRate: 0,
    billingModel: 'CPA',
  })

  const handleOpenDialog = (policy?: PartnerPolicy) => {
    if (policy) {
      setEditingPolicy(policy)
      setFormData(policy)
    } else {
      setEditingPolicy(null)
      setFormData({
        companyId: displayCompanies[0]?.id || '',
        commissionRate: 0,
        cashbackRate: 0,
        billingModel: 'CPA',
      })
    }
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    const newPolicy: PartnerPolicy = {
      id: editingPolicy?.id || Math.random().toString(),
      companyId: formData.companyId || displayCompanies[0]?.id || '',
      billingModel: (formData.billingModel as any) || 'CPA',
      commissionRate: formData.commissionRate || 0,
      cashbackRate: formData.cashbackRate || 0,
      cpcValue: formData.cpcValue || 0,
      fixedFee: formData.fixedFee || 0,
      billingCycle: formData.billingCycle || 'monthly',
      taxId: formData.taxId || '',
      contractTerms: formData.contractTerms || '',
    }
    updatePartnerPolicy(newPolicy)
    setIsDialogOpen(false)
  }

  const handleDelete = (id: string) => {
    deletePartnerPolicy(id)
  }

  return (
    <div
      className={cn(
        'space-y-6 animate-fade-in-up w-full',
        !isFranchisee && 'min-w-0 max-w-full',
      )}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 min-w-0">
        <h2 className="text-xl font-semibold tracking-tight truncate">
          {t('admin.policies')}
        </h2>
        <Button
          onClick={() => handleOpenDialog()}
          className="shrink-0 w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          {t('admin.addPolicy')}
        </Button>
      </div>

      <div
        className={cn(
          'rounded-md border bg-card w-full',
          !isFranchisee && 'overflow-hidden min-w-0',
        )}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">
                {t('admin.partner')}
              </TableHead>
              <TableHead className="whitespace-nowrap">
                {t('admin.commission')}
              </TableHead>
              <TableHead className="whitespace-nowrap">
                {t('admin.cashback')}
              </TableHead>
              <TableHead className="whitespace-nowrap">
                {t('admin.billingModel')}
              </TableHead>
              <TableHead className="text-right whitespace-nowrap">
                {t('admin.action')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayPolicies.map((policy) => (
              <TableRow key={policy.id}>
                <TableCell
                  className="font-medium whitespace-nowrap max-w-[200px] truncate"
                  title={getCompanyName(policy.companyId)}
                >
                  {getCompanyName(policy.companyId)}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {formatNumber(policy.commissionRate)}%
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {formatNumber(policy.cashbackRate)}%
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {t(`admin.${policy.billingModel.toLowerCase()}`) ||
                    policy.billingModel}
                </TableCell>
                <TableCell className="text-right whitespace-nowrap">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenDialog(policy)}
                  >
                    <Edit2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(policy.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {displayPolicies.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                >
                  No policies found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingPolicy ? t('admin.editPolicy') : t('admin.addPolicy')}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>{t('admin.partner')}</Label>
              <Select
                value={formData.companyId}
                onValueChange={(v) =>
                  setFormData({ ...formData, companyId: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('admin.partner')} />
                </SelectTrigger>
                <SelectContent>
                  {displayCompanies.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('admin.commission')}</Label>
                <Input
                  type="number"
                  value={formData.commissionRate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      commissionRate: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{t('admin.cashback')}</Label>
                <Input
                  type="number"
                  value={formData.cashbackRate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      cashbackRate: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t('admin.billingModel')}</Label>
              <Select
                value={formData.billingModel}
                onValueChange={(v: any) =>
                  setFormData({ ...formData, billingModel: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('admin.billingModel')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CPA">{t('admin.cpa')}</SelectItem>
                  <SelectItem value="CPC">{t('admin.cpc')}</SelectItem>
                  <SelectItem value="monthly">{t('admin.fixed')}</SelectItem>
                  <SelectItem value="global">Global</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {t('admin.cancel')}
            </Button>
            <Button onClick={handleSave}>{t('admin.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
