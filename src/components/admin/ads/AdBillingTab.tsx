import { useState, useEffect } from 'react'
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
import { supabase } from '@/lib/supabase/client'
import { Loader2, FileText } from 'lucide-react'
import { toast } from 'sonner'

export function AdBillingTab() {
  const [invoices, setInvoices] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null)
  const [confirmPayId, setConfirmPayId] = useState<string | null>(null)
  const [refInput, setRefInput] = useState('')

  const fetchInvoices = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('ad_invoices')
        .select(
          `
        *,
        ad_advertisers (
          company_name,
          tax_id,
          street,
          address_number,
          city,
          state,
          zip
        )
      `,
        )
        .order('created_at', { ascending: false })
      if (!error && data) {
        setInvoices(data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchInvoices()
  }, [])

  const updateInvoiceStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('ad_invoices')
        .update({ status })
        .eq('id', id)
      if (error) throw error
      setInvoices((prev) =>
        prev.map((inv) => (inv.id === id ? { ...inv, status } : inv)),
      )
      toast.success('Status da fatura atualizado com sucesso!')
    } catch (e) {
      toast.error('Erro ao atualizar fatura.')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Faturamento e Cobrança dos Anunciantes</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Ref. / Data Emissão</TableHead>
                  <TableHead>Dados do Anunciante</TableHead>
                  <TableHead>Valor a Cobrar</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((inv) => {
                  const adv = inv.ad_advertisers
                  return (
                    <TableRow key={inv.id}>
                      <TableCell>
                        <div className="font-bold text-slate-800">
                          {inv.reference_number}
                        </div>
                        <div className="text-xs text-slate-500">
                          {formatDate(inv.issue_date, 'pt-BR')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-slate-800">
                          {adv?.company_name || 'N/A'}
                        </div>
                        <div className="text-xs text-slate-500">
                          CNPJ: {adv?.tax_id || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell className="font-bold text-primary">
                        {formatCurrency(inv.amount, 'BRL')}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium text-slate-700">
                          {formatDate(inv.due_date, 'pt-BR')}
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
                          className={
                            inv.status === 'paid' ? 'bg-green-500' : ''
                          }
                        >
                          {inv.status === 'draft' && 'Rascunho'}
                          {inv.status === 'sent' && 'Enviada (Aguardando)'}
                          {inv.status === 'paid' && 'Pago'}
                          {inv.status === 'overdue' && 'Atrasado'}
                          {inv.status === 'canceled' && 'Cancelado'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          {inv.status === 'draft' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                updateInvoiceStatus(inv.id, 'sent')
                              }
                              className="border-blue-200 text-blue-700 hover:bg-blue-50"
                            >
                              Enviar Cobrança
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
                                  className="text-green-700 border-green-200 hover:bg-green-50 font-bold"
                                >
                                  Dar Baixa (Pago)
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>
                                    Confirmar Recebimento de Pagamento
                                  </DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                  <p className="text-sm text-slate-600">
                                    Para confirmar a baixa, digite o código de
                                    referência da fatura:{' '}
                                    <strong className="text-slate-900">
                                      {inv.reference_number}
                                    </strong>
                                  </p>
                                  <Label>Código Ref.</Label>
                                  <Input
                                    placeholder="Ex: INV-2024-..."
                                    value={refInput}
                                    onChange={(e) =>
                                      setRefInput(e.target.value)
                                    }
                                  />
                                </div>
                                <DialogFooter>
                                  <Button
                                    disabled={refInput !== inv.reference_number}
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
                                onClick={() => setSelectedInvoice(inv)}
                              >
                                Ver Detalhes
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>
                                  Detalhes da Fatura (
                                  {selectedInvoice?.reference_number})
                                </DialogTitle>
                              </DialogHeader>
                              {selectedInvoice?.ad_advertisers && (
                                <div className="space-y-4">
                                  <div className="border-b pb-4">
                                    <p className="font-bold text-lg text-slate-800">
                                      {
                                        selectedInvoice.ad_advertisers
                                          .company_name
                                      }
                                    </p>
                                    <p className="text-sm text-slate-500">
                                      CNPJ/CPF:{' '}
                                      {selectedInvoice.ad_advertisers.tax_id}
                                    </p>
                                  </div>
                                  <div className="text-sm text-slate-600">
                                    <p className="font-semibold text-slate-800 mb-1">
                                      Endereço de Faturamento:
                                    </p>
                                    <p>
                                      {selectedInvoice.ad_advertisers.street},{' '}
                                      {
                                        selectedInvoice.ad_advertisers
                                          .address_number
                                      }
                                    </p>
                                    <p>
                                      {selectedInvoice.ad_advertisers.city} -{' '}
                                      {selectedInvoice.ad_advertisers.state},
                                      CEP: {selectedInvoice.ad_advertisers.zip}
                                    </p>
                                  </div>
                                  <div className="bg-slate-50 p-4 rounded-md border flex justify-between items-center mt-4">
                                    <div>
                                      <span className="font-bold block text-slate-800">
                                        Total Faturado
                                      </span>
                                      <span className="text-xs text-slate-500">
                                        Vencimento:{' '}
                                        {formatDate(
                                          selectedInvoice.due_date,
                                          'pt-BR',
                                        )}
                                      </span>
                                    </div>
                                    <span className="text-2xl font-bold text-primary">
                                      {formatCurrency(
                                        selectedInvoice.amount,
                                        'BRL',
                                      )}
                                    </span>
                                  </div>
                                  <div className="flex gap-2 justify-end pt-4">
                                    {selectedInvoice.status !== 'canceled' &&
                                      selectedInvoice.status !== 'paid' && (
                                        <Button
                                          variant="destructive"
                                          onClick={() => {
                                            updateInvoiceStatus(
                                              selectedInvoice.id,
                                              'canceled',
                                            )
                                            setSelectedInvoice(null)
                                          }}
                                        >
                                          Cancelar Fatura
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
                {invoices.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-slate-500 py-16"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="w-10 h-10 text-slate-300" />
                        <span className="text-lg font-medium text-slate-700">
                          Nenhuma fatura gerada.
                        </span>
                        <span>
                          Faturas são criadas automaticamente ao cadastrar um
                          novo anúncio pago.
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
