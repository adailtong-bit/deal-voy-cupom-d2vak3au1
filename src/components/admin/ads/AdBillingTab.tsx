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
} from '@/components/ui/dialog'
import { AdInvoice, Advertiser } from '@/lib/types'

export function AdBillingTab() {
  const { adInvoices, advertisers, updateInvoiceStatus } = useCouponStore()
  const [selectedInvoice, setSelectedInvoice] = useState<{
    inv: AdInvoice
    adv: Advertiser | undefined
  } | null>(null)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cobranças e Faturamento</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Anunciante</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {adInvoices.map((inv) => {
              const adv = advertisers.find((a) => a.id === inv.advertiserId)
              return (
                <TableRow key={inv.id}>
                  <TableCell>{formatDate(inv.issueDate, 'pt-BR')}</TableCell>
                  <TableCell className="font-medium">
                    {adv?.companyName || 'N/A'}
                  </TableCell>
                  <TableCell>{formatCurrency(inv.amount, 'BRL')}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        inv.status === 'paid'
                          ? 'default'
                          : inv.status === 'pending'
                            ? 'secondary'
                            : 'destructive'
                      }
                      className={inv.status === 'paid' ? 'bg-green-500' : ''}
                    >
                      {inv.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedInvoice({ inv, adv })}
                        >
                          Detalhes
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Dados da Cobrança</DialogTitle>
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
                                Endereço: {selectedInvoice.adv.address.street},{' '}
                                {selectedInvoice.adv.address.number}
                              </p>
                              <p>
                                {selectedInvoice.adv.address.city} -{' '}
                                {selectedInvoice.adv.address.state}, CEP:{' '}
                                {selectedInvoice.adv.address.zip}
                              </p>
                            </div>
                            <div className="bg-muted p-4 rounded-md flex justify-between items-center">
                              <span className="font-bold">Total Faturado</span>
                              <span className="text-xl font-bold text-primary">
                                {formatCurrency(
                                  selectedInvoice.inv.amount,
                                  'BRL',
                                )}
                              </span>
                            </div>
                            <div className="flex gap-2 justify-end">
                              {selectedInvoice.inv.status !== 'paid' && (
                                <Button
                                  className="bg-green-600"
                                  onClick={() =>
                                    updateInvoiceStatus(
                                      selectedInvoice.inv.id,
                                      'paid',
                                    )
                                  }
                                >
                                  Marcar como Pago
                                </Button>
                              )}
                              {selectedInvoice.inv.status !== 'canceled' && (
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
