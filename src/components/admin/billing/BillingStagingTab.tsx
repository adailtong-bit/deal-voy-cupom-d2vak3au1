import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
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
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCouponStore } from '@/stores/CouponContext'
import { useRegionFormatting } from '@/hooks/useRegionFormatting'
import { PartnerInvoice } from '@/lib/types'
import { Send, Trash2, Edit2, CalendarIcon } from 'lucide-react'
import { toast } from 'sonner'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

export function BillingStagingTab({ franchiseId }: { franchiseId?: string }) {
  const {
    partnerInvoices,
    companies,
    franchises,
    updatePartnerInvoiceStatus,
    updatePartnerInvoice,
    user,
  } = useCouponStore()
  const myFranchise = franchises.find((f) => f.id === franchiseId)
  const { formatCurrency, formatShortDate } = useRegionFormatting(
    myFranchise?.region,
  )

  const isSuperAdmin = user?.role === 'super_admin'

  const companyIds = franchiseId
    ? companies.filter((c) => c.franchiseId === franchiseId).map((c) => c.id)
    : companies.map((c) => c.id)

  const stagingInvoices = partnerInvoices.filter((i) => {
    if (i.status !== 'draft') return false
    if (franchiseId) {
      return i.targetType === 'merchant' && companyIds.includes(i.companyId)
    }
    return true
  })

  const getTargetName = (inv: PartnerInvoice) => {
    if (inv.targetType === 'franchise') {
      return franchises.find((f) => f.id === inv.franchiseId)?.name || inv.id
    }
    return companies.find((c) => c.id === inv.companyId)?.name || inv.id
  }

  const handleSend = (id: string) => {
    updatePartnerInvoiceStatus(id, 'pending')
    toast.success('Fatura enviada e movida para o Histórico.')
  }

  const handleCancel = (id: string) => {
    updatePartnerInvoiceStatus(id, 'canceled')
    toast.success('Fatura cancelada.')
  }

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingInvoice, setEditingInvoice] = useState<PartnerInvoice | null>(
    null,
  )
  const [editData, setEditData] = useState<Partial<PartnerInvoice>>({})

  const openEdit = (inv: PartnerInvoice) => {
    setEditingInvoice(inv)
    setEditData({
      ...inv,
      collectorId: inv.collectorId || (franchiseId ? franchiseId : 'app_owner'),
      description:
        inv.description ||
        `Faturamento do período ${formatShortDate(inv.periodStart)} a ${formatShortDate(inv.periodEnd)}`,
      paymentInstructions: inv.paymentInstructions || '',
      dueDate: inv.dueDate || new Date().toISOString(),
    })
    setIsEditDialogOpen(true)
  }

  const saveEdit = () => {
    if (editingInvoice) {
      updatePartnerInvoice(editingInvoice.id, editData)
      setIsEditDialogOpen(false)
    }
  }

  const availableCollectors = isSuperAdmin
    ? [{ id: 'app_owner', name: 'App Owner (Global)' }, ...franchises]
    : [myFranchise].filter(Boolean)

  const availableTargets =
    editData.targetType === 'franchise'
      ? franchises
      : companies.filter((c) => isSuperAdmin || c.franchiseId === franchiseId)

  return (
    <Card className="min-w-0 w-full animate-fade-in-up">
      <CardHeader>
        <CardTitle>Área de Preparação (Rascunhos)</CardTitle>
        <CardDescription>
          Revise, edite e aprove as faturas geradas antes de enviá-las
          oficialmente aos destinatários.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ref</TableHead>
                <TableHead>Destinatário</TableHead>
                <TableHead>Período</TableHead>
                <TableHead>Itens</TableHead>
                <TableHead className="text-right">Valor Total</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stagingInvoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-medium text-xs">
                    {inv.referenceNumber}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {getTargetName(inv)}
                  </TableCell>
                  <TableCell className="text-xs whitespace-nowrap">
                    {formatShortDate(inv.periodStart)} -{' '}
                    {formatShortDate(inv.periodEnd)}
                  </TableCell>
                  <TableCell>{inv.transactionCount}</TableCell>
                  <TableCell className="text-right font-bold whitespace-nowrap">
                    {formatCurrency(inv.totalCommission)}
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEdit(inv)}
                      className="mr-1 text-slate-500 hover:text-primary hover:bg-primary/5"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => handleSend(inv.id)}
                      size="sm"
                      className="mr-2"
                    >
                      <Send className="w-3 h-3 mr-2" />
                      Enviar
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCancel(inv.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {stagingInvoices.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Nenhuma fatura em preparação.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Editar Fatura - {editingInvoice?.referenceNumber}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cobrador (Recebedor)</Label>
                <Select
                  value={editData.collectorId}
                  onValueChange={(v) =>
                    setEditData({ ...editData, collectorId: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cobrador" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCollectors.map((c: any) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Cobrado (Pagador)</Label>
                <Select
                  value={
                    editData.targetType === 'franchise'
                      ? editData.franchiseId
                      : editData.companyId
                  }
                  onValueChange={(v) => {
                    if (editData.targetType === 'franchise') {
                      setEditData({ ...editData, franchiseId: v })
                    } else {
                      setEditData({ ...editData, companyId: v })
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cobrado" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTargets.map((c: any) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>O que está sendo cobrado (Descrição)</Label>
              <Textarea
                value={editData.description || ''}
                onChange={(e) =>
                  setEditData({ ...editData, description: e.target.value })
                }
                placeholder="Ex: Faturamento referente a comissões e royalties do período..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 flex flex-col">
                <Label>Data de Vencimento</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !editData.dueDate && 'text-muted-foreground',
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editData.dueDate ? (
                        format(new Date(editData.dueDate), 'dd/MM/yyyy')
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={
                        editData.dueDate
                          ? new Date(editData.dueDate)
                          : undefined
                      }
                      onSelect={(date) =>
                        date &&
                        setEditData({
                          ...editData,
                          dueDate: date.toISOString(),
                        })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Valor Total (R$)</Label>
                <Input
                  type="number"
                  value={editData.totalCommission || 0}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      totalCommission: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Como Pagar (Instruções de Pagamento)</Label>
              <Textarea
                value={editData.paymentInstructions || ''}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    paymentInstructions: e.target.value,
                  })
                }
                placeholder="Ex: Link do Stripe, Pix, ou dados bancários..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={saveEdit}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
