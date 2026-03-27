import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FileText, Plus, CheckCircle, Clock, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
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
import { Input } from '@/components/ui/input'
import { useLanguage } from '@/stores/LanguageContext'
import { useRegionFormatting } from '@/hooks/useRegionFormatting'
import { useCouponStore } from '@/stores/CouponContext'

export function PartnerBillingTab({ franchiseId }: { franchiseId?: string }) {
  const { t } = useLanguage()
  const {
    partnerInvoices,
    updatePartnerInvoiceStatus,
    companies,
    generatePartnerInvoice,
    franchises,
  } = useCouponStore()
  const [searchParams] = useSearchParams()
  const searchQuery = (searchParams.get('q') || '').toLowerCase()

  const franchise = franchises.find((f) => f.id === franchiseId)
  const { formatCurrency, formatShortDate } = useRegionFormatting(
    franchise?.region,
  )

  const displayCompanies = franchiseId
    ? companies.filter((c) => c.franchiseId === franchiseId)
    : companies
  const companyIds = displayCompanies.map((c) => c.id)

  const getCompanyName = (id: string) =>
    displayCompanies.find((c) => c.id === id)?.name || id

  const displayInvoices = (
    franchiseId
      ? partnerInvoices.filter((i) => companyIds.includes(i.companyId))
      : partnerInvoices
  ).filter((i) => {
    if (!searchQuery) return true
    const compName = getCompanyName(i.companyId).toLowerCase()
    return (
      compName.includes(searchQuery) ||
      i.referenceNumber.toLowerCase().includes(searchQuery)
    )
  })

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newInvoice, setNewInvoice] = useState({
    companyId: '',
    periodStart: '',
    periodEnd: '',
  })

  const handleCreate = () => {
    generatePartnerInvoice(
      newInvoice.companyId,
      newInvoice.periodStart,
      newInvoice.periodEnd,
    )
    setIsDialogOpen(false)
    setNewInvoice({ companyId: '', periodStart: '', periodEnd: '' })
  }

  const updateStatus = (id: string, newStatus: any) => {
    updatePartnerInvoiceStatus(id, newStatus)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            <CheckCircle className="mr-1 h-3 w-3" /> {t('admin.paid')}
          </Badge>
        )
      case 'sent':
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600">
            <Send className="mr-1 h-3 w-3" /> {t('admin.sent')}
          </Badge>
        )
      case 'draft':
      default:
        return (
          <Badge variant="secondary">
            <Clock className="mr-1 h-3 w-3" /> {t('admin.draft')}
          </Badge>
        )
    }
  }

  const paidAmount = displayInvoices
    .filter((i) => i.status === 'paid')
    .reduce((acc, i) => acc + i.totalCommission, 0)
  const sentAmount = displayInvoices
    .filter((i) => i.status === 'sent')
    .reduce((acc, i) => acc + i.totalCommission, 0)
  const draftAmount = displayInvoices
    .filter((i) => i.status === 'draft')
    .reduce((acc, i) => acc + i.totalCommission, 0)

  return (
    <div className="space-y-6 animate-fade-in-up min-w-0 w-full max-w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 min-w-0">
        <h2 className="text-xl font-semibold tracking-tight truncate">
          {t('admin.invoices')}
        </h2>
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="shrink-0 w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          {t('admin.createInvoice')}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3 min-w-0">
        <Card className="min-w-0 overflow-hidden">
          <CardHeader className="pb-2 min-w-0">
            <CardTitle className="text-sm font-medium text-muted-foreground truncate">
              {t('admin.paid')}
            </CardTitle>
          </CardHeader>
          <CardContent className="min-w-0">
            <div className="text-2xl font-bold text-green-600 truncate">
              {formatCurrency(paidAmount)}
            </div>
          </CardContent>
        </Card>
        <Card className="min-w-0 overflow-hidden">
          <CardHeader className="pb-2 min-w-0">
            <CardTitle className="text-sm font-medium text-muted-foreground truncate">
              {t('admin.sent')}
            </CardTitle>
          </CardHeader>
          <CardContent className="min-w-0">
            <div className="text-2xl font-bold text-blue-600 truncate">
              {formatCurrency(sentAmount)}
            </div>
          </CardContent>
        </Card>
        <Card className="min-w-0 overflow-hidden">
          <CardHeader className="pb-2 min-w-0">
            <CardTitle className="text-sm font-medium text-muted-foreground truncate">
              {t('admin.draft')}
            </CardTitle>
          </CardHeader>
          <CardContent className="min-w-0">
            <div className="text-2xl font-bold text-muted-foreground truncate">
              {formatCurrency(draftAmount)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-md border bg-card overflow-hidden min-w-0 w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">ID</TableHead>
              <TableHead className="whitespace-nowrap">
                {t('admin.partner')}
              </TableHead>
              <TableHead className="whitespace-nowrap">
                {t('admin.period')}
              </TableHead>
              <TableHead className="whitespace-nowrap">
                {t('admin.amount')}
              </TableHead>
              <TableHead className="whitespace-nowrap">
                {t('admin.status')}
              </TableHead>
              <TableHead className="text-right whitespace-nowrap">
                {t('admin.action')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayInvoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium text-xs whitespace-nowrap">
                  {invoice.referenceNumber}
                </TableCell>
                <TableCell
                  className="whitespace-nowrap max-w-[150px] truncate"
                  title={getCompanyName(invoice.companyId)}
                >
                  {getCompanyName(invoice.companyId)}
                </TableCell>
                <TableCell className="text-xs whitespace-nowrap">
                  {formatShortDate(invoice.periodStart)} -{' '}
                  {formatShortDate(invoice.periodEnd)}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {formatCurrency(invoice.totalCommission)}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {getStatusBadge(invoice.status)}
                </TableCell>
                <TableCell className="text-right whitespace-nowrap">
                  <div className="flex justify-end gap-2">
                    {invoice.status === 'draft' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateStatus(invoice.id, 'sent')}
                      >
                        {t('admin.sent')}
                      </Button>
                    )}
                    {invoice.status === 'sent' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateStatus(invoice.id, 'paid')}
                      >
                        {t('admin.paid')}
                      </Button>
                    )}
                    <Button variant="ghost" size="icon">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {displayInvoices.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  No invoices found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('admin.createInvoice')}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>{t('admin.partner')}</Label>
              <Select
                onValueChange={(v) =>
                  setNewInvoice({ ...newInvoice, companyId: v })
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
                <Label>Start</Label>
                <Input
                  type="date"
                  value={newInvoice.periodStart}
                  onChange={(e) =>
                    setNewInvoice({
                      ...newInvoice,
                      periodStart: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>End</Label>
                <Input
                  type="date"
                  value={newInvoice.periodEnd}
                  onChange={(e) =>
                    setNewInvoice({ ...newInvoice, periodEnd: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {t('admin.cancel')}
            </Button>
            <Button
              onClick={handleCreate}
              disabled={
                !newInvoice.companyId ||
                !newInvoice.periodStart ||
                !newInvoice.periodEnd
              }
            >
              {t('admin.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
