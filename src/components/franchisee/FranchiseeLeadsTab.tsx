import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useLanguage } from '@/stores/LanguageContext'
import { useRegionFormatting } from '@/hooks/useRegionFormatting'
import { useCouponStore } from '@/stores/CouponContext'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Mail, Phone } from 'lucide-react'

export function FranchiseeLeadsTab({ franchiseId }: { franchiseId: string }) {
  const { t } = useLanguage()
  const { validationLogs, users, companies, franchises } = useCouponStore()
  const [searchParams] = useSearchParams()
  const searchQuery = (searchParams.get('q') || '').toLowerCase()

  const myFranchise = franchises.find((f) => f.id === franchiseId)
  const { formatDate } = useRegionFormatting(
    myFranchise?.region,
    myFranchise?.addressCountry,
  )

  const franchiseCompanies = useMemo(
    () =>
      myFranchise
        ? companies.filter((c) => c.franchiseId === myFranchise.id)
        : [],
    [companies, myFranchise?.id],
  )
  const franchiseCompanyIds = useMemo(
    () => franchiseCompanies.map((c) => c.id),
    [franchiseCompanies],
  )

  const franchiseLogs = useMemo(
    () =>
      validationLogs.filter((log) =>
        franchiseCompanyIds.includes(log.companyId || ''),
      ),
    [validationLogs, franchiseCompanyIds],
  )

  const leadsList = useMemo(() => {
    return franchiseLogs
      .map((log) => {
        const u = users.find((user) => user.id === log.userId)
        return {
          id: log.id,
          customerName:
            u?.name ||
            log.customerName ||
            t('franchisee.leads.counter', 'Cliente Balcão'),
          email: u?.email || 'N/A',
          phone: u?.phone || 'N/A',
          campaignName: log.couponTitle,
          storeName:
            companies.find((c) => c.id === log.companyId)?.name || 'Loja',
          acquiredAt: log.validatedAt,
        }
      })
      .filter((lead) => {
        if (!searchQuery) return true
        return (
          lead.customerName.toLowerCase().includes(searchQuery) ||
          lead.email.toLowerCase().includes(searchQuery) ||
          lead.phone.toLowerCase().includes(searchQuery) ||
          lead.campaignName.toLowerCase().includes(searchQuery) ||
          lead.storeName.toLowerCase().includes(searchQuery)
        )
      })
      .sort(
        (a, b) =>
          new Date(b.acquiredAt).getTime() - new Date(a.acquiredAt).getTime(),
      )
  }, [franchiseLogs, users, companies, t, searchQuery])

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">
          {t('franchisee.leads.title', 'Leads Regionais')}
        </h2>
        <p className="text-muted-foreground">
          {t(
            'franchisee.leads.desc',
            'Clientes que interagiram com ofertas dos seus lojistas.',
          )}
        </p>
      </div>
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>
                  {t('franchisee.leads.customer', 'Cliente')}
                </TableHead>
                <TableHead>
                  {t('franchisee.leads.contact', 'Contato')}
                </TableHead>
                <TableHead>
                  {t('franchisee.leads.campaign', 'Campanha Utilizada')}
                </TableHead>
                <TableHead>
                  {t('franchisee.leads.merchant', 'Lojista')}
                </TableHead>
                <TableHead>{t('franchisee.leads.date', 'Data')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leadsList.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium text-slate-900">
                    {lead.customerName}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 text-sm text-slate-600">
                      {lead.email !== 'N/A' && (
                        <span className="flex items-center gap-1.5">
                          <Mail className="h-3 w-3 text-slate-400" />{' '}
                          {lead.email}
                        </span>
                      )}
                      {lead.phone !== 'N/A' && (
                        <span className="flex items-center gap-1.5">
                          <Phone className="h-3 w-3 text-slate-400" />{' '}
                          {lead.phone}
                        </span>
                      )}
                      {lead.email === 'N/A' && lead.phone === 'N/A' && (
                        <span className="text-slate-400 italic">
                          {t('franchisee.leads.not_informed', 'Não informado')}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-slate-50">
                      {lead.campaignName}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-700 font-medium">
                    {lead.storeName}
                  </TableCell>
                  <TableCell className="text-slate-500 text-sm whitespace-nowrap">
                    {formatDate(lead.acquiredAt)}
                  </TableCell>
                </TableRow>
              ))}
              {leadsList.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-slate-500"
                  >
                    {t(
                      'franchisee.leads.no_leads',
                      'Nenhum lead capturado ainda.',
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
