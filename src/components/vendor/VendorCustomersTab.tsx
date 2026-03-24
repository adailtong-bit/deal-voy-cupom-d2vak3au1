import { useMemo } from 'react'
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
import { Mail, Phone } from 'lucide-react'

export function VendorCustomersTab({ company }: any) {
  const { validationLogs, users } = useCouponStore()
  const { formatDate } = useLanguage()

  const leads = useMemo(() => {
    const companyLogs = validationLogs.filter((l) => l.companyId === company.id)
    const uniqueUserIds = Array.from(
      new Set(companyLogs.map((l) => l.userId).filter(Boolean)),
    )

    return uniqueUserIds
      .map((uid) => {
        const user = users.find((u) => u.id === uid)
        const userLogs = companyLogs.filter((l) => l.userId === uid)
        const lastActivity = userLogs.sort(
          (a, b) =>
            new Date(b.validatedAt).getTime() -
            new Date(a.validatedAt).getTime(),
        )[0]

        return {
          id: uid,
          name:
            user?.name || lastActivity?.customerName || 'Cliente Desconhecido',
          email: user?.email || 'N/D',
          phone: user?.phone || 'N/D',
          redemptions: userLogs.length,
          lastActive: lastActivity?.validatedAt,
          lastCampaign: lastActivity?.couponTitle,
        }
      })
      .sort(
        (a, b) =>
          new Date(b.lastActive || 0).getTime() -
          new Date(a.lastActive || 0).getTime(),
      )
  }, [validationLogs, company.id, users])

  if (leads.length === 0) {
    return (
      <div className="text-center p-12 border border-dashed rounded-lg bg-white text-muted-foreground animate-fade-in-up">
        Nenhum lead encontrado no CRM. Aguarde os usuários resgatarem suas
        ofertas.
      </div>
    )
  }

  return (
    <div className="rounded-lg border bg-white shadow-sm overflow-hidden animate-fade-in-up">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead className="font-semibold text-slate-700">
              Nome do Cliente
            </TableHead>
            <TableHead className="font-semibold text-slate-700">
              Contato
            </TableHead>
            <TableHead className="font-semibold text-slate-700 text-center">
              Total de Resgates
            </TableHead>
            <TableHead className="font-semibold text-slate-700">
              Última Campanha Usada
            </TableHead>
            <TableHead className="font-semibold text-slate-700">
              Última Atividade
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow key={lead.id} className="hover:bg-slate-50/50">
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
                      Sem contato
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
  )
}
