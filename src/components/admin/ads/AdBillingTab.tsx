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

export function AdBillingTab() {
  const { adInvoices, advertisers, updateInvoiceStatus } = useCouponStore()
  const [selectedInvoice, setSelectedInvoice] = useState<{
    inv: AdInvoice
    adv: Advertiser | undefined
  } | null>(null)
  const [confirmPayId, setConfirmPayId] = useState<string | null>(null)
  const [refInput, setRefInput] = useState('')

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cobranças e Faturamento</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Referência / Data</TableHead>
              <TableHead>Anunciante</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
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
                      Emissão: {formatDate(inv.issueDate, 'pt-BR')}
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
                      {inv.status === 'draft' && 'Rascunho'}
                      {inv.status === 'sent' && 'Enviado'}
                      {inv.status === 'paid' && 'Pago'}
                      {inv.status === 'overdue' && 'Vencido'}
                      {inv.status === 'canceled' && 'Cancelado'}
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
                          Enviar Fatura
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
                              Registrar Pagto
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Confirmar Pagamento</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <p className="text-sm text-muted-foreground">
                                Para realizar a conciliação, digite o código de
                                referência{' '}
                                <strong>{inv.referenceNumber}</strong> para
                                confirmar que o valor foi recebido.
                              </p>
                              <Label>Código de Referência</Label>
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
                                Confirmar Recebimento
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
                            Detalhes
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>
                              Dados da Fatura (
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
                                  CNPJ: {selectedInvoice.adv.taxId}
                                </p>
                              </div>
                              <div className="text-sm">
                                <p>
                                  Endereço: {selectedInvoice.adv.address.street}
                                  , {selectedInvoice.adv.address.number}
                                </p>
                                <p>
                                  {selectedInvoice.adv.address.city} -{' '}
                                  {selectedInvoice.adv.address.state}, CEP:{' '}
                                  {selectedInvoice.adv.address.zip}
                                </p>
                              </div>
                              <div className="bg-muted p-4 rounded-md flex justify-between items-center">
                                <div>
                                  <span className="font-bold block">
                                    Total Faturado
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    Vencimento:{' '}
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
                                      Cancelar
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
