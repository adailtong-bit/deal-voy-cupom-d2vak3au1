import { useState } from 'react'
import { useCouponStore } from '@/stores/CouponContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
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
import { AdInvoice, Advertiser } from '@/lib/types'
import { useLanguage } from '@/stores/LanguageContext'

export function AdBillingTab() {
  const { adInvoices, advertisers, updateInvoiceStatus } = useCouponStore()
  const { t } = useLanguage()
  const [selectedInvoice, setSelectedInvoice] = useState<{
    inv: AdInvoice
    adv: Advertiser | undefined
  } | null>(null)
  const [confirmPayId, setConfirmPayId] = useState<string | null>(null)
  const [refInput, setRefInput] = useState('')

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('ads.billing_invoicing')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('ads.ref_date')}</TableHead>
              <TableHead>{t('ads.advertiser')}</TableHead>
              <TableHead>{t('ads.amount')}</TableHead>
              <TableHead>{t('ads.due_date')}</TableHead>
              <TableHead>{t('admin.status')}</TableHead>
              <TableHead className="text-right">{t('admin.action')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {adInvoices.map((inv) => {
              const adv = advertisers.find((a) => a.id === inv.advertiserId)
              return (
                <TableRow key={inv.id}>
                  <TableCell>
                    <div className="font-medium">{inv.referenceNumber}</div>
                    <div className="text-xs text-muted-foreground">
                      {t('ads.issue_date')}:{' '}
                      {formatDate(inv.issueDate, 'pt-BR')}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {adv?.companyName || 'N/A'}
                  </TableCell>
                  <TableCell>{formatCurrency(inv.amount, 'BRL')}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {formatDate(inv.dueDate, 'pt-BR')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        inv.status === 'paid'
                          ? 'default'
                          : inv.status === 'overdue'
                            ? 'destructive'
                            : inv.status === 'draft'
                              ? 'outline'
                              : 'secondary'
                      }
                      className={inv.status === 'paid' ? 'bg-green-500' : ''}
                    >
                      {inv.status === 'draft' && t('ads.draft')}
                      {inv.status === 'sent' && t('ads.sent')}
                      {inv.status === 'paid' && t('ads.paid')}
                      {inv.status === 'overdue' && t('ads.overdue')}
                      {inv.status === 'canceled' && t('ads.canceled')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      {inv.status === 'draft' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateInvoiceStatus(inv.id, 'sent')}
                        >
                          {t('ads.send_invoice')}
                        </Button>
                      )}

                      {inv.status === 'sent' && (
                        <Dialog
                          open={confirmPayId === inv.id}
                          onOpenChange={(open) => {
                            if (open) {
                              setConfirmPayId(inv.id)
                              setRefInput('')
                            } else {
                              setConfirmPayId(null)
                            }
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600 border-green-200 hover:bg-green-50"
                            >
                              {t('ads.register_payment')}
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>
                                {t('ads.confirm_payment')}
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <p className="text-sm text-muted-foreground">
                                {t('ads.reconciliation_desc')}
                              </p>
                              <Label>{t('ads.ref_code')}</Label>
                              <Input
                                placeholder="Ex: INV-2024-..."
                                value={refInput}
                                onChange={(e) => setRefInput(e.target.value)}
                              />
                            </div>
                            <DialogFooter>
                              <Button
                                disabled={refInput !== inv.referenceNumber}
                                onClick={() => {
                                  updateInvoiceStatus(inv.id, 'paid')
                                  setConfirmPayId(null)
                                  setRefInput('')
                                }}
                              >
                                {t('ads.confirm_receipt')}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedInvoice({ inv, adv })}
                          >
                            {t('common.details')}
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>
                              {t('ads.invoice_data')} (
                              {selectedInvoice?.inv.referenceNumber})
                            </DialogTitle>
                          </DialogHeader>
                          {selectedInvoice?.adv && (
                            <div className="space-y-4">
                              <div>
                                <p className="font-bold text-lg">
                                  {selectedInvoice.adv.companyName}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {t('ads.tax_id_abbr')}:{' '}
                                  {selectedInvoice.adv.taxId}
                                </p>
                              </div>
                              <div className="text-sm">
                                <p>
                                  {t('profile.address')}:{' '}
                                  {selectedInvoice.adv.address.street},{' '}
                                  {selectedInvoice.adv.address.number}
                                </p>
                                <p>
                                  {selectedInvoice.adv.address.city} -{' '}
                                  {selectedInvoice.adv.address.state},{' '}
                                  {t('address.zip')}:{' '}
                                  {selectedInvoice.adv.address.zip}
                                </p>
                              </div>
                              <div className="bg-muted p-4 rounded-md flex justify-between items-center">
                                <div>
                                  <span className="font-bold block">
                                    {t('ads.total_billed')}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {t('ads.due_date')}:{' '}
                                    {formatDate(
                                      selectedInvoice.inv.dueDate,
                                      'pt-BR',
                                    )}
                                  </span>
                                </div>
                                <span className="text-xl font-bold text-primary">
                                  {formatCurrency(
                                    selectedInvoice.inv.amount,
                                    'BRL',
                                  )}
                                </span>
                              </div>
                              <div className="flex gap-2 justify-end">
                                {selectedInvoice.inv.status !== 'canceled' &&
                                  selectedInvoice.inv.status !== 'paid' && (
                                    <Button
                                      variant="destructive"
                                      onClick={() =>
                                        updateInvoiceStatus(
                                          selectedInvoice.inv.id,
                                          'canceled',
                                        )
                                      }
                                    >
                                      {t('common.cancel')}
                                    </Button>
                                  )}
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
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
