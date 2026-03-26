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
import { Mail, Phone, MapPin, User as UserIcon, Calendar } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const calculateAge = (birthday?: string) => {
  if (!birthday) return null
  const birthDate = new Date(birthday)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const m = today.getMonth() - birthDate.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}

export function VendorCustomersTab({ company }: any) {
  const { validationLogs, users, coupons } = useCouponStore()
  const { formatDate, t } = useLanguage()
  const [selectedLead, setSelectedLead] = useState<any>(null)

  const genderMap: Record<string, string> = {
    male: t('vendor.customers_tab.male', 'Masculino'),
    female: t('vendor.customers_tab.female', 'Feminino'),
    'non-binary': t('vendor.customers_tab.non_binary', 'Não-binário'),
    other: t('vendor.customers_tab.other', 'Outros'),
    'prefer-not-to-say': 'N/D',
  }

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
          gender: user?.gender ? genderMap[user.gender] || user.gender : 'N/D',
          age: calculateAge(user?.birthday),
          location:
            user?.city && user?.state
              ? `${user.city}, ${user.state}`
              : user?.state || user?.city || 'N/D',
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
  }, [validationLogs, company.id, users, coupons, t])

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
              <TableHead className="font-semibold text-slate-700">
                {t('vendor.customers_tab.profile', 'Perfil (Demográfico)')}
              </TableHead>
              <TableHead className="font-semibold text-slate-700">
                {t('vendor.customers_tab.location', 'Localização')}
              </TableHead>
              <TableHead className="font-semibold text-slate-700 text-center">
                {t('vendor.customers_tab.total_redemptions', 'Resgates')}
              </TableHead>
              <TableHead className="font-semibold text-slate-700">
                {t('vendor.customers_tab.last_campaign', 'Última Atividade')}
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
                <TableCell>
                  <div className="flex flex-col gap-1.5 items-start">
                    <Badge
                      variant="outline"
                      className="bg-slate-50 text-[10px] uppercase font-bold tracking-wider text-slate-600 border-slate-200"
                    >
                      <UserIcon className="w-3 h-3 mr-1" /> {lead.gender}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="bg-slate-50 text-[10px] uppercase font-bold tracking-wider text-slate-600 border-slate-200"
                    >
                      <Calendar className="w-3 h-3 mr-1" />{' '}
                      {lead.age !== null
                        ? `${lead.age} ${t('common.years', 'anos')}`
                        : 'N/D'}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 text-sm text-slate-600 font-medium">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <span
                      className="truncate max-w-[120px]"
                      title={lead.location}
                    >
                      {lead.location}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <span className="inline-flex items-center justify-center bg-primary/10 text-primary font-bold h-7 w-7 rounded-full text-xs">
                    {lead.redemptions}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-slate-700 text-sm max-w-[160px] truncate font-medium">
                      {lead.lastCampaign}
                    </span>
                    <span className="text-slate-500 text-xs mt-0.5">
                      {lead.lastActive ? formatDate(lead.lastActive) : 'N/D'}
                    </span>
                  </div>
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
            <DialogTitle>
              {t(
                'vendor.customers_tab.consumption_profile',
                'Perfil de Consumo',
              )}
            </DialogTitle>
            <DialogDescription>
              {t(
                'vendor.customers_tab.consumption_profile_desc',
                'Detalhes do lead e histórico de interação com sua loja.',
              )}
            </DialogDescription>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-6 py-2">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl shrink-0">
                  {selectedLead.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-lg text-slate-800 truncate">
                    {selectedLead.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <Badge
                      variant="secondary"
                      className="text-[10px] bg-slate-100 text-slate-600 hover:bg-slate-100 uppercase tracking-wider font-bold"
                    >
                      <UserIcon className="w-3 h-3 mr-1" />{' '}
                      {selectedLead.gender}
                    </Badge>
                    {selectedLead.age !== null && (
                      <Badge
                        variant="secondary"
                        className="text-[10px] bg-slate-100 text-slate-600 hover:bg-slate-100 uppercase tracking-wider font-bold"
                      >
                        <Calendar className="w-3 h-3 mr-1" /> {selectedLead.age}{' '}
                        {t('common.years', 'anos')}
                      </Badge>
                    )}
                    {selectedLead.location !== 'N/D' && (
                      <Badge
                        variant="secondary"
                        className="text-[10px] bg-slate-100 text-slate-600 hover:bg-slate-100 uppercase tracking-wider font-bold truncate max-w-[150px]"
                        title={selectedLead.location}
                      >
                        <MapPin className="w-3 h-3 mr-1" />{' '}
                        {selectedLead.location}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 shadow-sm">
                  <p className="text-xs text-slate-500 font-medium mb-1">
                    {t(
                      'vendor.customers_tab.total_redemptions',
                      'Total de Resgates',
                    )}
                  </p>
                  <p className="text-xl font-bold text-slate-800">
                    {selectedLead.redemptions}
                  </p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 shadow-sm">
                  <p className="text-xs text-slate-500 font-medium mb-1">
                    {t(
                      'vendor.customers_tab.favorite_category',
                      'Categoria Favorita',
                    )}
                  </p>
                  <p
                    className="text-lg font-bold text-slate-800 truncate"
                    title={selectedLead.topCategory}
                  >
                    {selectedLead.topCategory}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-slate-700 mb-3">
                  {t(
                    'vendor.customers_tab.history_title',
                    'Histórico de Ofertas Usadas',
                  )}
                </h4>
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                  {selectedLead.history.map((h: any) => (
                    <div
                      key={h.id}
                      className="flex justify-between items-center p-2.5 bg-white border border-slate-100 rounded-lg shadow-sm"
                    >
                      <div className="overflow-hidden pr-2">
                        <p className="font-medium text-sm text-slate-800 truncate">
                          {h.couponTitle}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {h.category}
                        </p>
                      </div>
                      <span className="text-xs font-medium text-slate-400 whitespace-nowrap">
                        {formatDate(h.validatedAt)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-[11px] text-slate-500 text-center bg-slate-50 p-2 rounded">
                {t(
                  'vendor.customers_tab.use_for_target_groups',
                  'Use estas informações para criar Grupos Alvo segmentados na guia CRM.',
                )}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
