import { useState, useMemo } from 'react'
import { useCouponStore } from '@/stores/CouponContext'
import { useLanguage } from '@/stores/LanguageContext'
import { useRegionFormatting } from '@/hooks/useRegionFormatting'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users, Target, BarChart3, Megaphone } from 'lucide-react'
import { LeadsProfileTab } from './crm/LeadsProfileTab'
import { TargetGroupsTab } from './crm/TargetGroupsTab'
import { CommunicationCampaignsTab } from './crm/CommunicationCampaignsTab'

export function AdminCRM({ franchiseId }: { franchiseId?: string }) {
  const { users, validationLogs, companies, franchises } = useCouponStore()
  const { t } = useLanguage()

  const franchise = franchises.find((f) => f.id === franchiseId)
  const { formatNumber } = useRegionFormatting(franchise?.region)

  const displayCompanies = franchiseId
    ? companies.filter((c) => c.franchiseId === franchiseId)
    : companies
  const companyIds = displayCompanies.map((c) => c.id)

  const displayLogs = franchiseId
    ? validationLogs.filter(
        (l) => l.companyId && companyIds.includes(l.companyId),
      )
    : validationLogs
  const userIds = new Set(displayLogs.map((l) => l.userId))

  const displayUsers = franchiseId
    ? users.filter((u) => userIds.has(u.id))
    : users

  const totalRedemptions = displayLogs.length
  const activeUsersCount = displayUsers.filter((u) => {
    const userLogs = displayLogs.filter((log) => log.userId === u.id)
    return userLogs.length > 0
  }).length

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-full text-blue-600">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t('franchisee.crm.total_users', 'Total de Usuários')}
              </p>
              <h3 className="text-2xl font-bold">
                {formatNumber(displayUsers.length)}
              </h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-full text-green-600">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t('franchisee.crm.active_users', 'Usuários Ativos')}
              </p>
              <h3 className="text-2xl font-bold">
                {formatNumber(activeUsersCount)}
              </h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-full text-purple-600">
              <Target className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t('franchisee.crm.total_redemptions', 'Total de Resgates')}
              </p>
              <h3 className="text-2xl font-bold">
                {formatNumber(totalRedemptions)}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="profiles" className="w-full">
        <TabsList className="mb-4 flex flex-wrap h-auto p-1 bg-slate-100">
          <TabsTrigger value="profiles" className="py-2.5 px-4 font-semibold">
            <Users className="h-4 w-4 mr-2" /> Perfis & Leads
          </TabsTrigger>
          <TabsTrigger value="groups" className="py-2.5 px-4 font-semibold">
            <Target className="h-4 w-4 mr-2 text-primary" /> Segmentação (Alvos)
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="py-2.5 px-4 font-semibold">
            <Megaphone className="h-4 w-4 mr-2 text-orange-500" /> Disparos
            (Push/SMS/Email)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profiles" className="mt-0">
          <LeadsProfileTab franchiseId={franchiseId} />
        </TabsContent>

        <TabsContent value="groups" className="mt-0">
          <TargetGroupsTab franchiseId={franchiseId} />
        </TabsContent>

        <TabsContent value="campaigns" className="mt-0">
          <CommunicationCampaignsTab franchiseId={franchiseId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
