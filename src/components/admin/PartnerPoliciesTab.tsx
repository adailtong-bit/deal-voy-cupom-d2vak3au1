import { useState } from 'react'
import { useCouponStore } from '@/stores/CouponContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { PartnerPolicy } from '@/lib/types'
import { useLanguage } from '@/stores/LanguageContext'
import { Edit, Trash2, Plus } from 'lucide-react'

export function PartnerPoliciesTab() {
  const {
    partnerPolicies,
    companies,
    updatePartnerPolicy,
    deletePartnerPolicy,
  } = useCouponStore()
  const { t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [form, setForm] = useState<Partial<PartnerPolicy>>({})

  const handleSave = () => {
    if (!form.companyId || !form.billingModel) return
    const policy: PartnerPolicy = {
      id: form.id || Math.random().toString(),
      companyId: form.companyId,
      billingModel: form.billingModel as any,
      commissionRate: form.commissionRate || 0,
      cashbackRate: form.cashbackRate || 0,
      cpcValue: form.cpcValue || 0,
      fixedFee: form.fixedFee || 0,
      billingCycle: form.billingCycle || 'monthly',
      taxId: form.taxId || '',
      contractTerms: form.contractTerms || '',
    }
    updatePartnerPolicy(policy)
    setIsOpen(false)
    setForm({})
  }

  const openEdit = (p: PartnerPolicy) => {
    setForm(p)
    setIsOpen(true)
  }

  const handleNew = () => {
    setForm({ billingModel: 'global', billingCycle: 'monthly' })
    setIsOpen(true)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{t('admin.partner_policies')}</CardTitle>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={handleNew}>
              <Plus className="h-4 w-4" /> {t('admin.add_policy')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {form.id ? t('common.edit') : t('admin.add_policy')}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{t('ads.company')}</Label>
                <Select
                  value={form.companyId}
                  onValueChange={(val) => setForm({ ...form, companyId: val })}
                  disabled={!!form.id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('common.select')} />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t('admin.billing_model')}</Label>
                <Select
                  value={form.billingModel}
                  onValueChange={(val) =>
                    setForm({ ...form, billingModel: val as any })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('common.select')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="global">Global Default</SelectItem>
                    <SelectItem value="CPA">CPA (Cost per Action)</SelectItem>
                    <SelectItem value="CPC">CPC (Cost per Click)</SelectItem>
                    <SelectItem value="monthly">Monthly Fixed Fee</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(form.billingModel === 'CPA' ||
                form.billingModel === 'global') && (
                <div className="space-y-2">
                  <Label>{t('admin.standard_commission')} (%)</Label>
                  <Input
                    type="number"
                    value={form.commissionRate || ''}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        commissionRate: Number(e.target.value),
                      })
                    }
                  />
                </div>
              )}

              {form.billingModel === 'CPC' && (
                <div className="space-y-2">
                  <Label>{t('admin.cpc_value')}</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.cpcValue || ''}
                    onChange={(e) =>
                      setForm({ ...form, cpcValue: Number(e.target.value) })
                    }
                  />
                </div>
              )}

              {form.billingModel === 'monthly' && (
                <div className="space-y-2">
                  <Label>{t('admin.fixed_fee')}</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.fixedFee || ''}
                    onChange={(e) =>
                      setForm({ ...form, fixedFee: Number(e.target.value) })
                    }
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>User Cashback Rate (%)</Label>
                <Input
                  type="number"
                  value={form.cashbackRate || ''}
                  onChange={(e) =>
                    setForm({ ...form, cashbackRate: Number(e.target.value) })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>{t('admin.billing_cycle')}</Label>
                <Select
                  value={form.billingCycle}
                  onValueChange={(val) =>
                    setForm({ ...form, billingCycle: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('common.select')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleSave}>{t('common.save')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('ads.company')}</TableHead>
              <TableHead>{t('admin.billing_model')}</TableHead>
              <TableHead>Commission / Fee</TableHead>
              <TableHead>Cashback</TableHead>
              <TableHead>{t('admin.billing_cycle')}</TableHead>
              <TableHead className="text-right">{t('admin.action')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {partnerPolicies.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground"
                >
                  No policies defined.
                </TableCell>
              </TableRow>
            )}
            {partnerPolicies.map((p) => {
              const company = companies.find((c) => c.id === p.companyId)
              return (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">
                    {company?.name || 'Unknown'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{p.billingModel}</Badge>
                  </TableCell>
                  <TableCell>
                    {p.billingModel === 'CPA' || p.billingModel === 'global'
                      ? `${p.commissionRate}%`
                      : p.billingModel === 'CPC'
                        ? `$${p.cpcValue} / click`
                        : `$${p.fixedFee} / mo`}
                  </TableCell>
                  <TableCell>{p.cashbackRate}%</TableCell>
                  <TableCell className="capitalize">{p.billingCycle}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEdit(p)}
                    >
                      <Edit className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deletePartnerPolicy(p.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
