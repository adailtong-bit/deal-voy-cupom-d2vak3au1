import { useState, useMemo } from 'react'
import { useCouponStore } from '@/stores/CouponContext'
import { useLanguage } from '@/stores/LanguageContext'
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
  DialogDescription,
} from '@/components/ui/dialog'
import { Mail, Phone } from 'lucide-react'

export function VendorCustomersTab({ company }: any) {
  const { validationLogs, users, coupons } = useCouponStore()
  const { formatDate, t } = useLanguage()
  const [selectedLead, setSelectedLead] = useState<any>(null)

  const leads = useMemo(() => {
    const companyLogs = validationLogs.filter((l) => l.companyId === company.id)
    const uniqueUserIds = Array.from(
      new Set(companyLogs.map((l) => l.userId).filter(Boolean)),
    )

    return uniqueUserIds
      .map((uid) => {
        const user = users.find((u) => u.id === uid)
        const userLogs = companyLogs.filter((l) => l.userId === uid)

        const history = userLogs
          .sort(
            (a, b) =>
              new Date(b.validatedAt).getTime() -
              new Date(a.validatedAt).getTime(),
          )
          .map((l) => {
            const cpn = coupons.find((c) => c.id === l.couponId)
            return {
              ...l,
              category: cpn?.category || 'Outros',
            }
          })

        const lastActivity = history[0]

        const cats = history.reduce(
          (acc, curr) => {
            acc[curr.category] = (acc[curr.category] || 0) + 1
            return acc
          },
          {} as Record<string, number>,
        )
        const topCategory =
          Object.entries(cats).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] ||
          'N/A'

        return {
          id: uid,
          name:
            user?.name || lastActivity?.customerName || 'Cliente Desconhecido',
          email: user?.email || 'N/D',
          phone: user?.phone || 'N/D',
          redemptions: userLogs.length,
          lastActive: lastActivity?.validatedAt,
          lastCampaign: lastActivity?.couponTitle,
          history,
          topCategory,
        }
      })
      .sort(
        (a, b) =>
          new Date(b.lastActive || 0).getTime() -
          new Date(a.lastActive || 0).getTime(),
      )
  }, [validationLogs, company.id, users, coupons])

  if (leads.length === 0) {
    return (
      <div className="text-center p-12 border border-dashed rounded-lg bg-white text-muted-foreground animate-fade-in-up">
        {t(
          'vendor.customers_tab.empty',
          'Nenhum lead encontrado no CRM. Aguarde os usuários resgatarem suas ofertas.',
        )}
      </div>
    )
  }

  return (
    <>
      <div className="rounded-lg border bg-white shadow-sm overflow-hidden animate-fade-in-up">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-semibold text-slate-700">
                {t('vendor.customers_tab.name', 'Nome do Cliente')}
              </TableHead>
              <TableHead className="font-semibold text-slate-700">
                {t('vendor.customers_tab.contact', 'Contato')}
              </TableHead>
              <TableHead className="font-semibold text-slate-700 text-center">
                {t(
                  'vendor.customers_tab.total_redemptions',
                  'Total de Resgates',
                )}
              </TableHead>
              <TableHead className="font-semibold text-slate-700">
                {t(
                  'vendor.customers_tab.last_campaign',
                  'Última Campanha Usada',
                )}
              </TableHead>
              <TableHead className="font-semibold text-slate-700">
                {t('vendor.customers_tab.last_active', 'Última Atividade')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((lead) => (
              <TableRow
                key={lead.id}
                className="hover:bg-slate-50/50 cursor-pointer transition-colors"
                onClick={() => setSelectedLead(lead)}
              >
                <TableCell className="font-semibold text-slate-900">
                  {lead.name}
                </TableCell>
                <TableCell>
                  <div className="text-xs text-slate-600 space-y-1.5 font-medium">
                    {lead.email !== 'N/D' && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />{' '}
                        {lead.email}
                      </div>
                    )}
                    {lead.phone !== 'N/D' && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />{' '}
                        {lead.phone}
                      </div>
                    )}
                    {lead.email === 'N/D' && lead.phone === 'N/D' && (
                      <span className="text-slate-400 italic font-normal">
                        {t('vendor.customers_tab.no_contact', 'Sem contato')}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <span className="inline-flex items-center justify-center bg-primary/10 text-primary font-bold h-7 w-7 rounded-full text-xs">
                    {lead.redemptions}
                  </span>
                </TableCell>
                <TableCell className="text-slate-700 text-sm max-w-[200px] truncate font-medium">
                  {lead.lastCampaign}
                </TableCell>
                <TableCell className="text-slate-500 text-sm">
                  {lead.lastActive ? formatDate(lead.lastActive) : 'N/D'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={!!selectedLead}
        onOpenChange={(open) => !open && setSelectedLead(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Perfil de Consumo</DialogTitle>
            <DialogDescription>
              Detalhes do lead e histórico de interação com sua loja.
            </DialogDescription>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-6 py-2">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                  {selectedLead.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800">
                    {selectedLead.name}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {selectedLead.email !== 'N/D'
                      ? selectedLead.email
                      : selectedLead.phone}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 shadow-sm">
                  <p className="text-xs text-slate-500 font-medium mb-1">
                    Total de Resgates
                  </p>
                  <p className="text-xl font-bold text-slate-800">
                    {selectedLead.redemptions}
                  </p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 shadow-sm">
                  <p className="text-xs text-slate-500 font-medium mb-1">
                    Categoria Favorita
                  </p>
                  <p className="text-lg font-bold text-slate-800 truncate">
                    {selectedLead.topCategory}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-slate-700 mb-3">
                  Histórico de Ofertas Usadas
                </h4>
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                  {selectedLead.history.map((h: any) => (
                    <div
                      key={h.id}
                      className="flex justify-between items-center p-2.5 bg-white border border-slate-100 rounded-lg shadow-sm"
                    >
                      <div className="overflow-hidden">
                        <p className="font-medium text-sm text-slate-800 truncate">
                          {h.couponTitle}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {h.category}
                        </p>
                      </div>
                      <span className="text-xs font-medium text-slate-400 whitespace-nowrap ml-3">
                        {formatDate(h.validatedAt)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-[11px] text-slate-500 text-center bg-slate-50 p-2 rounded">
                Use estas informações para criar Grupos Alvo segmentados.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
