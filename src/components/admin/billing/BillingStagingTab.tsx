import { useState } from 'react'
import { useLanguage } from '@/stores/LanguageContext'
import { useCouponStore } from '@/stores/CouponContext'
import { useRegionFormatting } from '@/hooks/useRegionFormatting'
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
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Send, Edit2, Trash2, Download } from 'lucide-react'
import { PartnerInvoice } from '@/lib/types'

export function BillingStagingTab({ franchiseId }: { franchiseId?: string }) {
  const { t } = useLanguage()
  const {
    partnerInvoices,
    companies,
    franchises,
    updatePartnerInvoiceStatus,
    updatePartnerInvoice,
  } = useCouponStore()

  const franchise = franchises.find((f) => f.id === franchiseId)
  const { formatCurrency, formatDate } = useRegionFormatting(franchise?.region)

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingInv, setEditingInv] = useState<PartnerInvoice | null>(null)
  const [editForm, setEditForm] = useState<Partial<PartnerInvoice>>({})

  const stagingInvoices = partnerInvoices
    .filter((i) => i.status === 'draft' || i.status === 'pending')
    .filter((i) => (franchiseId ? i.franchiseId === franchiseId : true))

  const getCompanyName = (id: string) =>
    companies.find((c) => c.id === id)?.name || id

  const getFranchiseName = (id?: string) =>
    id ? franchises.find((f) => f.id === id)?.name || id : 'Platform'

  const handleEdit = (inv: PartnerInvoice) => {
    setEditingInv(inv)
    setEditForm(inv)
    setIsEditOpen(true)
  }

  const saveEdit = () => {
    if (editingInv) {
      updatePartnerInvoice(editingInv.id, editForm)
    }
    setIsEditOpen(false)
  }

  const exportPdf = (inv: PartnerInvoice) => {
    const w = window.open('', '_blank')
    if (w) {
      const billerName = inv.billerName || getFranchiseName(inv.franchiseId)
      const customerName = inv.customerName || getCompanyName(inv.companyId)

      w.document.write(`
        <html><head><title>Fatura - ${inv.referenceNumber}</title>
        <style>
          body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #1e293b; background: #fff; line-height: 1.5; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
          .title h1 { margin: 0; font-size: 28px; color: #0f172a; text-transform: uppercase; letter-spacing: -0.5px; }
          .title p { margin: 4px 0 0 0; color: #64748b; font-size: 14px; }
          .meta table { border-collapse: collapse; text-align: right; }
          .meta td { padding: 4px 0; font-size: 14px; border: none; }
          .meta td:first-child { font-weight: 600; color: #475569; padding-right: 16px; text-align: left; }
          .parties { display: flex; gap: 30px; margin-bottom: 40px; }
          .party { flex: 1; background: #f8fafc; padding: 24px; border-radius: 12px; border: 1px solid #e2e8f0; }
          .party h3 { margin: 0 0 16px 0; font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px; }
          .party p { margin: 6px 0; font-size: 14px; color: #334155; }
          .party strong { color: #0f172a; font-weight: 600; display: block; margin-bottom: 8px; font-size: 16px; }
          .contact-info { margin-top: 12px; padding-top: 12px; border-top: 1px solid #e2e8f0; }
          .details-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          .details-table th { background: #f1f5f9; padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #cbd5e1; border-top: none; border-left: none; border-right: none;}
          .details-table td { padding: 16px; font-size: 14px; border-bottom: 1px solid #e2e8f0; color: #334155; border-top: none; border-left: none; border-right: none;}
          .details-table .amount { text-align: right; font-weight: 600; color: #0f172a; }
          .summary { display: flex; justify-content: flex-end; margin-bottom: 40px; }
          .summary-box { width: 300px; background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; }
          .summary-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; color: #475569; }
          .summary-row.total { border-top: 2px solid #cbd5e1; padding-top: 12px; margin-top: 4px; margin-bottom: 0; font-size: 18px; font-weight: 700; color: #0f172a; }
          .payment-box { background: #f0fdf4; border: 1px solid #bbf7d0; padding: 24px; border-radius: 12px; border-left: 4px solid #22c55e; page-break-inside: avoid; margin-bottom: 30px; }
          .payment-box h4 { margin: 0 0 12px 0; font-size: 14px; font-weight: 700; color: #166534; text-transform: uppercase; letter-spacing: 0.5px; }
          .payment-box p { margin: 0; font-size: 14px; color: #15803d; white-space: pre-wrap; line-height: 1.6; }
          .notes { font-size: 13px; color: #64748b; line-height: 1.6; white-space: pre-wrap; background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; }
          .notes h4 { margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase; color: #475569; }
        </style></head>
        <body>
          <div class="header">
            <div class="title">
              <h1>${t('franchisee.billing.invoice', 'Fatura de Serviços')}</h1>
              <p>Ref: ${inv.referenceNumber}</p>
            </div>
            <div class="meta">
              <table>
                <tr><td>${t('franchisee.billing.issue_date', 'Data de Emissão')}:</td><td>${formatDate(inv.issueDate)}</td></tr>
                <tr><td>${t('franchisee.billing.due_date', 'Vencimento')}:</td><td><strong>${formatDate(inv.dueDate)}</strong></td></tr>
                <tr><td>Status:</td><td>${inv.status.toUpperCase()}</td></tr>
              </table>
            </div>
          </div>
          
          <div class="parties">
            <div class="party">
              <h3>${t('franchisee.billing.biller', 'Cobrador')}</h3>
              <strong>${billerName}</strong>
              ${inv.billerTaxId ? `<p>CNPJ/CPF: ${inv.billerTaxId}${inv.billerStateReg ? ` | IE: ${inv.billerStateReg}` : ''}</p>` : ''}
              ${inv.billerAddress ? `<p>${inv.billerAddress}</p>` : ''}
              <div class="contact-info">
                ${inv.billerContact ? `<p>A/C: <strong>${inv.billerContact}</strong></p>` : ''}
                ${inv.billerEmail ? `<p>Email: ${inv.billerEmail}</p>` : ''}
                ${inv.billerPhone ? `<p>Tel: ${inv.billerPhone}</p>` : ''}
              </div>
            </div>
            <div class="party">
              <h3>${t('franchisee.billing.customer', 'Cobrado')}</h3>
              <strong>${customerName}</strong>
              ${inv.customerTaxId ? `<p>CNPJ/CPF: ${inv.customerTaxId}${inv.customerStateReg ? ` | IE: ${inv.customerStateReg}` : ''}</p>` : ''}
              ${inv.customerAddress ? `<p>${inv.customerAddress}</p>` : ''}
              <div class="contact-info">
                ${inv.customerContact ? `<p>A/C: <strong>${inv.customerContact}</strong></p>` : ''}
                ${inv.customerEmail ? `<p>Email: ${inv.customerEmail}</p>` : ''}
                ${inv.customerPhone ? `<p>Tel: ${inv.customerPhone}</p>` : ''}
              </div>
            </div>
          </div>

          <table class="details-table">
            <thead>
              <tr>
                <th>${t('franchisee.billing.description', 'Descrição')}</th>
                <th>${t('franchisee.billing.period', 'Período')}</th>
                <th class="amount">${t('franchisee.billing.value', 'Valor')}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Comissões / Serviços (${inv.transactionCount} transações)</td>
                <td>${formatDate(inv.periodStart)} - ${formatDate(inv.periodEnd)}</td>
                <td class="amount">${formatCurrency(inv.totalCommission)}</td>
              </tr>
            </tbody>
          </table>
          
          <div class="summary">
            <div class="summary-box">
              <div class="summary-row">
                <span>Subtotal:</span>
                <span>${formatCurrency(inv.totalCommission)}</span>
              </div>
              <div class="summary-row total">
                <span>Total a Pagar:</span>
                <span>${formatCurrency(inv.totalCommission)}</span>
              </div>
            </div>
          </div>
          
          ${
            inv.paymentInstructions
              ? `
            <div class="payment-box">
              <h4>${t('franchisee.billing.payment_instructions', 'Dados para Pagamento')}</h4>
              <p>${inv.paymentInstructions}</p>
            </div>
          `
              : ''
          }

          ${
            inv.description
              ? `
            <div class="notes">
              <h4>${t('franchisee.billing.notes', 'Observações')}</h4>
              <div>${inv.description}</div>
            </div>
          `
              : ''
          }
          
          <script>
            window.onload = () => { setTimeout(() => { window.print(); window.close(); }, 500); }
          </script>
        </body></html>
      `)
      w.document.close()
    }
  }

  return (
    <Card className="w-full min-w-0 overflow-hidden shadow-sm border-slate-200">
      <CardHeader className="min-w-0 pb-4 border-b border-slate-100 bg-white">
        <CardTitle className="truncate text-lg sm:text-xl text-slate-800">
          {t(
            'franchisee.billing.staging_title',
            'Área de Preparação (Rascunhos)',
          )}
        </CardTitle>
        <CardDescription className="truncate text-slate-500">
          {t(
            'franchisee.billing.staging_desc',
            'Faturas geradas aguardando revisão ou envio aos parceiros.',
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 w-full bg-white">
        <div className="w-full overflow-x-auto min-w-0 custom-scrollbar">
          <Table className="w-full min-w-[750px]">
            <TableHeader className="bg-slate-50/80">
              <TableRow>
                <TableHead className="whitespace-nowrap font-semibold text-slate-700 pl-4 sm:pl-6">
                  {t('franchisee.billing.reference', 'Referência')}
                </TableHead>
                <TableHead className="whitespace-nowrap font-semibold text-slate-700">
                  {t('franchisee.billing.partner', 'Parceiro')}
                </TableHead>
                <TableHead className="whitespace-nowrap font-semibold text-slate-700">
                  {t('franchisee.billing.period', 'Período')}
                </TableHead>
                <TableHead className="whitespace-nowrap font-semibold text-slate-700">
                  {t('franchisee.billing.value', 'Valor')}
                </TableHead>
                <TableHead className="whitespace-nowrap font-semibold text-slate-700">
                  {t('franchisee.billing.status', 'Status')}
                </TableHead>
                <TableHead className="text-right whitespace-nowrap font-semibold text-slate-700 pr-4 sm:pr-6 w-[1%]">
                  {t('franchisee.billing.actions', 'Ações')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stagingInvoices.map((inv) => (
                <TableRow
                  key={inv.id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <TableCell className="font-medium whitespace-nowrap text-slate-700 pl-4 sm:pl-6">
                    {inv.referenceNumber}
                  </TableCell>
                  <TableCell
                    className="whitespace-nowrap max-w-[180px] sm:max-w-[200px] truncate font-medium text-slate-900"
                    title={getCompanyName(inv.companyId)}
                  >
                    {getCompanyName(inv.companyId)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-slate-600">
                    {formatDate(inv.periodStart)} - {formatDate(inv.periodEnd)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap font-bold text-slate-800">
                    {formatCurrency(inv.totalCommission)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <Badge
                      variant={inv.status === 'draft' ? 'secondary' : 'outline'}
                      className="capitalize bg-slate-100 text-slate-700 hover:bg-slate-200 border-transparent"
                    >
                      {inv.status === 'draft'
                        ? t('franchisee.billing.draft', 'Rascunho')
                        : t('franchisee.billing.pending', 'Pendente')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap pr-4 sm:pr-6 w-[1%]">
                    <div className="flex justify-end gap-1 sm:gap-2 items-center flex-nowrap shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="shrink-0 h-8 px-2 sm:h-9 sm:px-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-semibold transition-colors"
                        onClick={() =>
                          updatePartnerInvoiceStatus(inv.id, 'sent')
                        }
                        title={t(
                          'franchisee.billing.send_invoice',
                          'Enviar Fatura',
                        )}
                      >
                        <Send className="h-4 w-4 sm:mr-1.5" />
                        <span className="hidden sm:inline">
                          {t('franchisee.billing.send', 'Enviar')}
                        </span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 h-8 w-8 sm:h-9 sm:w-9 text-slate-500 hover:text-primary hover:bg-primary/10 transition-colors"
                        onClick={() => exportPdf(inv)}
                        title={t('common.download', 'Download PDF')}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 h-8 w-8 sm:h-9 sm:w-9 text-slate-500 hover:text-primary hover:bg-primary/10 transition-colors"
                        onClick={() => handleEdit(inv)}
                        title={t('common.edit', 'Editar')}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 h-8 w-8 sm:h-9 sm:w-9 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        onClick={() =>
                          updatePartnerInvoiceStatus(inv.id, 'canceled')
                        }
                        title={t('common.delete', 'Excluir')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {stagingInvoices.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-12 text-slate-500 font-medium"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
                        <Edit2 className="h-6 w-6 text-slate-400" />
                      </div>
                      <p>
                        {t(
                          'franchisee.billing.no_staging',
                          'Nenhuma fatura em preparação no momento.',
                        )}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {t('franchisee.billing.edit_invoice', 'Editar Fatura Detalhada')}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('franchisee.billing.reference', 'Referência')}</Label>
                <Input value={editForm.referenceNumber || ''} disabled />
              </div>
              <div className="space-y-2">
                <Label>{t('franchisee.billing.status', 'Status')}</Label>
                <Select
                  value={editForm.status}
                  onValueChange={(v: any) =>
                    setEditForm({ ...editForm, status: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">
                      {t('franchisee.billing.draft', 'Rascunho')}
                    </SelectItem>
                    <SelectItem value="pending">
                      {t('franchisee.billing.pending', 'Pendente')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Cobrador e Cobrado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="space-y-4">
                <h4 className="font-semibold text-slate-700 border-b pb-2">
                  {t('franchisee.billing.biller_info', 'Dados do Cobrador')}
                </h4>
                <div className="space-y-2">
                  <Label>
                    {t('franchisee.billing.name', 'Nome/Razão Social')}
                  </Label>
                  <Input
                    value={editForm.billerName || ''}
                    onChange={(e) =>
                      setEditForm({ ...editForm, billerName: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label>{t('franchisee.billing.tax_id', 'CNPJ/CPF')}</Label>
                    <Input
                      value={editForm.billerTaxId || ''}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          billerTaxId: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>
                      {t('admin.company.state_reg', 'Insc. Estadual')}
                    </Label>
                    <Input
                      value={editForm.billerStateReg || ''}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          billerStateReg: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>
                    {t('franchisee.billing.address', 'Endereço Completo')}
                  </Label>
                  <Input
                    value={editForm.billerAddress || ''}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        billerAddress: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label>
                      {t('admin.company.contact_person', 'Contato (A/C)')}
                    </Label>
                    <Input
                      value={editForm.billerContact || ''}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          billerContact: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('admin.company.phone', 'Telefone')}</Label>
                    <Input
                      value={editForm.billerPhone || ''}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          billerPhone: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>
                    {t('admin.company.email', 'E-mail de Cobrança')}
                  </Label>
                  <Input
                    type="email"
                    value={editForm.billerEmail || ''}
                    onChange={(e) =>
                      setEditForm({ ...editForm, billerEmail: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-slate-700 border-b pb-2">
                  {t('franchisee.billing.customer_info', 'Dados do Cobrado')}
                </h4>
                <div className="space-y-2">
                  <Label>
                    {t('franchisee.billing.name', 'Nome/Razão Social')}
                  </Label>
                  <Input
                    value={editForm.customerName || ''}
                    onChange={(e) =>
                      setEditForm({ ...editForm, customerName: e.target.value })
                    }
                    placeholder={getCompanyName(editForm.companyId || '')}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label>{t('franchisee.billing.tax_id', 'CNPJ/CPF')}</Label>
                    <Input
                      value={editForm.customerTaxId || ''}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          customerTaxId: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>
                      {t('admin.company.state_reg', 'Insc. Estadual')}
                    </Label>
                    <Input
                      value={editForm.customerStateReg || ''}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          customerStateReg: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>
                    {t('franchisee.billing.address', 'Endereço Completo')}
                  </Label>
                  <Input
                    value={editForm.customerAddress || ''}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        customerAddress: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label>
                      {t('admin.company.contact_person', 'Contato (A/C)')}
                    </Label>
                    <Input
                      value={editForm.customerContact || ''}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          customerContact: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('admin.company.phone', 'Telefone')}</Label>
                    <Input
                      value={editForm.customerPhone || ''}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          customerPhone: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>
                    {t('admin.company.email', 'E-mail de Pagamento')}
                  </Label>
                  <Input
                    type="email"
                    value={editForm.customerEmail || ''}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        customerEmail: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  {t('franchisee.billing.issue_date', 'Data de Emissão')}
                </Label>
                <Input
                  type="date"
                  value={editForm.issueDate?.split('T')[0] || ''}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      issueDate: new Date(e.target.value).toISOString(),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{t('franchisee.billing.due_date', 'Vencimento')}</Label>
                <Input
                  type="date"
                  value={editForm.dueDate?.split('T')[0] || ''}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      dueDate: new Date(e.target.value).toISOString(),
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  {t('franchisee.billing.period_start', 'Início do Período')}
                </Label>
                <Input
                  type="date"
                  value={editForm.periodStart?.split('T')[0] || ''}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      periodStart: new Date(e.target.value).toISOString(),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>
                  {t('franchisee.billing.period_end', 'Fim do Período')}
                </Label>
                <Input
                  type="date"
                  value={editForm.periodEnd?.split('T')[0] || ''}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      periodEnd: new Date(e.target.value).toISOString(),
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>
                  {t('franchisee.billing.total_sales', 'Total de Vendas')}
                </Label>
                <Input
                  type="number"
                  value={editForm.totalSales || 0}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      totalSales: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>
                  {t('franchisee.billing.total_commission', 'Comissão')}
                </Label>
                <Input
                  type="number"
                  value={editForm.totalCommission || 0}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      totalCommission: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>
                  {t('franchisee.billing.total_cashback', 'Cashback')}
                </Label>
                <Input
                  type="number"
                  value={editForm.totalCashback || 0}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      totalCashback: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>
                {t('franchisee.billing.description', 'Descrição / Notas')}
              </Label>
              <Textarea
                value={editForm.description || ''}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>
                {t(
                  'franchisee.billing.payment_instructions',
                  'Instruções de Pagamento',
                )}
              </Label>
              <Textarea
                value={editForm.paymentInstructions || ''}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    paymentInstructions: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              {t('common.cancel', 'Cancelar')}
            </Button>
            <Button onClick={saveEdit}>{t('common.save', 'Salvar')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
