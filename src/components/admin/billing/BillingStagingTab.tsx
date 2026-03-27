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
import { useCouponStore } from '@/stores/CouponContext'
import { useRegionFormatting } from '@/hooks/useRegionFormatting'
import { PartnerInvoice } from '@/lib/types'
import { Send, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

export function BillingStagingTab({ franchiseId }: { franchiseId?: string }) {
  const { partnerInvoices, companies, franchises, updatePartnerInvoiceStatus } =
    useCouponStore()
  const myFranchise = franchises.find((f) => f.id === franchiseId)
  const { formatCurrency, formatShortDate } = useRegionFormatting(
    myFranchise?.region,
  )

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

  return (
    <Card className="min-w-0 w-full animate-fade-in-up">
      <CardHeader>
        <CardTitle>Área de Preparação (Rascunhos)</CardTitle>
        <CardDescription>
          Revise e aprove as faturas geradas antes de enviá-las oficialmente aos
          destinatários.
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
                  <TableCell className="text-xs">
                    {formatShortDate(inv.periodStart)} -{' '}
                    {formatShortDate(inv.periodEnd)}
                  </TableCell>
                  <TableCell>{inv.transactionCount}</TableCell>
                  <TableCell className="text-right font-bold">
                    {formatCurrency(inv.totalCommission)}
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
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
    </Card>
  )
}
