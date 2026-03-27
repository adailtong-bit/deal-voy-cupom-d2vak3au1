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
import { CheckCircle2, Download, Eye, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export function BillingHistoryTab({ franchiseId }: { franchiseId?: string }) {
  const { t } = useLanguage()
  const { partnerInvoices, companies, franchises, updatePartnerInvoiceStatus } =
    useCouponStore()

  const franchise = franchises.find((f) => f.id === franchiseId)
  const { formatCurrency, formatDate } = useRegionFormatting(franchise?.region)

  const historyInvoices = partnerInvoices
    .filter(
      (i) =>
        i.status === 'sent' ||
        i.status === 'paid' ||
        i.status === 'overdue' ||
        i.status === 'canceled',
    )
    .filter((i) => (franchiseId ? i.franchiseId === franchiseId : true))

  const getCompanyName = (id: string) =>
    companies.find((c) => c.id === id)?.name || id

  return (
    <Card className="w-full min-w-0 overflow-hidden shadow-sm border-slate-200">
      <CardHeader className="min-w-0 pb-4 border-b border-slate-100 bg-white">
        <CardTitle className="truncate text-lg sm:text-xl text-slate-800">
          {t('franchisee.billing.history_title', 'Histórico e Gestão')}
        </CardTitle>
        <CardDescription className="truncate text-slate-500">
          {t(
            'franchisee.billing.history_desc',
            'Acompanhamento de faturas enviadas, pagas e em atraso.',
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 w-full bg-white">
        <div className="w-full overflow-x-auto min-w-0 custom-scrollbar">
          <Table className="w-full min-w-[850px]">
            <TableHeader className="bg-slate-50/80">
              <TableRow>
                <TableHead className="whitespace-nowrap font-semibold text-slate-700 pl-4 sm:pl-6">
                  {t('franchisee.billing.reference', 'Referência')}
                </TableHead>
                <TableHead className="whitespace-nowrap font-semibold text-slate-700">
                  {t('franchisee.billing.partner', 'Parceiro')}
                </TableHead>
                <TableHead className="whitespace-nowrap font-semibold text-slate-700">
                  {t('franchisee.billing.due_date', 'Vencimento')}
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
              {historyInvoices.map((inv) => (
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
                    {formatDate(inv.dueDate)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap font-bold text-slate-800">
                    {formatCurrency(inv.totalCommission)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <Badge
                      variant={
                        inv.status === 'paid'
                          ? 'default'
                          : inv.status === 'overdue'
                            ? 'destructive'
                            : 'secondary'
                      }
                      className={cn(
                        'capitalize',
                        inv.status === 'paid' &&
                          'bg-emerald-500 hover:bg-emerald-600 text-white border-transparent',
                        inv.status === 'sent' &&
                          'bg-blue-100 text-blue-700 hover:bg-blue-200 border-transparent',
                        inv.status === 'canceled' &&
                          'bg-slate-100 text-slate-500 border-transparent',
                      )}
                    >
                      {inv.status === 'paid'
                        ? t('franchisee.billing.paid', 'Pago')
                        : inv.status === 'overdue'
                          ? t('franchisee.billing.overdue', 'Em Atraso')
                          : inv.status === 'sent'
                            ? t('franchisee.billing.sent', 'Enviado')
                            : t('franchisee.billing.canceled', 'Cancelado')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap pr-4 sm:pr-6 w-[1%]">
                    <div className="flex justify-end gap-1 sm:gap-2 items-center flex-nowrap shrink-0">
                      {inv.status !== 'paid' && inv.status !== 'canceled' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="shrink-0 h-8 px-2 sm:h-9 sm:px-3 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 font-semibold transition-colors"
                          onClick={() =>
                            updatePartnerInvoiceStatus(inv.id, 'paid')
                          }
                          title={t(
                            'franchisee.billing.mark_paid',
                            'Marcar como Pago',
                          )}
                        >
                          <CheckCircle2 className="h-4 w-4 sm:mr-1.5" />
                          <span className="hidden sm:inline">
                            {t('franchisee.billing.pay', 'Baixar')}
                          </span>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 h-8 w-8 sm:h-9 sm:w-9 text-slate-500 hover:text-primary hover:bg-primary/10 transition-colors"
                        title={t('common.download', 'Download PDF')}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 h-8 w-8 sm:h-9 sm:w-9 text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                        title={t('common.view', 'Visualizar')}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {historyInvoices.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-12 text-slate-500 font-medium"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
                        <AlertCircle className="h-6 w-6 text-slate-400" />
                      </div>
                      <p>
                        {t(
                          'franchisee.billing.no_history',
                          'Nenhuma fatura encontrada no histórico.',
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
    </Card>
  )
}
