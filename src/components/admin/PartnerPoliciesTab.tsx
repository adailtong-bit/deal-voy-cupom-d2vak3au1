import { useState } from 'react'
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

type Policy = {
  id: string
  partnerName: string
  commission: number
  cashback: number
  billingModel: 'CPA' | 'CPC' | 'Fixed'
}

const initialPolicies: Policy[] = [
  {
    id: '1',
    partnerName: 'Restaurante Sabor',
    commission: 10,
    cashback: 5,
    billingModel: 'CPA',
  },
  {
    id: '2',
    partnerName: 'Hotel Paraíso',
    commission: 15,
    cashback: 2,
    billingModel: 'Fixed',
  },
]

export function PartnerPoliciesTab() {
  const { t } = useLanguage()
  const [policies, setPolicies] = useState<Policy[]>(initialPolicies)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null)

  const [formData, setFormData] = useState<Partial<Policy>>({
    partnerName: '',
    commission: 0,
    cashback: 0,
    billingModel: 'CPA',
  })

  const handleOpenDialog = (policy?: Policy) => {
    if (policy) {
      setEditingPolicy(policy)
      setFormData(policy)
    } else {
      setEditingPolicy(null)
      setFormData({
        partnerName: '',
        commission: 0,
        cashback: 0,
        billingModel: 'CPA',
      })
    }
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    if (editingPolicy) {
      setPolicies(
        policies.map((p) =>
          p.id === editingPolicy.id ? ({ ...formData, id: p.id } as Policy) : p,
        ),
      )
    } else {
      setPolicies([
        ...policies,
        { ...formData, id: Math.random().toString() } as Policy,
      ])
    }
    setIsDialogOpen(false)
  }

  const handleDelete = (id: string) => {
    setPolicies(policies.filter((p) => p.id !== id))
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-tight">
          {t('admin.policies')}
        </h2>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          {t('admin.addPolicy')}
        </Button>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('admin.partner')}</TableHead>
              <TableHead>{t('admin.commission')}</TableHead>
              <TableHead>{t('admin.cashback')}</TableHead>
              <TableHead>{t('admin.billingModel')}</TableHead>
              <TableHead className="text-right">{t('admin.action')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {policies.map((policy) => (
              <TableRow key={policy.id}>
                <TableCell className="font-medium">
                  {policy.partnerName}
                </TableCell>
                <TableCell>{policy.commission}%</TableCell>
                <TableCell>{policy.cashback}%</TableCell>
                <TableCell>
                  {t(`admin.${policy.billingModel.toLowerCase()}`)}
                </TableCell>
                <TableCell className="text-right">
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
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingPolicy ? t('admin.editPolicy') : t('admin.addPolicy')}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>{t('admin.partner')}</Label>
              <Input
                value={formData.partnerName}
                onChange={(e) =>
                  setFormData({ ...formData, partnerName: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('admin.commission')}</Label>
                <Input
                  type="number"
                  value={formData.commission}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      commission: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{t('admin.cashback')}</Label>
                <Input
                  type="number"
                  value={formData.cashback}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      cashback: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t('admin.billingModel')}</Label>
              <Select
                value={formData.billingModel}
                onValueChange={(v: 'CPA' | 'CPC' | 'Fixed') =>
                  setFormData({ ...formData, billingModel: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('admin.billingModel')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CPA">{t('admin.cpa')}</SelectItem>
                  <SelectItem value="CPC">{t('admin.cpc')}</SelectItem>
                  <SelectItem value="Fixed">{t('admin.fixed')}</SelectItem>
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
