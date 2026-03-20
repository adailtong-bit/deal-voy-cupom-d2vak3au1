import { useState } from 'react'
import { FileText, Plus, CheckCircle, Clock, Send } from 'lucide-react'
import { format } from 'date-fns'
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

type InvoiceStatus = 'Draft' | 'Sent' | 'Paid'

type Invoice = {
  id: string
  partner: string
  periodStart: string
  periodEnd: string
  amount: number
  status: InvoiceStatus
}

const initialInvoices: Invoice[] = [
  {
    id: 'INV-001',
    partner: 'Restaurante Sabor',
    periodStart: '2026-09-01',
    periodEnd: '2026-09-30',
    amount: 1250.0,
    status: 'Paid',
  },
  {
    id: 'INV-002',
    partner: 'Hotel Paraíso',
    periodStart: '2026-10-01',
    periodEnd: '2026-10-31',
    amount: 3400.5,
    status: 'Sent',
  },
  {
    id: 'INV-003',
    partner: 'Passeio Radical',
    periodStart: '2026-11-01',
    periodEnd: '2026-11-30',
    amount: 890.0,
    status: 'Draft',
  },
]

export function PartnerBillingTab() {
  const { t } = useLanguage()
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newInvoice, setNewInvoice] = useState<Partial<Invoice>>({
    partner: '',
    periodStart: '',
    periodEnd: '',
    status: 'Draft',
  })

  const calculateAmount = () => {
    if (!newInvoice.partner) return 0
    return Math.floor(Math.random() * 5000) + 500
  }

  const handleCreate = () => {
    const amount = calculateAmount()
    const invoice: Invoice = {
      id: `INV-00${invoices.length + 1}`,
      partner: newInvoice.partner || 'Desconhecido',
      periodStart:
        newInvoice.periodStart || new Date().toISOString().split('T')[0],
      periodEnd: newInvoice.periodEnd || new Date().toISOString().split('T')[0],
      amount,
      status: 'Draft',
    }
    setInvoices([invoice, ...invoices])
    setIsDialogOpen(false)
    setNewInvoice({
      partner: '',
      periodStart: '',
      periodEnd: '',
      status: 'Draft',
    })
  }

  const updateStatus = (id: string, newStatus: InvoiceStatus) => {
    setInvoices(
      invoices.map((inv) =>
        inv.id === id ? { ...inv, status: newStatus } : inv,
      ),
    )
  }

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case 'Paid':
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            <CheckCircle className="mr-1 h-3 w-3" /> {t('admin.paid')}
          </Badge>
        )
      case 'Sent':
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600">
            <Send className="mr-1 h-3 w-3" /> {t('admin.sent')}
          </Badge>
        )
      case 'Draft':
        return (
          <Badge variant="secondary">
            <Clock className="mr-1 h-3 w-3" /> {t('admin.draft')}
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-tight">
          {t('admin.invoices')}
        </h2>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t('admin.createInvoice')}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('admin.paid')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">R$ 1.250,00</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('admin.sent')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">R$ 3.400,50</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('admin.draft')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">
              R$ 890,00
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>{t('admin.partner')}</TableHead>
              <TableHead>{t('admin.period')}</TableHead>
              <TableHead>{t('admin.amount')}</TableHead>
              <TableHead>{t('admin.status')}</TableHead>
              <TableHead className="text-right">{t('admin.action')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">{invoice.id}</TableCell>
                <TableCell>{invoice.partner}</TableCell>
                <TableCell>
                  {format(new Date(invoice.periodStart), 'dd/MM')} -{' '}
                  {format(new Date(invoice.periodEnd), 'dd/MM')}
                </TableCell>
                <TableCell>R$ {invoice.amount.toFixed(2)}</TableCell>
                <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {invoice.status === 'Draft' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateStatus(invoice.id, 'Sent')}
                      >
                        {t('admin.sent')}
                      </Button>
                    )}
                    {invoice.status === 'Sent' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateStatus(invoice.id, 'Paid')}
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
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('admin.createInvoice')}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>{t('admin.partner')}</Label>
              <Select
                onValueChange={(v) =>
                  setNewInvoice({ ...newInvoice, partner: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('admin.partner')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Restaurante Sabor">
                    Restaurante Sabor
                  </SelectItem>
                  <SelectItem value="Hotel Paraíso">Hotel Paraíso</SelectItem>
                  <SelectItem value="Passeio Radical">
                    Passeio Radical
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Início</Label>
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
                <Label>Fim</Label>
                <Input
                  type="date"
                  value={newInvoice.periodEnd}
                  onChange={(e) =>
                    setNewInvoice({ ...newInvoice, periodEnd: e.target.value })
                  }
                />
              </div>
            </div>
            {newInvoice.partner &&
              newInvoice.periodStart &&
              newInvoice.periodEnd && (
                <div className="rounded-lg bg-muted p-4 mt-2">
                  <div className="text-sm text-muted-foreground mb-1">
                    {t('admin.calculate')}
                  </div>
                  <div className="text-2xl font-bold">
                    R$ {calculateAmount().toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Baseado em políticas ativas
                  </div>
                </div>
              )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {t('admin.cancel')}
            </Button>
            <Button
              onClick={handleCreate}
              disabled={
                !newInvoice.partner ||
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
